import { Schema, Repository } from "redis-om";
import redis from "./client";
import { Member, Room } from "../types";

const memberSchema = new Schema("Member", {
  mongoId: { type: "string" },
  name: { type: "string" },
  handle: { type: "string" },
  pfp: { type: "string" },
  // isConnected: { type: "boolean" },
  // isLeader: { type: "boolean" },
  mic: { type: "boolean" },
  // leaderPC: { type: "number", sortable: true },
  // roomId: { type: "string" },
  country: { type: "string" },
});

const roomSchema = new Schema("Room", {
  privacy: { type: "number" }, // public(0), private(1), friends(2)
  playback: { type: "number" }, // voting(0), justPlay(1), autoPlay(2), leaderChoice(3)
  roomMic: { type: "boolean" },
  membersJoinedList: { type: "string[]" },
  activeMembersList: { type: "string[]" },
  invitedMembersList: { type: "string[]" },
  activeMembersCount: { type: "number", sortable: true },
  countries: { type: "string[]" },
  kicked: { type: "string[]" },
  createdByMongoId: { type: "string[]" },
  createdAt: { type: "number" },
  // searchKeywords: { type: "text" },
  v_isPlaying: { type: "boolean" },
  v_sourceUrl: { type: "string" },
  v_thumbnailUrl: { type: "string" },
  v_title: { type: "string" },
  v_totalDuration: { type: "number" },
  v_playedTill: { type: "number" }, 
});

// export const memberRepository = new Repository<Member>(memberSchema, redis);

export const roomRepository = new Repository<Room>(roomSchema, redis);

const redisSchemas = {
  // member: memberRepository,
  room: roomRepository,
};
roomRepository.save;

export default redisSchemas;