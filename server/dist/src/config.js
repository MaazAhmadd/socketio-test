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
exports.clearCacheAndLog = exports.makeRoute = exports.logger = exports.disableGlobalLogging = exports.mongodb = void 0;
const recachegoose_1 = __importDefault(require("recachegoose"));
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
    "/user/updateusername": true,
    "/user/updateuserhandle": true,
    "/user/updateuserpassword": true,
    "/user/updateuserpfp": true,
    "/user/sendFriendRequest/:receiverId": true,
    "/user/cancelFriendRequest/:receiverId": true,
    "/user/acceptFriendRequest/:senderId": true,
    "/user/rejectFriendRequest/:senderId": true,
    "/user/removeFriend/:friendId": true,
    "/user/fetchFriendlist": true,
    "/user/fetchFriendRequestsReceived": true,
    "/user/fetchFriendRequestsSent": true,
    "/user/getuser/:id": true,
    "/user/getCurrentUser": true,
    "/user/search": true,
    "/user/check": true,
    "/user/login": true,
    "/user/clearCache": true,
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
        const datenow = new Date();
        let hr = datenow.getHours(), m = datenow.getMinutes(), s = datenow.getSeconds();
        console.log(`[${hr % 12}:${m}:${s}][${fnName}] ${label} : `, ...args);
    }
}
exports.logger = logger;
function makeRoute(route, endpoint, middleware, router, fn, errorMsg = "error on the server, check logs") {
    return router[route](endpoint, middleware, (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            yield fn(req, res);
        }
        catch (error) {
            logger(endpoint, errorMsg, error);
            if (process.env.NODE_ENV === "production") {
                res.status(500).send(errorMsg);
            }
            else {
                if (error instanceof Error)
                    res.status(500).send(error.message);
            }
        }
    }));
}
exports.makeRoute = makeRoute;
function clearCacheAndLog(endpoint, keys) {
    if (keys == null) {
        recachegoose_1.default.clearCache(null, () => {
            logger(endpoint, "all cache cleared");
        });
    }
    else {
        keys.forEach((key) => {
            recachegoose_1.default.clearCache(key, () => {
                logger(endpoint, "cache cleared for key", key);
            });
        });
    }
}
exports.clearCacheAndLog = clearCacheAndLog;
