import jwt from "jsonwebtoken";
import { EntityId } from "redis-om";
import { Server, Socket } from "socket.io";

import mongooseModels from "./mongoose/models";
import redisSchemas from "./redis-om/schemas";
import { ytInfoService } from "./routers/ytRouter";
import { getCountryFromIP } from "./services/geoLocationService";
import {
	ClientToServerEvents,
	InterServerEvents,
	Message,
	Room,
	ServerToClientEvents,
} from "./types";
import { logger } from "./logger";
import mongoose from "mongoose";

// const memberRepository = redisSchemas.member;
const roomRepository = redisSchemas.room;
const User = mongooseModels.User;

interface CustomSocket extends Socket {
	user?: { _id: string; country: string };
	roomId?: string;
}
type CustomIO = Server<
	ClientToServerEvents,
	ServerToClientEvents,
	InterServerEvents
>;

export default function socketServer(io: CustomIO) {
	// disconnect all members and sockets
	initializeSocketServer(io);
	// auth middleware
	io.use(async (socket: CustomSocket, next) => {
		try {
			const token = socket.handshake?.query?.token;
			logger.info(`socket-middleware, token: ${token}`);

			if (typeof token !== "string" || !token) {
				logger.info("socket-middleware, no token provided");
				return next(new Error("Authentication error no token provided"));
			}
			const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY || "") as {
				_id: string;
			};
			if (mongoose.isValidObjectId(decoded?._id)) {
				const forwarded = socket.handshake.headers["x-forwarded-for"] as string;
				const ipAddress = forwarded
					? forwarded.split(",")[0]
					: socket.handshake.address;

				const countryISO = await getCountryFromIP(ipAddress);

				const user = await User.findById(decoded._id);
				if (user) {
					user.country = countryISO;
					user.socketId = socket.id;
					await user.save();
				}
				socket.user = {
					_id: decoded._id,
					country: countryISO,
				};

				next();
			} else {
				logger.info("socket-middleware, invalid token...");
				next(new Error("Authentication error invalid token"));
			}
		} catch (error) {
			logger.info(`socket-middleware, error: ${error}`);
			next(new Error("Authentication error in middleware: " + error));
		}
	});

	io.on("connection", (socket: CustomSocket) => {
		socket.on("joinRoom", async (roomId) => {
			if (!roomId) {
				logger.info("joinRoom, roomId not provided");
				socket.emit("stateError", "roomId not provided");
				return;
			}
			socket.roomId = roomId;
			await joinRoom(roomId);
		});
		socket.on("giveLeader", async (targetMember) => {
			if (!socket?.roomId) {
				socket.emit("stateError", "roomId not found on socket");
				return;
			}
			await giveLeader(targetMember);
		});
		socket.on("sendMessage", (msg) => {
			if (msg.length > 512) {
				socket.emit("stateError", "message too long");
				return;
			}
			const roomId = socket?.roomId;
			if (!roomId) {
				socket.emit("stateError", "roomId not found on socket");
				return;
			}
			// check types/index.ts for details
			io.in(roomId).emit("message", [0, socket.user?._id!, Date.now(), msg]);
		});

		socket.on("mic", async (micstr) => {
			if (!micstr) {
				socket.emit("stateError", "micstr not provided");
				return;
			}
			if (!socket?.roomId) {
				socket.emit("stateError", "roomId not found on socket");
				return;
			}
			// micstr = "targetmember,reqtype"
			const [targetMember, reqtype] = micstr.split(",");
			await enableDisableMic(targetMember, reqtype);
		});
		socket.on("kickMember", async (targetMember) => {
			if (!targetMember) {
				socket.emit("stateError", "targetMember not provided");
				return;
			}
			if (!socket?.roomId) {
				socket.emit("stateError", "roomId not found on socket");
				return;
			}
			await kickMember(targetMember);
		});
		socket.on("leaveRoom", async () => {
			await makeMemberLeave();
		});
		socket.on("disconnect", async () => {
			await makeMemberLeave();
		});

		// functions
		async function joinRoom(roomId: string) {
			try {
				logger.info(`joinRoom roomId: ${roomId}`);
				const room = await roomRepository.fetch(roomId);
				// logger.info("joinRoom", "room: ", room);
				if (!room || !room.activeMembersList) {
					socket.emit("stateError", "Room not found");
					return;
				}
				if (room.kicked.includes(socket.user?._id!)) {
					socket.emit("stateError", "You have been kicked from this room");
					return;
				}
				room.countries.push(socket.user?.country!);
				// room.countries = [...new Set(room.countries)];
				room.countries = Array.from(new Set(room.countries));
				const { membersJoinedMongoIds } = splitMembersAndMicsArray(room);
				if (membersJoinedMongoIds.includes(socket.user?._id!)) {
					room.activeMembersList?.push(socket.user?._id!);
					// room.activeMembersList = [...new Set(room.activeMembersList)];
					room.activeMembersList = Array.from(new Set(room.activeMembersList));
					room.activeMembersCount = room.activeMembersList?.length;
					sortActiveMembers(room.membersJoinedList!, room?.activeMembersList);
					await roomRepository.save(room);
					sendActiveMemberListUpdate(room, roomId);
					socket.join(roomId);
					io.in(roomId).emit("message", [1, socket.user?._id!, Date.now(), ""]);
					room.membersJoinedList = [];
					socket.emit("roomDesc", room);
				} else {
					room.membersJoinedList?.push(
						socket.user!._id + (room.roomMic ? ",1" : ",0"),
					);
					room.activeMembersList?.push(socket.user!._id);
					// room.activeMembersList = [...new Set(room.activeMembersList)];
					room.activeMembersList = Array.from(new Set(room.activeMembersList));
					room.activeMembersCount = room.activeMembersList?.length;
					sortActiveMembers(room?.membersJoinedList!, room?.activeMembersList!);
					await roomRepository.save(room);
					sendActiveMemberListUpdate(room, roomId);
					socket.join(roomId);
					io.in(roomId).emit("message", [1, socket.user?._id!, Date.now(), ""]);
					room.membersJoinedList = [];
					socket.emit("roomDesc", room);
				}
			} catch (error) {
				logger.info(`joinRoom error while joining room ${error}`);
				socket.emit("stateError", "couldn't join room");
			}
		}

		async function makeMemberLeave() {
			const roomId = socket.roomId;
			if (!roomId) {
				socket.emit("stateError", "no roomId found");
				return;
			}
			const room = await roomRepository.fetch(roomId);
			if (!room.activeMembersList?.includes(socket.user?._id!)) {
				return;
			}
			room.activeMembersList = room.activeMembersList?.filter(
				(member) => member !== socket.user?._id,
			);
			// room.activeMembersList = [...new Set(room.activeMembersList)];
			room.activeMembersList = Array.from(new Set(room.activeMembersList));
			room.activeMembersCount = room.activeMembersList?.length;
			room.membersJoinedList?.forEach((member, index) => {
				if (member.startsWith(room.activeMembersList![0])) {
					room.membersJoinedList![index] = member.split(",")[0] + ",1";
				}
			});
			await roomRepository.save(room);
			if (room?.activeMembersList.length > 0) {
				sendActiveMemberListUpdate(room, roomId);
				const newLeader = await User.findById(room?.activeMembersList[0]);
				const socketId = newLeader?.socketId;
				if (socketId) {
					io.to(socketId).emit("message", [4, newLeader._id, Date.now(), ""]);
				}
				io.in(roomId).emit("message", [2, socket.user?._id!, Date.now(), ""]);
			}
			socket.disconnect();
		}

		async function giveLeader(targetMemberMongoId: string) {
			if (!socket.roomId) {
				return socket.emit("stateError", "No roomId found");
			}

			const room = await roomRepository.fetch(socket.roomId);
			if (!room) {
				return socket.emit("stateError", "Room not found");
			}

			const activeMembers = room.activeMembersList || [];
			if (activeMembers.length < 1) {
				return socket.emit("stateError", "Empty room");
			}

			if (!activeMembers.includes(targetMemberMongoId)) {
				return socket.emit("stateError", "Target member not in the room");
			}

			const currentLeader = activeMembers[0];
			if (currentLeader !== socket.user?._id) {
				return socket.emit("stateError", "You are not the leader");
			}

			transferLeadership(
				room.membersJoinedList!,
				currentLeader,
				targetMemberMongoId,
			);

			sortActiveMembers(room.membersJoinedList!, room.activeMembersList!);
			room.membersJoinedList?.forEach((member, index) => {
				if (member.startsWith(room.activeMembersList![0])) {
					room.membersJoinedList![index] = member.split(",")[0] + ",1";
				}
			});
			await roomRepository.save(room);
			// Notify all clients in the room about the updated room description
			room.activeMembersList?.push(
				splitMembersAndMicsArray(room).activeMembersMics.join(""),
			);
			room.membersJoinedList = [];
			io.in(socket.roomId).emit("roomDesc", room);
			const newLeader = await User.findById(room?.activeMembersList![0]);
			const socketId = newLeader?.socketId;
			if (socketId) {
				io.to(socketId).emit("message", [4, newLeader._id, Date.now(), ""]);
			}
		}

		async function kickMember(targetMemberMongoId: string) {
			const roomId = socket.roomId;
			if (!roomId) {
				return socket.emit("stateError", "roomId not found on socket");
			}
			const room = await roomRepository.fetch(roomId);
			if (!room) {
				return socket.emit("stateError", "Room not found");
			}
			const activeMembers = room.activeMembersList || [];
			if (activeMembers.length < 1) {
				return socket.emit("stateError", "Empty room");
			}
			if (!activeMembers.includes(targetMemberMongoId)) {
				return socket.emit("stateError", "Target member not in the room");
			}
			const currentLeader = activeMembers[0];
			if (currentLeader !== socket.user?._id) {
				return socket.emit("stateError", "You are not the leader");
			}
			if (room.kicked.includes(targetMemberMongoId)) {
				return socket.emit("stateError", "Member already kicked");
			}
			executeKickMember(room, targetMemberMongoId);
			sortActiveMembers(room.membersJoinedList!, room.activeMembersList!);
			await roomRepository.save(room);
			const targetUser = await User.findById(targetMemberMongoId);
			io.to(targetUser?.socketId!).emit("onKicked", "You have been kicked");
			sendActiveMemberListUpdate(room, roomId);
			io.in(roomId).emit("message", [1, socket.user?._id!, Date.now(), ""]);
			io.in(roomId).emit("message", [3, socket.user?._id!, Date.now(), ""]);
		}

		async function enableDisableMic(targetMember: string, reqtype: string) {
			const roomId = socket.roomId;
			if (!roomId) {
				return socket.emit("stateError", "roomId not found");
			}
			const room = await roomRepository.fetch(roomId);
			if (!room) {
				return socket.emit("stateError", "room not found");
			}
			if (!room.activeMembersList || room.activeMembersList.length < 1) {
				return socket.emit("stateError", "Empty room");
			}

			if (!room.activeMembersList.includes(targetMember)) {
				return socket.emit("stateError", "Target member not in the room");
			}

			if (room.activeMembersList[0] !== socket.user?._id) {
				return socket.emit("stateError", "You are not the leader");
			}
			if (reqtype == "1") {
				room.membersJoinedList!.forEach((id, i) => {
					const [key, value] = id.split(",");
					if (key === targetMember) {
						room.membersJoinedList![i] = `${key},1`;
					}
				});
			} else if (reqtype == "0") {
				room.membersJoinedList!.forEach((id, i) => {
					const [key, value] = id.split(",");
					if (key === targetMember) {
						room.membersJoinedList![i] = `${key},0`;
					}
				});
			}
			const targetUser = await User.findById(targetMember);

			await roomRepository.save(room);
			sendActiveMemberListUpdate(room, roomId);
			if (targetUser?.socketId) {
				reqtype == "0"
					? io
							.to(targetUser.socketId)
							.emit("message", [6, socket.user?._id!, Date.now(), ""])
					: io
							.to(targetUser.socketId)
							.emit("message", [5, socket.user?._id!, Date.now(), ""]);
			}
		}

		function sendActiveMemberListUpdate(room: Room, roomId: string) {
			room.activeMembersList?.push(
				splitMembersAndMicsArray(room).activeMembersMics.join(""),
			);
			io.in(roomId).emit("activeMemberListUpdate", room.activeMembersList!);
		}
	});
}
const initializeSocketServer = async (io: CustomIO) => {
	logger.info("initializeSocketServer, initializing socket server...");
	io.disconnectSockets();
};

