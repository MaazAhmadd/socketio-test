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
const config_1 = require("./config");
function socketServer(io, prisma) {
    // disconnect all members and sockets
    initializeSocketServer(io, prisma);
    // auth middleware
    io.use((socket, next) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            (0, config_1.logger)("auth middleware", "checking authentication...");
            const token = (_b = (_a = socket.handshake) === null || _a === void 0 ? void 0 : _a.query) === null || _b === void 0 ? void 0 : _b.token;
            if (typeof token != "string" || !token) {
                (0, config_1.logger)("auth middleware", "no token found");
                return next(new Error("Authentication error"));
            }
            (0, config_1.logger)("auth middleware", "verifying token: ", token);
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_PRIVATE_KEY || "wefusdjnkcmjnkdsveuwdjnk34wefuijnk");
            (0, config_1.logger)("auth middleware", "token found, handle: ", decoded.handle);
            if (decoded) {
                socket.user = decoded;
                (0, config_1.logger)("auth middleware", "connecting back sockets");
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
                (0, config_1.logger)("auth middleware", "invalid token...");
                next(new Error("Authentication error"));
            }
        }
        catch (error) {
            (0, config_1.logger)("auth middleware", "error: ", error);
            next(new Error("Authentication error: " + error));
        }
    }));
    io.on("connection", (socket) => {
        socket.on("createRoom", (data) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            (0, config_1.logger)("socket createRoom", "url received: ", data);
            const isActive = yield checkIfMemberAlreadyActive((_a = socket.user) === null || _a === void 0 ? void 0 : _a.handle, prisma);
            (0, config_1.logger)("socket createRoom", "checkIfMemberAlreadyActive: ", isActive);
            if (!isActive) {
                const room = yield makeRoom(socket, prisma, data.videoUrl);
                (0, config_1.logger)("socket createRoom", "room made id: ", room === null || room === void 0 ? void 0 : room.id);
                if (!room) {
                    socket.emit("stateError", "invalid url");
                }
                else {
                    socket.roomId = room.id;
                    socket.join(room.id);
                    io.in(room.id).emit("memberList", room.members);
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
                    io.in(roomId).emit("memberList", room.members);
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
                io.in(roomId).emit("memberList", room.members);
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
            (0, config_1.logger)("socket leaveRoom", "before makeMemberLeave, roomid: ", socket.roomId);
            const updatedRoom = yield makeMemberLeave(prisma, socket);
            (0, config_1.logger)("socket leaveRoom", "after makeMemberLeave updatedRoom: ", updatedRoom);
            if (updatedRoom) {
                io.in(updatedRoom.id).emit("memberList", updatedRoom.members);
            }
        }));
        socket.on("disconnect", () => __awaiter(this, void 0, void 0, function* () {
            (0, config_1.logger)("socket disconnect", "before makeMemberLeave, roomid: ", socket.roomId);
            const updatedRoom = yield makeMemberLeave(prisma, socket);
            (0, config_1.logger)("socket disconnect", "after makeMemberLeave updatedRoom: ", updatedRoom);
            if (updatedRoom) {
                io.in(updatedRoom.id).emit("memberList", updatedRoom.members);
            }
        }));
    });
}
exports.default = socketServer;
function makeRoom(socket, prisma, url) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        (0, config_1.logger)("makeRoom", "url: ", url);
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
                    (0, config_1.logger)("joinRoom", "joining member deserves leader", member.leaderPriorityCounter, leader.leaderPriorityCounter);
                    // update leader
                    const updatedLeaderMember = yield prisma.member.update({
                        where: {
                            id: member.id,
                            roomId: roomId,
                        },
                        data: {
                            isLeader: true,
                            isConnected: true,
                        },
                    });
                    (0, config_1.logger)("joinRoom", "updatedLeaderMember: ", updatedLeaderMember);
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
                        roomId,
                    },
                });
                (0, config_1.logger)("joinRoom", "totalMembers will be leaderPriorityCounter: ", totalMembers);
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
            (0, config_1.logger)("joinRoom", "error while joining room", error);
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
        var _a, _b, _c;
        (0, config_1.logger)("makeMemberLeave", "called...handle,roomid", (_a = socket.user) === null || _a === void 0 ? void 0 : _a.handle, socket.roomId);
        if (!socket.roomId)
            return false;
        const currentUser = yield getMemberFromRoom(prisma, socket.user.handle, socket.roomId);
        (0, config_1.logger)("makeMemberLeave", "currentUser: ", currentUser);
        if (!currentUser) {
            (0, config_1.logger)("makeMemberLeave", "No member found with handle,room: ", (_b = socket.user) === null || _b === void 0 ? void 0 : _b.handle, socket.roomId);
            return;
        }
        yield prisma.member.updateMany({
            where: {
                AND: {
                    handle: (_c = socket.user) === null || _c === void 0 ? void 0 : _c.handle,
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
        const activeLeader = yield prisma.member.count({
            where: {
                roomId: socket.roomId,
                isConnected: true,
                isLeader: true,
            },
        });
        if (activeLeader > 0) {
            return yield returnRoomWithActiveMembersInOrder(prisma, socket.roomId);
        }
        (0, config_1.logger)("makeMemberLeave", "room: ", room === null || room === void 0 ? void 0 : room.members);
        let activeMembersWithHigherPC = room === null || room === void 0 ? void 0 : room.members.filter((m) => m.leaderPriorityCounter > currentUser.leaderPriorityCounter);
        let activeMembersWithLowerPC = room === null || room === void 0 ? void 0 : room.members.filter((m) => m.leaderPriorityCounter < currentUser.leaderPriorityCounter);
        if (activeMembersWithHigherPC && activeMembersWithHigherPC.length > 0) {
            // check if there's another connected member, give leader to lowest priorityCounter
            const updatedLeaderMember = yield prisma.member.updateMany({
                where: {
                    handle: activeMembersWithHigherPC[0].handle || "",
                    roomId: socket.roomId,
                },
                data: {
                    isLeader: true,
                },
            });
            (0, config_1.logger)("makeMemberLeave", "updatedLeaderMember: ", updatedLeaderMember);
            return yield returnRoomWithActiveMembersInOrder(prisma, socket.roomId);
        }
        else {
            if (activeMembersWithLowerPC && activeMembersWithLowerPC.length > 0) {
                return yield returnRoomWithActiveMembersInOrder(prisma, socket.roomId);
            }
            else {
                // no active members in the room so dispose it off
                (0, config_1.logger)("makeMemberLeave", "room empty: ", socket.roomId);
                return false;
            }
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
        const updatedLeaderMember = yield prisma.member.updateMany({
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
        (0, config_1.logger)("giveLeader", "updatedLeaderMember: ", updatedLeaderMember);
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
    (0, config_1.logger)("deleteInactiveRooms", "found inactive rooms: ", rooms.length);
    for (const room of rooms) {
        (0, config_1.logger)("deleteInactiveRooms", "deleting inactive room: ", room.id);
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
    (0, config_1.logger)("initializeSocketServer", "initializing socket server...");
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
