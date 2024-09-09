import jwt from "jsonwebtoken";
import { EntityId } from "redis-om";
import { Server, Socket } from "socket.io";
import { logger } from "./config";
import mongooseModels from "./mongoose/models";
import redisSchemas from "./redis-om/schemas";
import { ytInfoService } from "./routers/ytRouter";
import { getCountryFromIP } from "./services/geoLocationService";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
} from "./types";
import { isNullOrUndefined } from "node:util";

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
let msg_count = 0;

export default function socketServer(io: CustomIO) {
  // disconnect all members and sockets
  initializeSocketServer(io);
  // auth middleware
  io.use(async (socket: CustomSocket, next) => {
    try {
      const token = socket.handshake?.query?.token;
      if (typeof token != "string" || !token) {
        logger("auth-middleware", "no token provided");
        return next(new Error("Authentication error no token provided"));
      }
      let decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY || "") as {
        _id: string;
      };
      if (decoded) {
        const ipAddress = socket.handshake.address;
        // logger("auth-middleware", "ip: ", ipAddress);
        const countryISO = await getCountryFromIP(ipAddress);
        // logger("auth-middleware", "countryISO: ", countryISO);

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
        logger("auth-middleware", "invalid token...");
        next(new Error("Authentication error invalid token"));
      }
    } catch (error) {
      logger("auth-middleware", "error: ", error);
      next(new Error("Authentication error in middleware: " + error));
    }
  });

  io.on("connection", (socket: CustomSocket) => {
    socket.on("joinRoom", async ({ roomId }) => {
      if (!roomId) {
        logger("joinRoom", "roomId not provided");
        socket.emit("stateError", "roomId not provided");
        return;
      }
      socket.roomId = roomId;
      await joinRoom(io, socket, roomId);
    });
    socket.on("giveLeader", async ({ targetMember, roomId }) => {
      socket.roomId = roomId;
      await giveLeader(io, socket, targetMember);
    });
    socket.on("sendMessage", (msg) => {
      logger(
        "sendMessage",
        "msg: ",
        msg_count,
        msg,
        "roomId: ",
        socket?.roomId,
      );
      if (!socket?.roomId) {
        socket.emit("stateError", "roomId not found on socket");
        return;
      }
      let msgData = {
        msg,
        sender: socket.user?._id!,
        time: Date.now(),
        id: ++msg_count,
      };
      io.in(socket?.roomId).emit("message", msgData);
    });
    socket.on("mic", async (micstr) => {
      // micstr = "targetmember,roomid,reqtype"
      const [targetMember, roomId, reqtype] = micstr.split(",");
      socket.roomId = roomId;
      await enableDisableMic(io, socket, targetMember, reqtype);
    });
    socket.on("kickMember", async ({ targetMember, roomId }) => {
      socket.roomId = roomId;
      await kickMember(io, socket, targetMember);
    });
    socket.on("leaveRoom", async () => {
      await makeMemberLeave(socket, io);
    });
    socket.on("disconnect", async () => {
      await makeMemberLeave(socket, io);
    });
  });
}