export function sortActiveMembers(
	membersJoinedList: string[],
	activeMembersList: string[],
): string[] {
	const mongoIds = membersJoinedList.map((member) => member.split(",")[0]);

	return activeMembersList.sort((a, b) => {
		return mongoIds.indexOf(a) - mongoIds.indexOf(b);
	});
}

export function convertMembersArrayToObjects(
	arr: string[],
): { mongoId: string; mic: boolean }[] {
	return arr.map((item) => {
		const [mongoId, mic] = item.split(",");
		return {
			mongoId: mongoId,
			mic: mic === "1", // Convert to boolean (true if '1', false otherwise)
		};
	});
}

export function splitMembersAndMicsArray(input: Room) {
	const { membersJoinedList, activeMembersList } = input;

	const membersJoinedMongoIds: string[] = [];
	const membersJoinedMics: string[] = [];

	if (!membersJoinedList) {
		return {
			membersJoinedMongoIds: [],
			membersJoinedMics: [],
			activeMembersMics: [],
		};
	}
	membersJoinedList.forEach((member) => {
		const [mongoId, micStatus] = member.split(",");
		membersJoinedMongoIds.push(mongoId);
		membersJoinedMics.push(micStatus);
	});
	if (!activeMembersList) {
		return {
			membersJoinedMongoIds,
			membersJoinedMics,
			activeMembersMics: [],
		};
	}

	const activeMembersMics = activeMembersList.map((activeMember) => {
		const index = membersJoinedMongoIds.indexOf(activeMember);
		return membersJoinedMics[index];
	});

	return {
		membersJoinedMongoIds,
		membersJoinedMics,
		activeMembersMics,
	};
}

