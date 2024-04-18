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
    // roomRouter.ts
    "/room/publicrooms": false,
    "/room/checkActiveMember": true,
    // userRouter.ts
    "authUser middleware": true,
    "/user/register": true,
    "/user/updateuser/:id": true,
    "/user/sendFriendRequest/:receiverHandle": true,
    "/user/acceptFriendRequest/:senderHandle": true,
    "/user/removeFriend/:friendHandle": true,
    "/user/fetchFriendlist": true,
    "/user/fetchFriendRequestsReceived": true,
    "/user/fetchFriendRequestsSent": true,
    "/user/getuser/:id": true,
    "/user/getCurrentUser": true,
    "/user/all": true,
    "/user/search": true,
    "/user/check": true,
    "/user/login": true,
    // ytRouter.ts
    "/ytservice": true,
    "/ytservice/search": true,
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
