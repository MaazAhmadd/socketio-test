"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.disableGlobalLogging = exports.mongodb = void 0;
exports.mongodb = process.env.NODE_ENV === "production"
    ? process.env.MONGODB_CON_STRING
    : "mongodb://localhost:27017/chatappAuth";
exports.disableGlobalLogging = 
// true // enable global logging
process.env.NODE_ENV === "production" ? true : false;
const loggingFns = {
    // socketServer.ts
    "auth middleware": false,
    "socket createRoom": true,
    "socket disconnect": true,
    "socket leaveRoom": true,
    makeMemberLeave: true,
    initializeSocketServer: true,
    deleteInactiveRooms: true,
    joinRoom: true,
    makeRoom: true,
    giveLeader: true,
    // db.ts
    connectDB: true,
    // index.ts
    server: true,
    // roomRouter.ts
    "/api/room/publicrooms": false,
    "/api/room/checkActiveMember": true,
    // userRouter.ts
    "authUser middleware": true,
    "/api/user/register": true,
    "/api/user/updateuser": true,
    "/api/user/sendFriendRequest": true,
    "/api/user/acceptFriendRequest": true,
    "/api/user/getuser": true,
    "/api/user/all": true,
    "/api/user/search": true,
    "/api/user/check": true,
    "/api/user/login": true,
    // ytRouter.ts
    "/api/ytservice": true,
    "/api/ytservice/search": true,
    youTubeGetID: true,
    getVideoInfo: true,
};
function logger(fnName, label = "", ...args) {
    if (exports.disableGlobalLogging) {
        return;
    }
    if (loggingFns[fnName] === true) {
        console.log(`[${fnName}] ${label} : `, ...args);
    }
}
exports.logger = logger;