export async function makeRoom(userId: string, url: string) {
  // logger("makeRoom", "url: ", url);

  const videoInfo = await ytInfoService(url);
  if (!videoInfo) {
    return null;
  }
  const userIDandMic = String(userId) + ("," + "1");
  const room = await roomRepository.save({
    privacy: 0, // public(0), private(1), friends(2)
    playback: 0, // voting(0), justPlay(1), autoPlay(2), leaderChoice(3)
    roomMic: false,
    membersJoinedList: [userIDandMic],
    activeMembersList: [],
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

  // await memberRepository.save({
  //   handle: user.handle,
  //   pfp: user.pfp,
  //   name: user.name,
  //   isConnected: true,
  //   isLeader: true,
  //   mic: false,
  //   leaderPC: 0,
  //   mongoId: String(user._id),
  //   roomId: room.entityId,
  //   country: user.country,
  // });
  // // entityId and EntityKeyName

  // const members = await memberRepository
  //   .search()
  //   .where("roomId")
  //   .equals(room?.entityId!)
  //   .return.all();

  // // Attach members to the room object
  // room.members = members;

  // Return the full room details including members and video player info
  return room;
}

export async function joinRoom(
  io: CustomIO,
  socket: CustomSocket,
  roomId: string,
): Promise<void> {
  try {
    logger("joinRoom", "roomId: ", roomId);
    const room = await roomRepository.fetch(roomId);
    // logger("joinRoom", "room: ", room);
    if (!room.activeMembersList) {
      socket.emit("stateError", "Room not found");
      return;
    }
    room.countries.push(socket.user?.country!);
    room.countries = [...new Set(room.countries)];
    const membersAndMics = splitMembersAndMicsArray(room.membersJoinedList!);
    if (membersAndMics.mongoIDs.includes(socket.user!._id)) {
      room.activeMembersList?.push(socket.user!._id);
      room.activeMembersList = [...new Set(room.activeMembersList)];
      room.activeMembersCount = room.activeMembersList?.length;
      sortActiveMembers(room?.membersJoinedList!, room?.activeMembersList!);
      await roomRepository.save(room);
      room.activeMembersList.push(
        splitMembersAndMicsArray(room.membersJoinedList!).mics.join(""),
      ); // last item mics permission string
      io.in(roomId).emit("activeMemberListUpdate", room.activeMembersList);
      io.in(roomId).emit("message", {
        msg: "has joined",
        sender: socket.user?._id!,
        time: Date.now(),
        id: ++msg_count,
        system: true,
      });
      socket.join(roomId);
      delete room.membersJoinedList;
      socket.emit("roomDesc", room);
      socket.roomId = roomId;
    } else {
      room.membersJoinedList?.push(
        socket.user!._id + (room.roomMic ? ",1" : ",0"),
      );
      room.activeMembersList?.push(socket.user!._id);
      room.activeMembersList = [...new Set(room.activeMembersList)];
      room.activeMembersCount = room.activeMembersList?.length;
      sortActiveMembers(room?.membersJoinedList!, room?.activeMembersList!);
      await roomRepository.save(room);
      room.activeMembersList.push(
        splitMembersAndMicsArray(room.membersJoinedList!).mics.join(""),
      );

      io.in(roomId).emit("activeMemberListUpdate", room.activeMembersList);
      io.in(roomId).emit("message", {
        msg: "has joined",
        sender: socket.user?._id!,
        time: Date.now(),
        id: ++msg_count,
        system: true,
      });
      delete room.membersJoinedList;
      socket.join(roomId);
      socket.emit("roomDesc", room);
      socket.roomId = roomId;
    }
  } catch (error) {
    logger("joinRoom", "error while joining room", error);
    socket.emit("stateError", "couldn't join room");
  }
}

async function getCurrentLeader(roomId: string) {
  const room = await roomRepository.fetch(roomId);
  return await User.findOne({ _id: room.activeMembersList![0] });
}

export async function makeMemberLeave(
  socket: CustomSocket,
  io: CustomIO,
): Promise<void> {
  if (!socket.roomId) {
    socket.emit("stateError", "no roomId found");
    return;
  }
  const room = await roomRepository.fetch(socket.roomId);
  if (!room.activeMembersList?.includes(socket.user?._id!)) {
    return;
  }
  room.activeMembersList = room.activeMembersList?.filter(
    (member) => member !== socket.user?._id,
  );
  room.activeMembersList = [...new Set(room.activeMembersList)];
  room.activeMembersCount = room.activeMembersList?.length;
  room.membersJoinedList?.forEach((member, index) => {
    if (member.startsWith(room.activeMembersList![0])) {
      room.membersJoinedList![index] = member.split(",")[0] + ",1";
    }
  });
  await roomRepository.save(room);
  room.activeMembersList.push(
    splitMembersAndMicsArray(room.membersJoinedList!).mics.join(""),
  );

  io.in(socket.roomId).emit("activeMemberListUpdate", room.activeMembersList);
  io.in(socket.roomId).emit("message", {
    msg: "has left",
    sender: socket.user?._id!,
    time: Date.now(),
    id: ++msg_count,
    system: true,
  });
  socket.disconnect();
}

export async function giveLeader(
  io: CustomIO,
  socket: CustomSocket,
  targetMemberMongoId: string,
) {
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

  await roomRepository.save(room);
  // Notify all clients in the room about the updated room description
  room.activeMembersList &&
    room.activeMembersList.push(
      splitMembersAndMicsArray(room.membersJoinedList!).mics.join(""),

  delete room.membersJoinedList;
  io.in(socket.roomId).emit("roomDesc", room);
}

export async function kickMember(
  io: CustomIO,
  socket: CustomSocket,
  targetMemberMongoId: string,
) {
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
  executeKickMember(
    room.membersJoinedList!,
    currentLeader,
    targetMemberMongoId,
  );
  sortActiveMembers(room.membersJoinedList!, room.activeMembersList!);
  await roomRepository.save(room);
  room.activeMembersList?.push(
    splitMembersAndMicsArray(room.membersJoinedList!).mics.join(""),
  );

  io.in(socket.roomId).emit("activeMemberListUpdate", room.activeMembersList!);
}

export async function enableDisableMic(
  io: CustomIO,
  socket: CustomSocket,
  targetMember: string,
  reqtype: string,
) {
  if (!socket.roomId) {
    return socket.emit("stateError", "roomId not found");
  }
  const room = await roomRepository.fetch(socket.roomId);
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
  const { mics } = splitMembersAndMicsArray(room.membersJoinedList!);
  room.activeMembersList.push(mics.join(""));

  io.in(socket.roomId).emit("activeMemberListUpdate", room.activeMembersList);
  if (targetUser && targetUser?.socketId) {
    io.to(targetUser.socketId).emit("message", {
      msg: reqtype == "0" ? "your mic disabled" : "your mic enabled",
      sender: targetMember,
      time: Date.now(),
      id: ++msg_count,
      system: true,
    });
  }
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
//   logger("deleteInactiveRooms", "found inactive rooms: ", rooms.length);

//   for (const room of rooms) {
//     logger("deleteInactiveRooms", "deleting inactive room: ", room.id);
//     await prisma.room.delete({
//       where: {
//         id: room.id,
//       },
//     });
//   }
// };

const initializeSocketServer = async (io: CustomIO) => {
  logger("initializeSocketServer", "initializing socket server...");
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

export function splitMembersAndMicsArray(input: string[]): {
  mongoIDs: string[];
  mics: string[];
} {
  const result = {
    mongoIDs: [] as string[],
    mics: [] as string[],
  };
  if (!input) return result;
  input.map((item) => {
    const [mongoID, mic] = item.split(",");
    result.mongoIDs.push(mongoID);
    result.mics.push(mic);
  });
  return result;
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

function executeKickMember(
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
