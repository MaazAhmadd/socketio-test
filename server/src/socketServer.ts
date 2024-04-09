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
      console.log("[socket auth middleware] checking authentication...");

      const token = socket.handshake?.query?.token;
      if (typeof token != "string" || !token) {
        console.log("[socket auth middleware] no token found");
        return next(new Error("Authentication error"));
      }

      console.log("[socket auth middleware] verifying token: ", token);
      const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY || "");
      console.log(
        "[socket auth middleware] token found, handle: ",
        (decoded as DecodedUser).handle,
      );

      if (decoded) {
        socket.user = decoded as DecodedUser;
        console.log("[socket auth middleware] connecting back sockets");

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
        console.log("[socket auth middleware] invalid token");
        next(new Error("Authentication error"));
      }
    } catch (error) {
      console.log("[socket auth middleware] error: ", error);
      next(new Error("Authentication error: " + error));
    }
  });

  io.on("connection", (socket: CustomSocket) => {
    console.log("[socket connection] connected: ", socket);

    socket.on("createRoom", async (data: RoomCreationData) => {
      console.log("[socket createRoom] url received: ", data);

      const isActive = await checkIfMemberAlreadyActive(
        socket.user?.handle,
        prisma,
      );
      console.log("[socket createRoom] isActive: ", isActive);

      if (!isActive) {
        const room = await makeRoom(socket, prisma, data.videoUrl);
        if (!room) {
          socket.emit("stateError", "invalid url");
        } else {
          socket.roomId = room.id;
          socket.join(room.id);
          io.in(room.id).emit("roomDesc", room);
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
          io.in(roomId).emit("roomDesc", room);
        }
      } else {
        socket.emit("stateError", "user already in a room");
      }
    });
    socket.on("giveLeader", async (targetMember) => {
      const roomId = socket.roomId as string;
      const room = await giveLeader(prisma, socket, targetMember);
      if (room) {
        io.in(roomId).emit("roomDesc", room);
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
      const updatedRoom = await makeMemberLeave(prisma, socket);
      if (updatedRoom) {
        io.in(updatedRoom.id).emit("roomDesc", updatedRoom);
      }
    });
    socket.on("disconnect", async () => {
      console.log("[socket disconnect] roomid: ", socket.roomId);

      const updatedRoom = await makeMemberLeave(prisma, socket);
      if (updatedRoom) {
        io.in(updatedRoom.id).emit("roomDesc", updatedRoom);
      }
    });
  });
}

async function makeRoom(
  socket: CustomSocket,
  prisma: PrismaClient,
  url: string,
) {
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
        // update leader
        await prisma.member.update({
          where: {
            id: member!.id,
            roomId: roomId,
          },
          data: {
            isLeader: true,
            isConnected: true,
          },
        });
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
          id: roomId,
        },
      });
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
    console.log("error while joining room", error);
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
  if (!socket.roomId) return false;

  const currentUser = await getMemberFromRoom(
    prisma,
    socket.user!.handle,
    socket.roomId,
  );

  if (!currentUser) {
    console.log(
      `[makeMemberLeave] No member found with handle: ${socket.user?.handle} in room: ${socket.roomId}`,
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

  let _members = room?.members.filter(
    (m) => m.leaderPriorityCounter > currentUser!.leaderPriorityCounter,
  );

  if (_members && _members.length > 0) {
    // check if there's another connected member, give leader to lowest priorityCounter
    await prisma.member.updateMany({
      where: {
        handle: _members[0].handle || "",
        roomId: socket.roomId,
      },
      data: {
        isLeader: true,
      },
    });
    return await returnRoomWithActiveMembersInOrder(prisma, socket.roomId);
  } else {
    // no active members in the room so dispose it off
    // console.log("[makeMemberLeave] room empty: ", socket.roomId);
    return false;
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
  await prisma.member.updateMany({
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
  console.log("[deleteInactiveRooms] found inactive rooms: ", rooms.length);

  for (const room of rooms) {
    console.log("[deleteInactiveRooms] deleting inactive room: ", room.id);
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
  console.log("[initializeSocketServer] initializing socket server...");

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
