import { Server, Socket } from "socket.io";
import {
  ClientToServerEvents,
  DecodedUser,
  InterServerEvents,
  RoomCreationData,
  ServerToClientEvents,
} from "../types/types";
// import { giveLeader, makeMemberJoin, makeMemberLeave } from "./utils";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { ytInfoService } from "./ytRouter";
import { logger } from "./config";
interface CustomSocket extends Socket {
  user?: DecodedUser;
  roomId?: string;
}
export default function socketServer(
  io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents>,
  prisma: PrismaClient,
) {
  // disconnect all members and sockets
  initializeSocketServer(io, prisma);
  // auth middleware
  io.use(async (socket: CustomSocket, next) => {
    try {
      logger("auth middleware", "checking authentication...");

      const token = socket.handshake?.query?.token;
      if (typeof token != "string" || !token) {
        logger("auth middleware", "no token found");
        return next(new Error("Authentication error"));
      }

      logger("auth middleware", "verifying token: ", token);
      const decoded = jwt.verify(
        token,
        process.env.JWT_PRIVATE_KEY || "wefusdjnkcmjnkdsveuwdjnk34wefuijnk",
      );
      logger(
        "auth middleware",
        "token found, handle: ",
        (decoded as DecodedUser).handle,
      );

      if (decoded) {
        socket.user = decoded as DecodedUser;
        logger("auth middleware", "connecting back sockets");

        if (socket.roomId) {
          await prisma.member.updateMany({
            where: {
              handle: socket.user?.handle,
            },
            data: {
              isConnected: true,
            },
          });
        }
        next();
      } else {
        logger("auth middleware", "invalid token...");
        next(new Error("Authentication error"));
      }
    } catch (error) {
      logger("auth middleware", "error: ", error);
      next(new Error("Authentication error: " + error));
    }
  });

  io.on("connection", (socket: CustomSocket) => {
    socket.on("createRoom", async (data: RoomCreationData) => {
      logger("socket createRoom", "url received: ", data);

      const isActive = await checkIfMemberAlreadyActive(
        socket.user?.handle,
        prisma,
      );
      logger("socket createRoom", "checkIfMemberAlreadyActive: ", isActive);

      if (!isActive) {
        const room = await makeRoom(socket, prisma, data.videoUrl);
        logger("socket createRoom", "room made id: ", room?.id);
        if (!room) {
          socket.emit("stateError", "invalid url");
        } else {
          socket.roomId = room.id;
          socket.join(room.id);
          io.in(room.id).emit("memberList", room.members);
        }
      } else {
        socket.emit("stateError", "user already in a room");
      }
    });
    socket.on("joinRoom", async (data) => {
      const { roomId } = data;
      const isActive = await checkIfMemberAlreadyActive(
        socket.user?.handle,
        prisma,
      );
      if (!isActive) {
        const room = await joinRoom(socket, prisma, roomId);
        socket.roomId = roomId;
        socket.join(roomId);
        if (room) {
          io.in(roomId).emit("memberList", room.members);
        }
      } else {
        socket.emit("stateError", "user already in a room");
      }
    });
    socket.on("giveLeader", async (targetMember) => {
      const roomId = socket.roomId as string;
      const room = await giveLeader(prisma, socket, targetMember);
      if (room) {
        io.in(roomId).emit("memberList", room.members);
      }
    });
    socket.on("sendMessage", (msg) => {
      if (socket.roomId && socket.user) {
        let msgData = { msg, sender: socket.user.handle };
        io.in(socket.roomId).emit("message", msgData);
      } else {
        console.error("roomId or user not attached to socket instance");
      }
    });
    socket.on("leaveRoom", async () => {
      logger(
        "socket leaveRoom",
        "before makeMemberLeave, roomid: ",
        socket.roomId,
      );
      const updatedRoom = await makeMemberLeave(prisma, socket);
      logger(
        "socket leaveRoom",
        "after makeMemberLeave updatedRoom: ",
        updatedRoom,
      );

      if (updatedRoom) {
        io.in(updatedRoom.id).emit("memberList", updatedRoom.members);
      }
    });
    socket.on("disconnect", async () => {
      logger(
        "socket disconnect",
        "before makeMemberLeave, roomid: ",
        socket.roomId,
      );
      const updatedRoom = await makeMemberLeave(prisma, socket);
      logger(
        "socket disconnect",
        "after makeMemberLeave updatedRoom: ",
        updatedRoom,
      );

      if (updatedRoom) {
        io.in(updatedRoom.id).emit("memberList", updatedRoom.members);
      }
    });
  });
}