function transferLeadership(
	membersJoinedList: string[],
	leaderId: string,
	targetMemberId: string,
): string[] {
	// Helper function to split the string into ID and mic status
	function parseMember(member: string) {
		const [id, micStatus] = member.split(",");
		return { id, micStatus };
	}

	// Find the leader and targetMember's full data (ID + micStatus)
	const leaderIndex = membersJoinedList.findIndex(
		(member) => parseMember(member).id === leaderId,
	);
	const targetIndex = membersJoinedList.findIndex(
		(member) => parseMember(member).id === targetMemberId,
	);

	// Ensure the leader is at a lower index than the targetMember
	if (leaderIndex < 0 || targetIndex < 0 || leaderIndex >= targetIndex) {
		throw new Error("Invalid indices or items");
	}

	// Get the target member's details (ID and mic status)
	const targetMember = membersJoinedList[targetIndex];

	// Remove the targetMember from the higher index
	membersJoinedList.splice(targetIndex, 1);

	// Insert the targetMember at the position of the leader
	membersJoinedList.splice(leaderIndex, 0, targetMember);

	return membersJoinedList;
}

function executeKickMember(room: Room, targetMemberId: string) {
	room.kicked.push(targetMemberId);
	room.membersJoinedList = room.membersJoinedList?.filter(
		(member) => member.split(",")[0] !== targetMemberId,
	);
	room.activeMembersList = room.activeMembersList?.filter(
		(member) => member !== targetMemberId,
	);
	room.invitedMembersList = room.invitedMembersList?.filter(
		(member) => member !== targetMemberId,
	);
	room.activeMembersCount = room.activeMembersList?.length || 0;
	return room;
}

