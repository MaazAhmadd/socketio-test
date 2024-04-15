"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteInactiveRooms = exports.returnRoomWithActiveMembersInOrder = exports.checkIfMemberAlreadyActive = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ytRouter_1 = require("./ytRouter");
function socketServer(io, prisma) {
    // disconnect all members and sockets
    initializeSocketServer(io, prisma);
    // auth middleware
    io.use((socket, next) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            console.log("[socket auth middleware] checking authentication...");
            const token = (_b = (_a = socket.handshake) === null || _a === void 0 ? void 0 : _a.query) === null || _b === void 0 ? void 0 : _b.token;
            if (typeof token != "string" || !token) {
                console.log("[socket auth middleware] no token found");
                return next(new Error("Authentication error"));
            }
            console.log("[socket auth middleware] verifying token: ", token);
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_PRIVATE_KEY || "");
            console.log("[socket auth middleware] token found, handle: ", decoded.handle);
            if (decoded) {
                socket.user = decoded;
                console.log("[socket auth middleware] connecting back sockets");
                if (socket.roomId) {
                    yield prisma.member.updateMany({
                        where: {
                            handle: (_c = socket.user) === null || _c === void 0 ? void 0 : _c.handle,
                        },
                        data: {
                            isConnected: true,
                        },
                    });
                }
                next();
            }
            else {
                console.log("[socket auth middleware] invalid token");
                next(new Error("Authentication error"));
            }
        }
        catch (error) {
            console.log("[socket auth middleware] error: ", error);
            next(new Error("Authentication error: " + error));
        }
    }));
    io.on("connection", (socket) => {
        // console.log("[socket connection] connected: ", socket);
        socket.on("createRoom", (data) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            console.log("[socket createRoom] url received: ", data);
            const isActive = yield checkIfMemberAlreadyActive((_a = socket.user) === null || _a === void 0 ? void 0 : _a.handle, prisma);
            console.log("[socket createRoom] isActive: ", isActive);
            if (!isActive) {
                const room = yield makeRoom(socket, prisma, data.videoUrl);
                if (!room) {
                    socket.emit("stateError", "invalid url");
                }
                else {
                    socket.roomId = room.id;
                    socket.join(room.id);
                    io.in(room.id).emit("roomDesc", room);
                }
            }
            else {
                socket.emit("stateError", "user already in a room");
            }
        }));
        socket.on("joinRoom", (data) => __awaiter(this, void 0, void 0, function* () {
            var _b;
            const { roomId } = data;
            const isActive = yield checkIfMemberAlreadyActive((_b = socket.user) === null || _b === void 0 ? void 0 : _b.handle, prisma);
            if (!isActive) {
                const room = yield joinRoom(socket, prisma, roomId);
                socket.roomId = roomId;
                socket.join(roomId);
                if (room) {
                    io.in(roomId).emit("roomDesc", room);
                }
            }
            else {
                socket.emit("stateError", "user already in a room");
            }
        }));
        socket.on("giveLeader", (targetMember) => __awaiter(this, void 0, void 0, function* () {
            const roomId = socket.roomId;
            const room = yield giveLeader(prisma, socket, targetMember);
            if (room) {
                io.in(roomId).emit("roomDesc", room);
            }
        }));
        socket.on("sendMessage", (msg) => {
            if (socket.roomId && socket.user) {
                let msgData = { msg, sender: socket.user.handle };
                io.in(socket.roomId).emit("message", msgData);
            }
            else {
                console.error("roomId or user not attached to socket instance");
            }
        });
        socket.on("leaveRoom", () => __awaiter(this, void 0, void 0, function* () {
            const updatedRoom = yield makeMemberLeave(prisma, socket);
            if (updatedRoom) {
                io.in(updatedRoom.id).emit("roomDesc", updatedRoom);
            }
        }));
        socket.on("disconnect", () => __awaiter(this, void 0, void 0, function* () {
            console.log("[socket disconnect] roomid: ", socket.roomId);
            const updatedRoom = yield makeMemberLeave(prisma, socket);
            if (updatedRoom) {
                io.in(updatedRoom.id).emit("roomDesc", updatedRoom);
            }
        }));
    });
}
exports.default = socketServer;
function makeRoom(socket, prisma, url) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const videoInfo = yield (0, ytRouter_1.ytInfoService)(url, prisma);
        // if (!videoInfo) {
        //   return null;
        // }
        return yield prisma.room.create({
            data: {
                members: {
                    create: [
                        {
                            handle: ((_a = socket.user) === null || _a === void 0 ? void 0 : _a.handle) || "",
                            profilePicture: ((_b = socket.user) === null || _b === void 0 ? void 0 : _b.profilePicture) || "",
                            name: ((_c = socket.user) === null || _c === void 0 ? void 0 : _c.name) || "",
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
                        thumbnailUrl: (videoInfo === null || videoInfo === void 0 ? void 0 : videoInfo.thumbnail) || "",
                        title: (videoInfo === null || videoInfo === void 0 ? void 0 : videoInfo.title) || "",
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
    });
}
function checkIfMemberAlreadyActive(handle, prisma) {
    return __awaiter(this, void 0, void 0, function* () {
        const member = yield prisma.member.findMany({
            where: {
                handle,
                isConnected: true,
            },
        });
        return member.length > 0;
    });
}
exports.checkIfMemberAlreadyActive = checkIfMemberAlreadyActive;
function joinRoom(socket, prisma, roomId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            const member = yield getMemberFromRoom(prisma, socket.user.handle, roomId);
            // const memberBeenToRoom = member.length > 0;
            if (member) {
                const leader = yield getCurrentLeader(prisma, roomId);
                if (member.leaderPriorityCounter < leader.leaderPriorityCounter) {
                    // update leader
                    yield prisma.member.update({
                        where: {
                            id: member.id,
                            roomId: roomId,
                        },
                        data: {
                            isLeader: true,
                            isConnected: true,
                        },
                    });
                    yield prisma.member.update({
                        where: {
                            id: leader.id,
                            roomId: roomId,
                        },
                        data: {
                            isLeader: false,
                        },
                    });
                }
                else {
                    yield prisma.member.update({
                        where: {
                            id: member.id,
                            roomId: roomId,
                        },
                        data: {
                            isConnected: true,
                        },
                    });
                }
            }
            else {
                const totalMembers = yield prisma.member.count({
                    where: {
                        id: roomId,
                    },
                });
                yield prisma.room.update({
                    where: {
                        id: roomId,
                    },
                    data: {
                        members: {
                            create: [
                                {
                                    handle: ((_a = socket.user) === null || _a === void 0 ? void 0 : _a.handle) || "",
                                    profilePicture: ((_b = socket.user) === null || _b === void 0 ? void 0 : _b.profilePicture) || "",
                                    name: ((_c = socket.user) === null || _c === void 0 ? void 0 : _c.name) || "",
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
            return yield returnRoomWithActiveMembersInOrder(prisma, roomId);
        }
        catch (error) {
            console.log("error while joining room", error);
        }
    });
}
function getMemberFromRoom(prisma, handle, roomId) {
    return __awaiter(this, void 0, void 0, function* () {
        const _m = yield prisma.member.findMany({
            where: {
                AND: {
                    handle,
                    roomId,
                },
            },
        });
        return _m === null || _m === void 0 ? void 0 : _m[0];
    });
}
function getCurrentLeader(prisma, roomId) {
    return __awaiter(this, void 0, void 0, function* () {
        const _m = yield prisma.member.findMany({
            where: {
                AND: {
                    roomId,
                    isLeader: true,
                    // isConnected: true,
                },
            },
        });
        return _m === null || _m === void 0 ? void 0 : _m[0];
    });
}
function makeMemberLeave(prisma, socket) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        if (!socket.roomId)
            return false;
        const currentUser = yield getMemberFromRoom(prisma, socket.user.handle, socket.roomId);
        if (!currentUser) {
            console.log(`[makeMemberLeave] No member found with handle: ${(_a = socket.user) === null || _a === void 0 ? void 0 : _a.handle} in room: ${socket.roomId}`);
            return;
        }
        yield prisma.member.updateMany({
            where: {
                AND: {
                    handle: (_b = socket.user) === null || _b === void 0 ? void 0 : _b.handle,
                    roomId: socket.roomId,
                },
            },
            data: {
                isLeader: false,
                isConnected: false,
            },
        });
        const room = yield prisma.room.findUnique({
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
        let _members = room === null || room === void 0 ? void 0 : room.members.filter((m) => m.leaderPriorityCounter > currentUser.leaderPriorityCounter);
        if (_members && _members.length > 0) {
            // check if there's another connected member, give leader to lowest priorityCounter
            yield prisma.member.updateMany({
                where: {
                    handle: _members[0].handle || "",
                    roomId: socket.roomId,
                },
                data: {
                    isLeader: true,
                },
            });
            return yield returnRoomWithActiveMembersInOrder(prisma, socket.roomId);
        }
        else {
            // no active members in the room so dispose it off
            // console.log("[makeMemberLeave] room empty: ", socket.roomId);
            return false;
        }
    });
}
function giveLeader(prisma, socket, targetMember) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!socket.roomId)
            return false;
        const member = yield getMemberFromRoom(prisma, socket.user.handle, socket.roomId);
        if (!member) {
            console.error("[giveLeader] false leader");
            return false;
        }
        if (member.isLeader == false) {
            console.error("[giveLeader] member not leader");
            return false;
        }
        const target = yield getMemberFromRoom(prisma, targetMember, socket.roomId);
        if (!target) {
            console.error("[giveLeader] wrong target handle");
            return false;
        }
        if (member.roomId != target.roomId) {
            console.error("current and target members not in same room");
            return false;
        }
        const currentLeaderPC = member === null || member === void 0 ? void 0 : member.leaderPriorityCounter;
        const targetMemberPC = target.leaderPriorityCounter;
        yield prisma.member.updateMany({
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
            yield prisma.member.updateMany({
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
        }
        else {
            yield prisma.member.updateMany({
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
        yield prisma.member.updateMany({
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
        return yield returnRoomWithActiveMembersInOrder(prisma, socket.roomId);
    });
}
function returnRoomWithActiveMembersInOrder(prisma, roomId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield prisma.room.findUnique({
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
    });
}
exports.returnRoomWithActiveMembersInOrder = returnRoomWithActiveMembersInOrder;
function getCurrentLeaderPriorityCounter(prisma, roomId) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield getCurrentLeader(prisma, roomId)).leaderPriorityCounter;
    });
}
function getCurrentMemberPriorityCounter(prisma, socket) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!socket.roomId)
            return false;
        return (yield getMemberFromRoom(prisma, socket.user.handle, socket.roomId))
            .leaderPriorityCounter;
    });
}
const deleteInactiveRooms = (prisma) => __awaiter(void 0, void 0, void 0, function* () {
    const rooms = yield prisma.room.findMany({
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
        yield prisma.room.delete({
            where: {
                id: room.id,
            },
        });
    }
});
exports.deleteInactiveRooms = deleteInactiveRooms;
const passLeaderIfNotPassedProperly = (prisma, socket) => __awaiter(void 0, void 0, void 0, function* () { });
const initializeSocketServer = (io, prisma) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("[initializeSocketServer] initializing socket server...");
    io.disconnectSockets();
    try {
        yield prisma.member.updateMany({
            where: {
                isConnected: true,
            },
            data: {
                isConnected: false,
            },
        });
    }
    catch (error) { }
});
