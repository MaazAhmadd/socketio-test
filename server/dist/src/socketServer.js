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
exports.deleteInactiveRooms = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
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
                yield prisma.member.updateMany({
                    where: {
                        handle: (_c = socket.user) === null || _c === void 0 ? void 0 : _c.handle,
                    },
                    data: {
                        isConnected: true,
                    },
                });
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
        socket.on("createRoom", (url) => __awaiter(this, void 0, void 0, function* () {
            console.log("[socket createRoom] url received: ", url);
            const isActive = yield checkIfMemberAlreadyActive(socket, prisma);
            console.log("[socket createRoom] isActive: ", isActive);
            if (!isActive) {
                const room = yield makeRoom(socket, prisma);
                socket.roomId = room.id;
                socket.join(room.id);
                io.in(room.id).emit("roomDesc", room);
            }
            else {
                socket.emit("stateError", "user already in a room");
            }
        }));
        socket.on("joinRoom", (data) => __awaiter(this, void 0, void 0, function* () {
            const { roomId } = data;
            const isActive = yield checkIfMemberAlreadyActive(socket, prisma);
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
function makeRoom(socket, prisma) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
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
                        source: "",
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
function checkIfMemberAlreadyActive(socket, prisma) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const member = yield prisma.member.findUnique({
            where: {
                handle: (_a = socket.user) === null || _a === void 0 ? void 0 : _a.handle,
            },
        });
        return member === null || member === void 0 ? void 0 : member.isConnected;
    });
}
function joinRoom(socket, prisma, roomId) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const memberBeenToRoom = yield checkIfMemberBeenToThisRoomBefore(socket, prisma, roomId);
            if (memberBeenToRoom) {
                const member = yield getMemberByHandle(prisma, (_a = socket.user) === null || _a === void 0 ? void 0 : _a.handle);
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
                        roomId: roomId,
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
                                    handle: ((_b = socket.user) === null || _b === void 0 ? void 0 : _b.handle) || "",
                                    profilePicture: ((_c = socket.user) === null || _c === void 0 ? void 0 : _c.profilePicture) || "",
                                    name: ((_d = socket.user) === null || _d === void 0 ? void 0 : _d.name) || "",
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
            return yield prisma.room.findUnique({
                where: {
                    id: roomId,
                },
                include: {
                    members: true,
                    videoPlayer: true,
                },
            });
        }
        catch (error) {
            console.log("error while joining room", error);
        }
    });
}
function getMemberByHandle(prisma, handle) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield prisma.member.findUnique({
            where: {
                handle: handle,
            },
        });
    });
}
function getCurrentLeader(prisma, roomId) {
    return __awaiter(this, void 0, void 0, function* () {
        const room = yield prisma.room.findUnique({
            where: {
                id: roomId,
            },
            include: {
                members: {
                    where: {
                        isLeader: true,
                    },
                },
            },
        });
        return room.members[0];
    });
}
function checkIfMemberBeenToThisRoomBefore(socket, prisma, roomId) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const room = yield prisma.room.findUnique({
            where: {
                id: roomId,
            },
            include: {
                members: {
                    where: {
                        handle: ((_a = socket.user) === null || _a === void 0 ? void 0 : _a.handle) || "",
                    },
                },
            },
        });
        return room.members.length > 0;
    });
}
function makeMemberLeave(prisma, socket) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const currentUser = yield getMemberByHandle(prisma, (_a = socket.user) === null || _a === void 0 ? void 0 : _a.handle);
        if (!currentUser) {
            console.log(`[makeMemberLeave] No member found with handle: ${(_b = socket.user) === null || _b === void 0 ? void 0 : _b.handle}`);
            return;
        }
        yield prisma.member.update({
            where: {
                handle: (_c = socket.user) === null || _c === void 0 ? void 0 : _c.handle,
            },
            data: {
                isLeader: false,
                isConnected: false,
            },
        });
        if (!socket.roomId)
            return false;
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
            yield prisma.member.update({
                where: {
                    handle: _members ? _members[0].handle : "",
                },
                data: {
                    isLeader: true,
                },
            });
            return yield prisma.room.findUnique({
                where: {
                    id: socket.roomId,
                },
                include: {
                    members: true,
                    videoPlayer: true,
                },
            });
        }
        else {
            // no active members in the room so dispose it off
            // console.log("[makeMemberLeave] room empty: ", socket.roomId);
            return false;
        }
    });
}
function giveLeader(prisma, socket, targetMember) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const member = yield getMemberByHandle(prisma, (_a = socket.user) === null || _a === void 0 ? void 0 : _a.handle);
        if (!member) {
            console.error("wrong user handle");
            return false;
        }
        if ((member === null || member === void 0 ? void 0 : member.isLeader) == false) {
            console.error("member not leader");
            return false;
        }
        const target = yield getMemberByHandle(prisma, targetMember);
        if (!target) {
            console.error("wrong target handle");
            return false;
        }
        if (member.roomId != target.roomId) {
            console.error("current and target members not in same room");
            return false;
        }
        const currentLeaderPC = member === null || member === void 0 ? void 0 : member.leaderPriorityCounter;
        const targetMemberPC = target.leaderPriorityCounter;
        yield prisma.member.update({
            where: {
                handle: targetMember,
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
            yield prisma.member.update({
                where: {
                    handle: member.handle,
                },
                data: {
                    leaderPriorityCounter: { increment: 1 },
                },
            });
        }
        yield prisma.member.update({
            where: {
                handle: target.handle,
            },
            data: {
                leaderPriorityCounter: currentLeaderPC,
            },
        });
        // update leadership
        yield prisma.member.update({
            where: {
                handle: member.handle,
            },
            data: {
                isLeader: false,
            },
        });
        yield prisma.member.update({
            where: {
                handle: target.handle,
            },
            data: {
                isLeader: true,
            },
        });
        return yield prisma.room.findUnique({
            where: {
                id: socket.roomId,
            },
            include: {
                members: true,
                videoPlayer: true,
            },
        });
    });
}
function getCurrentLeaderPriorityCounter(prisma, roomId) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield getCurrentLeader(prisma, roomId)).leaderPriorityCounter;
    });
}
function getCurrentMemberPriorityCounter(prisma, socket) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        return (yield getMemberByHandle(prisma, (_a = socket.user) === null || _a === void 0 ? void 0 : _a.handle))
            .leaderPriorityCounter;
    });
}
const deleteInactiveRooms = (prisma) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("[deleteInactiveRooms] checking inactive rooms to delete");
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
    yield prisma.member.updateMany({
        where: {
            isConnected: true,
        },
        data: {
            isConnected: false,
        },
    });
});