export async function makeRoom(userId: string, url: string) {
	// logger.info("makeRoom", "url: ", url);

	const videoInfo = await ytInfoService(url);
	if (!videoInfo) {
		return null;
	}
	const userIDandMic = userId + ",1";
	const room = await roomRepository.save({
		privacy: 0, // public(0), private(1), friends(2)
		playback: 0, // voting(0), justPlay(1), autoPlay(2), leaderChoice(3)
		roomMic: false,
		membersJoinedList: [userIDandMic],
		activeMembersList: [userId],
		activeMembersCount: 1,
		countries: [],
		kicked: [],
		createdByMongoId: [String(userId)],
		createdAt: Date.now(),
		// searchKeywords: [videoInfo.title, user.handle, user.name].join(","),
		v_isPlaying: false,
		v_sourceUrl: url,
		v_thumbnailUrl: videoInfo.thumbnail,
		v_title: videoInfo.title,
		v_totalDuration: 0,
		v_playedTill: 0,
	});
	room.entityId = (room as any)[EntityId];
	room.activeMembersList!.push("1");
	return room;
}

// export async function returnRoomWithActiveMembersInOrder(roomId: string) {
//   const room = await roomRepository.fetch(roomId);
//   if (!room) {
//     return null;
//   }
//   room.entityId = (room as any)[EntityId];

//   const activeMembers = await memberRepository
//     .search()
//     .where("roomId")
//     .equals(roomId)
//     .and("isConnected")
//     .equals(true)
//     .sortBy("leaderPC")
//     .return.all();

//   room.members = activeMembers;

//   return room;
// }

// export const deleteInactiveRooms = async (prisma: PrismaClient) => {
//   const rooms = await prisma.room.findMany({
//     where: {
//       members: {
//         every: {
//           isConnected: false,
//         },
//       },
//     },
//   });
//   logger.info("deleteInactiveRooms", "found inactive rooms: ", rooms.length);

//   for (const room of rooms) {
//     logger.info("deleteInactiveRooms", "deleting inactive room: ", room.id);
//     await prisma.room.delete({
//       where: {
//         id: room.id,
//       },
//     });
//   }
// };