async function makeRoom(
  socket: CustomSocket,
  prisma: PrismaClient,
  url: string,
) {
  logger("makeRoom", "url: ", url);

  const videoInfo = await ytInfoService(url, prisma);
  // if (!videoInfo) {
  //   return null;
  // }

  return await prisma.room.create({
    data: {
      members: {
        create: [
          {
            handle: socket.user?.handle || "",
            profilePicture: socket.user?.profilePicture || "",
            name: socket.user?.name || "",
            isConnected: true,
            isLeader: true,
            micEnabled: false,
            leaderPriorityCounter: 0,
          },
        ],
      },
      videoPlayer: {
        create: {
          isPlaying: false,
          sourceUrl: url,
          thumbnailUrl: videoInfo?.thumbnail || "",
          title: videoInfo?.title || "",
          totalDuration: 0,
          playedTill: 0,
        },
      },

      status: "Public",
    },
    include: {
      members: true,
      videoPlayer: true,
    },
  });
}
export async function checkIfMemberAlreadyActive(
  handle: string | undefined,
  prisma: PrismaClient,
) {
  const member = await prisma.member.findMany({
    where: {
      handle,
      isConnected: true,
    },
  });
  return member.length > 0;
}
async function joinRoom(
  socket: CustomSocket,
  prisma: PrismaClient,
  roomId: string,
) {
  try {
    const member = await getMemberFromRoom(prisma, socket.user!.handle, roomId);
    // const memberBeenToRoom = member.length > 0;
    if (member) {
      const leader = await getCurrentLeader(prisma, roomId);
      if (member.leaderPriorityCounter < leader!.leaderPriorityCounter) {
        logger(
          "joinRoom",
          "joining member deserves leader",
          member.leaderPriorityCounter,
          leader!.leaderPriorityCounter,
        );
        // update leader
        const updatedLeaderMember = await prisma.member.update({
          where: {
            id: member!.id,
            roomId: roomId,
          },
          data: {
            isLeader: true,
            isConnected: true,
          },
        });
        logger("joinRoom", "updatedLeaderMember: ", updatedLeaderMember);
        await prisma.member.update({
          where: {
            id: leader!.id,
            roomId: roomId,
          },
          data: {
            isLeader: false,
          },
        });
      } else {
        await prisma.member.update({
          where: {
            id: member!.id,
            roomId: roomId,
          },
          data: {
            isConnected: true,
          },
        });
      }
    } else {
      const totalMembers = await prisma.member.count({
        where: {
          roomId,
        },
      });
      logger(
        "joinRoom",
        "totalMembers will be leaderPriorityCounter: ",
        totalMembers,
      );
      await prisma.room.update({
        where: {
          id: roomId,
        },
        data: {
          members: {
            create: [
              {
                handle: socket.user?.handle || "",
                profilePicture: socket.user?.profilePicture || "",
                name: socket.user?.name || "",
                isConnected: true,
                isLeader: false,
                micEnabled: false,
                leaderPriorityCounter: totalMembers,
              },
            ],
          },
        },
      });
    }
    return await returnRoomWithActiveMembersInOrder(prisma, roomId);
  } catch (error) {
    logger("joinRoom", "error while joining room", error);
  }
}
async function getMemberFromRoom(
  prisma: PrismaClient,
  handle: string,
  roomId: string,
) {
  const _m = await prisma.member.findMany({
    where: {
      AND: {
        handle,
        roomId,
      },
    },
  });
  return _m?.[0];
}
async function getCurrentLeader(prisma: PrismaClient, roomId: string) {
  const _m = await prisma.member.findMany({
    where: {
      AND: {
        roomId,
        isLeader: true,
        // isConnected: true,
      },
    },
  });
  return _m?.[0];
}

