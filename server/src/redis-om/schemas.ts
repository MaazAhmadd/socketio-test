import { Schema, Repository } from "redis-om";
import redis from "./client";
import { Room } from "../types";

// const memberSchema = new Schema("Member", {
// mongoId: { type: "string" },
// name: { type: "string" },
// handle: { type: "string" },
// pfp: { type: "string" },
// isConnected: { type: "boolean" },
// isLeader: { type: "boolean" },
// mic: { type: "boolean" },
// leaderPC: { type: "number", sortable: true },
// roomId: { type: "string" },
// country: { type: "string" },
// });

const roomSchema = new Schema("Room", {
	privacy: { type: "number" }, // public(0), private(1), friends(2)
	playback: { type: "number" }, // voting(0), justPlay(1), autoPlay(2), leaderChoice(3)
	roomMic: { type: "number" }, // on(1), off(0)
	membersJoinedList: { type: "string[]" },
	activeMembersList: { type: "string[]" },
	invitedMembersList: { type: "string[]" },
	activeMembersCount: { type: "number", sortable: true },
	countries: { type: "string[]" },
	kicked: { type: "string[]" },
	createdByMongoId: { type: "string[]" },
	createdAt: { type: "number" },
	// searchKeywords: { type: "text" },
	videoUrl: { type: "string" },
	playerStats: { type: "number[]" },
});

// export const memberRepository = new Repository<Member>(memberSchema, redis);

export const roomRepository = new Repository<Room>(roomSchema, redis);

const redisSchemas = {
	// member: memberRepository,
	room: roomRepository,
};
roomRepository.save;

export type RedisSchemas = {
	room: Repository<Room>;
};
export default redisSchemas;
