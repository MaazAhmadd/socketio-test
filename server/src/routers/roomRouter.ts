import express, { Response } from "express";
import { EntityId } from "redis-om";
import { logger, makeRoute } from "../config";
import { PRIVACY_FRIENDS, PRIVACY_INVITED, PRIVACY_PUBLIC } from "../constants";
import mongooseModels from "../mongoose/models";
import redisSchemas from "../redis-om/schemas";
import { makeRoom } from "../socketServer";
import { authUser } from "../middlewares";
import { Room } from "../types";
const router = express.Router();

const roomRepository = redisSchemas.room;
const User = mongooseModels.User;

// get /room/userrooms
makeRoute(
	"get",
	"/room/userrooms",
	[authUser],
	router,
	async function (req, res) {
		// Pagination setup
		const pageNumber = Number.isNaN(Number(req.query.pageNumber))
			? 1
			: Number(req.query.pageNumber);
		const pageSize = 20;
		const offset = (pageNumber - 1) * pageSize;

		// Fetch user
		const user = await User.findById(req.user!._id);
		if (!user) return res.status(404).send("User not found");

		const friendIds = user.friends.map((friend) => String(friend._id));
		let publicRoomsPromise: Promise<Room[]>;
		if (user.country) {
			publicRoomsPromise = roomRepository
				.search()
				.where("countries")
				.contain(String(user.country))
				.and("privacy")
				.eq(PRIVACY_PUBLIC)
				.and("activeMembersCount")
				.gte(1)
				.sortBy("activeMembersCount", "DESC")
				.return.page(offset, pageSize);
		} else {
			publicRoomsPromise = roomRepository
				.search()
				.and("privacy")
				.eq(PRIVACY_PUBLIC)
				.and("activeMembersCount")
				.gte(1)
				.sortBy("activeMembersCount", "DESC")
				.return.page(offset, pageSize);
		}
		let publicRoomsWithFriendsJoinedPromise = new Promise<Room[]>((resolve) =>
			resolve([]),
		);
		let friendsRoomsPromise = new Promise<Room[]>((resolve) => resolve([]));
		if (friendIds.length > 0) {
			// Query public rooms with friends joined
			publicRoomsWithFriendsJoinedPromise = roomRepository
				.search()
				.where("privacy")
				.eq(PRIVACY_PUBLIC)
				.and("activeMembersList")
				.containsOneOf(...friendIds)
				.sortBy("activeMembersCount", "DESC")
				.return.all();

			// Query friends' rooms
			friendsRoomsPromise = roomRepository
				.search()
				.where("privacy")
				.eq(PRIVACY_FRIENDS)
				.and("activeMembersCount")
				.gte(1)
				.and("createdByMongoId")
				.containsOneOf(...friendIds)
				.return.all();
		}
		// Query invited rooms
		const invitedRoomsPromise = roomRepository
			.search()
			.where("privacy")
			.eq(PRIVACY_INVITED)
			.and("activeMembersCount")
			.gte(1)
			.and("invitedMembersList")
			.contains(req.user!._id)
			.return.all();

		// Execute queries in parallel
		const [
			publicRooms,
			publicRoomsWithFriendsJoined,
			friendsRooms,
			invitedRooms,
		] = await Promise.all([
			publicRoomsPromise,
			publicRoomsWithFriendsJoinedPromise,
			friendsRoomsPromise,
			invitedRoomsPromise,
		]);

		publicRooms.length > 0 &&
			publicRooms.forEach((r, i) => {
				publicRooms[i].entityId = (r as any)[EntityId];
			});
		publicRoomsWithFriendsJoined.length > 0 &&
			publicRoomsWithFriendsJoined.forEach((r, i) => {
				publicRoomsWithFriendsJoined[i].entityId = (r as any)[EntityId];
			});
		friendsRooms.length > 0 &&
			friendsRooms.forEach((r, i) => {
				friendsRooms[i].entityId = (r as any)[EntityId];
			});
		invitedRooms.length > 0 &&
			invitedRooms.forEach((r, i) => {
				invitedRooms[i].entityId = (r as any)[EntityId];
			});

		let allPublicRooms = publicRooms;
		if (publicRoomsWithFriendsJoined.length > 0) {
			const publicRoomsWithFriendsEntityIds = new Set(
				publicRoomsWithFriendsJoined.map((room) => room.entityId),
			);

			const filteredAllPublicRooms = publicRooms.filter(
				(room) => !publicRoomsWithFriendsEntityIds.has(room.entityId),
			);

			allPublicRooms = [
				...publicRoomsWithFriendsJoined,
				...filteredAllPublicRooms,
			];
		}

		// Assign entityId to rooms

		const rooms = {
			publicRooms: allPublicRooms || [],
			friendsRooms: friendsRooms || [],
			invitedRooms: invitedRooms || [],
		};

		logger(
			"/room/userrooms",
			"user: ",
			req.user?._id,
			"final rooms returned: ",
			rooms,
		);

		return res.status(200).json(rooms);

		// if (publicRooms.length < 1) return res.status(200).send([]);

		// const friendList = user?.friends.map((friend) => String(friend._id));
		// const userCountry = user?.country;
		// const roomScores = [];

		// for (const room of publicRooms) {
		//   let members: Member[] | undefined = memberCache.get(
		//     `members_${room?.entityId!}`,
		//   );

		//   if (!members) {
		//     members = await memberRepository
		//       .search()
		//       .where("roomId")
		//       .equals(room?.entityId!)
		//       .return.all();
		//     memberCache.set(`members_${room?.entityId!}`, members);
		//   }
		//   room.members = members;

		//   const hasActiveMember = members.some((member) => member.isConnected);

		//   if (!hasActiveMember) {
		//     continue; // Skip the room if no active members
		//   }

		//   let friendScore = 0;
		//   let countryScore = 0;

		//   // Calculate friendScore and countryScore for each room
		//   for (const member of members) {
		//     if (friendList?.includes(member.mongoId)) {
		//       friendScore += 1;
		//     }
		//     if (member.country === userCountry) {
		//       countryScore += 1;
		//     }
		//   }
		//   // TODO: only send room with one or more active members, dont send empty rooms

		//   roomScores.push({ room, friendScore, countryScore });
		// }

		// // Sort rooms first by friendScore, then by countryScore
		// roomScores.sort((a, b) => {
		//   if (b.friendScore !== a.friendScore) {
		//     return b.friendScore - a.friendScore;
		//   }
		//   return b.countryScore - a.countryScore;
		// });

		// // Extract sorted rooms
		// const sortedRooms = roomScores.map((score) => score.room);

		// Return the sorted rooms
		// return res.status(200).json(sortedRooms);
	},
);
// post /room/makeRoom
makeRoute(
	"post",
	"/room/makeRoom",
	[authUser],
	router,
	async function (req, res) {
		const url = req.body.url as string;
		const userId = req.user?._id as string;
		logger("/room/makeRoom", "user,url: ", userId, url);
		await checkMemberRoomMakingHourlyLimit(userId, res);
		const room = await makeRoom(userId, url);
		if (!room) {
			return res.status(401).json({ message: "couldn't make room" });
		}
		room.membersJoinedList = [];
		return res.status(200).json(room);
	},
);
// get /room/getRoom/:roomId
makeRoute(
	"get",
	"/room/getRoom/:roomId",
	[authUser],
	router,
	async function (req, res) {
		const roomId = req.params.roomId as string;
		const room = await roomRepository.fetch(roomId);
		if (!room) {
			return res.status(404).json({ message: "Room not found" });
		}
		room.entityId = (room as any)[EntityId];
		return res.status(200).json(room);
	},
);
// delete /room/deleteAllRooms
makeRoute(
	"delete",
	"/room/deleteAllRooms",
	[],
	router,
	async function (req, res) {
		const rooms = await roomRepository.search().return.all();

		// Delete each room
		for (const room of rooms) {
			await roomRepository.remove((room as any)[EntityId]);
		}

		res.status(200).json({ message: "All rooms deleted successfully." });
	},
);

export default router;

async function checkMemberRoomMakingHourlyLimit(userId: string, res: Response) {
	const oneHourAgo = Date.now() - 60 * 60 * 1000;

	const roomsCreatedInLastHour = await roomRepository
		.search()
		.where("createdByMongoId")
		.contains(userId!)
		.and("createdAt")
		.gte(oneHourAgo)
		.return.all();

	logger(
		"/room/makeRoom",
		"roomsCreatedInLastHour: ",
		roomsCreatedInLastHour.length,
	);

	if (roomsCreatedInLastHour.length >= 5) {
		const oldestRoom = roomsCreatedInLastHour.sort(
			(a, b) => a.createdAt - b.createdAt,
		)[0];
		const nextAvailableTime = oldestRoom.createdAt + 60 * 60 * 1000;
		return res.status(429).json({
			message: "You have reached the room creation limit.",
			nextAvailableTime,
		});
	}
}
