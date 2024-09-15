import express, { Response } from "express";
import { EntityId } from "redis-om";
import { PRIVACY_FRIENDS, PRIVACY_INVITED, PRIVACY_PUBLIC } from "../constants";
import mongooseModels from "../mongoose/models";
import redisSchemas from "../redis-om/schemas";
import { makeRoom, splitMembersAndMicsArray } from "../socketServer";
import { authUser } from "../middlewares";
import { Room } from "../types";
import { asyncWrapper } from "./asyncWrapper";
import { logger } from "../logger";
const router = express.Router();

const roomRepository = redisSchemas.room;
const User = mongooseModels.User;

// get /room/userrooms
router.get(
	"/room/userrooms",
	authUser,
	asyncWrapper(async function (req, res) {
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
				.and("kicked")
				.not.contain(String(user._id))
				.and("activeMembersCount")
				.gte(1)
				.sortBy("activeMembersCount", "DESC")
				.return.page(offset, pageSize);
		} else {
			publicRoomsPromise = roomRepository
				.search()
				.and("privacy")
				.eq(PRIVACY_PUBLIC)
				.and("kicked")
				.not.contain(String(user._id))
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
				.and("kicked")
				.not.contain(String(user._id))
				.and("activeMembersList")
				.containsOneOf(...friendIds)
				.sortBy("activeMembersCount", "DESC")
				.return.all();

			// Query friends' rooms
			friendsRoomsPromise = roomRepository
				.search()
				.where("privacy")
				.eq(PRIVACY_FRIENDS)
				.and("kicked")
				.not.contain(String(user._id))
				.and("activeMembersCount")
				.gte(1)
				.and("createdByMongoId")
				.containsOneOf(...friendIds)
				.return.all();
		}
		// Query invited rooms
		const invitedRoomsPromise = roomRepository
			.search()
			// .where("privacy")
			// .eq(PRIVACY_INVITED)
			.and("kicked")
			.not.contain(String(user._id))
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

		return res.status(200).send(rooms);

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
		// return res.status(200).send(sortedRooms);
	}),
);
// post /room/makeRoom
router.post(
	"/room/makeRoom",
	authUser,
	asyncWrapper(async function (req, res) {
		const url = req.body.url as string;
		const userId = req.user?._id as string;
		const nextAvailableTime = await checkMemberRoomMakingHourlyLimit(userId);
		if (nextAvailableTime) {
			res.status(429).send({
				message: "You have reached the room creation limit.",
				nextAvailableTime,
			});
			return;
		}
		const room = await makeRoom(userId, url);
		if (!room) {
			return res.status(401).send({ message: "couldn't make room" });
		}
		room.membersJoinedList = [];
		return res.status(200).send(room);
	}),
);
// get /room/getRoom/:roomId
router.get(
	"/room/getRoom/:roomId",
	authUser,
	asyncWrapper(async function (req, res) {
		const roomId = req.params.roomId as string;
		const room = await roomRepository.fetch(roomId);
		if (!room) {
			return res.status(404).send({ message: "Room not found" });
		}
		room.entityId = (room as any)[EntityId];
		const { membersJoinedMongoIds, membersJoinedMics, activeMembersMics } =
			splitMembersAndMicsArray(room);
		room.activeMembersList?.push(activeMembersMics.join(""));
		room.membersJoinedList = [];

		return res.status(200).send(room);
	}),
);
// delete /room/deleteAllRooms
router.delete(
	"/room/deleteAllRooms",
	asyncWrapper(async function (req, res) {
		const rooms = await roomRepository.search().return.all();
		for (const room of rooms) {
			await roomRepository.remove((room as any)[EntityId]);
		}
		res.status(200).send({ message: "All rooms deleted successfully." });
	}),
);

export default router;

async function checkMemberRoomMakingHourlyLimit(userId: string) {
	const oneHourAgo = Date.now() - 60 * 60 * 1000;

	const roomsCreatedInLastHour = await roomRepository
		.search()
		.where("createdByMongoId")
		.contains(userId!)
		.and("createdAt")
		.gte(oneHourAgo)
		.return.all();

	logger.info(`rooms created in last hour: ${roomsCreatedInLastHour.length}`);

	if (roomsCreatedInLastHour.length >= 5) {
		const oldestRoom = roomsCreatedInLastHour.sort(
			(a, b) => a.createdAt - b.createdAt,
		)[0];
		const nextAvailableTime = oldestRoom.createdAt + 60 * 60 * 1000;
		return nextAvailableTime;
	}
	return null;
}