async function makeMemberLeave(prisma: PrismaClient, socket: CustomSocket) {
  logger(
    "makeMemberLeave",
    "called...handle,roomid",
    socket.user?.handle,
    socket.roomId,
  );

  if (!socket.roomId) return false;

  const currentUser = await getMemberFromRoom(
    prisma,
    socket.user!.handle,
    socket.roomId,
  );
  logger("makeMemberLeave", "currentUser: ", currentUser);

  if (!currentUser) {
    logger(
      "makeMemberLeave",
      "No member found with handle,room: ",
      socket.user?.handle,
      socket.roomId,
    );
    return;
  }
  await prisma.member.updateMany({
    where: {
      AND: {
        handle: socket.user?.handle,
        roomId: socket.roomId,
      },
    },
    data: {
      isLeader: false,
      isConnected: false,
    },
  });
  const room = await prisma.room.findUnique({
    where: {
      id: socket.roomId,
    },
    include: {
      members: {
        where: {
          isConnected: true,
        },
        orderBy: {
          leaderPriorityCounter: "asc",
        },
      },
    },
  });
  const activeLeader = await prisma.member.count({
    where: {
      roomId: socket.roomId,
      isConnected: true,
      isLeader: true,
    },
  });
  if (activeLeader > 0) {
    return await returnRoomWithActiveMembersInOrder(prisma, socket.roomId);
  }
  logger("makeMemberLeave", "room: ", room?.members);

  let activeMembersWithHigherPC = room?.members.filter(
    (m) => m.leaderPriorityCounter > currentUser!.leaderPriorityCounter,
  );
  let activeMembersWithLowerPC = room?.members.filter(
    (m) => m.leaderPriorityCounter < currentUser!.leaderPriorityCounter,
  );

  if (activeMembersWithHigherPC && activeMembersWithHigherPC.length > 0) {
    // check if there's another connected member, give leader to lowest priorityCounter
    const updatedLeaderMember = await prisma.member.updateMany({
      where: {
        handle: activeMembersWithHigherPC[0].handle || "",
        roomId: socket.roomId,
      },
      data: {
        isLeader: true,
      },
    });
    logger("makeMemberLeave", "updatedLeaderMember: ", updatedLeaderMember);

    return await returnRoomWithActiveMembersInOrder(prisma, socket.roomId);
  } else {
    if (activeMembersWithLowerPC && activeMembersWithLowerPC.length > 0) {
      return await returnRoomWithActiveMembersInOrder(prisma, socket.roomId);
    } else {
      // no active members in the room so dispose it off
      logger("makeMemberLeave", "room empty: ", socket.roomId);
      return false;
    }
  }
}
async function giveLeader(
  prisma: PrismaClient,
  socket: CustomSocket,
  targetMember: string,
) {
  if (!socket.roomId) return false;
  const member = await getMemberFromRoom(
    prisma,
    socket.user!.handle,
    socket.roomId,
  );

  if (!member) {
    console.error("[giveLeader] false leader");
    return false;
  }
  if (member.isLeader == false) {
    console.error("[giveLeader] member not leader");
    return false;
  }
  const target = await getMemberFromRoom(prisma, targetMember, socket.roomId);
  if (!target) {
    console.error("[giveLeader] wrong target handle");
    return false;
  }

  if (member.roomId != target.roomId) {
    console.error("current and target members not in same room");
    return false;
  }

  const currentLeaderPC = member?.leaderPriorityCounter;
  const targetMemberPC = target.leaderPriorityCounter;

  await prisma.member.updateMany({
    where: {
      AND: {
        handle: targetMember,
        roomId: socket.roomId,
      },
    },
    data: {
      leaderPriorityCounter: -1,
    },
  });
  if (targetMemberPC - currentLeaderPC > 1) {
    await prisma.member.updateMany({
      where: {
        roomId: socket.roomId,
        leaderPriorityCounter: {
          gte: currentLeaderPC,
          lt: targetMemberPC,
        },
      },
      data: {
        leaderPriorityCounter: { increment: 1 },
      },
    });
  } else {
    await prisma.member.updateMany({
      where: {
        AND: {
          handle: member.handle,
          roomId: socket.roomId,
        },
      },
      data: {
        leaderPriorityCounter: { increment: 1 },
        isLeader: false,
      },
    });
  }
  const updatedLeaderMember = await prisma.member.updateMany({
    where: {
      AND: {
        handle: target.handle,
        roomId: socket.roomId,
      },
    },
    data: {
      leaderPriorityCounter: currentLeaderPC,
      isLeader: true,
    },
  });
  logger("giveLeader", "updatedLeaderMember: ", updatedLeaderMember);

  return await returnRoomWithActiveMembersInOrder(prisma, socket.roomId);
}
export async function returnRoomWithActiveMembersInOrder(
  prisma: PrismaClient,
  roomId: string,
) {
  return await prisma.room.findUnique({
    where: {
      id: roomId,
    },
    include: {
      members: {
        where: {
          isConnected: true,
        },
        orderBy: {
          leaderPriorityCounter: "asc",
        },
      },
      videoPlayer: true,
    },
  });
}

async function getCurrentLeaderPriorityCounter(
  prisma: PrismaClient,
  roomId: string,
) {
  return (await getCurrentLeader(prisma, roomId))!.leaderPriorityCounter;
}
async function getCurrentMemberPriorityCounter(
  prisma: PrismaClient,
  socket: CustomSocket,
) {
  if (!socket.roomId) return false;
  return (await getMemberFromRoom(prisma, socket.user!.handle, socket.roomId))!
    .leaderPriorityCounter;
}
export const deleteInactiveRooms = async (prisma: PrismaClient) => {
  const rooms = await prisma.room.findMany({
    where: {
      members: {
        every: {
          isConnected: false,
        },
      },
    },
  });
  logger("deleteInactiveRooms", "found inactive rooms: ", rooms.length);

  for (const room of rooms) {
    logger("deleteInactiveRooms", "deleting inactive room: ", room.id);
    await prisma.room.delete({
      where: {
        id: room.id,
      },
    });
  }
};
const passLeaderIfNotPassedProperly = async (
  prisma: PrismaClient,
  socket: CustomSocket,
) => {};
const initializeSocketServer = async (
  io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents>,
  prisma: PrismaClient,
) => {
  logger("initializeSocketServer", "initializing socket server...");

  io.disconnectSockets();
  try {
    await prisma.member.updateMany({
      where: {
        isConnected: true,
      },
      data: {
        isConnected: false,
      },
    });
  } catch (error) {}
};
