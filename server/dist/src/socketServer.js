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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function socketServer(io, prisma) {
    // auth middleware
    io.use((socket, next) => {
        var _a, _b;
        try {
            const token = (_b = (_a = socket.handshake) === null || _a === void 0 ? void 0 : _a.query) === null || _b === void 0 ? void 0 : _b.token;
            if (typeof token != "string") {
                return next(new Error("Authentication error"));
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_PRIVATE_KEY || "");
            if (decoded) {
                socket.user = decoded;
                next();
            }
            else {
                next(new Error("Authentication error"));
            }
        }
        catch (error) {
            next(new Error("Authentication error: " + error));
        }
    });
    io.on("connection", (socket) => {
        socket.on("createRoom", () => __awaiter(this, void 0, void 0, function* () {
            const isNotInRoom = yield checkIfMemberAlreadyActive(socket, prisma);
            if (isNotInRoom) {
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
            const isNotInRoom = yield checkIfMemberAlreadyActive(socket, prisma);
            if (isNotInRoom) {
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
            if (socket.roomId) {
                const updatedRoom = yield makeMemberLeave(prisma, socket);
                if (updatedRoom) {
                    io.in(updatedRoom.id).emit("roomDesc", updatedRoom);
                }
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
        const rooms = yield prisma.room.findMany({
            where: {
                members: {
                    some: {
                        handle: ((_a = socket.user) === null || _a === void 0 ? void 0 : _a.handle) || "",
                        isConnected: true,
                    },
                },
            },
        });
        if (rooms.length > 0) {
            return true;
        }
        else {
            return false;
        }
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
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const currentUser = yield getMemberByHandle(prisma, (_a = socket.user) === null || _a === void 0 ? void 0 : _a.handle);
        const room = yield prisma.room.findUnique({
            where: {
                id: socket.roomId,
            },
            include: {
                members: {
                    where: {
                        leaderPriorityCounter: {
                            gt: currentUser === null || currentUser === void 0 ? void 0 : currentUser.leaderPriorityCounter,
                        },
                        isConnected: true,
                    },
                    orderBy: {
                        leaderPriorityCounter: "asc",
                    },
                    take: 1,
                },
            },
        });
        if (room.members.length > 0) {
            // check if there's another connected member, give leader to lowest priorityCounter
            yield prisma.member.update({
                where: {
                    id: room.members[0].id,
                },
                data: {
                    isLeader: true,
                },
            });
            yield prisma.member.update({
                where: {
                    handle: (_b = socket.user) === null || _b === void 0 ? void 0 : _b.handle,
                },
                data: {
                    isLeader: false,
                    isConnected: false,
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
            yield prisma.room.delete({
                where: {
                    id: socket.roomId,
                },
            });
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
