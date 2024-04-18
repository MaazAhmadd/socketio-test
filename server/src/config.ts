export const mongodb =
  process.env.NODE_ENV === "production"
    ? (process.env.MONGODB_CON_STRING as string)
    : "mongodb://localhost:27017/chatappAuth";

export const disableGlobalLogging =
  // true // enable global logging
  process.env.NODE_ENV === "production" ? true : false;
const loggingFns = {
  // roomRouter.ts
  "/room/publicrooms": false,
  "/room/checkActiveMember": true,
  // userRouter.ts
  "authUser middleware": true,
  "/user/register": true,
  "/user/updateuser": true,
  "/user/sendFriendRequest": true,
  "/user/acceptFriendRequest": true,
  "/user/removeFriend": true,
  "/user/fetchFriendlist": true,
  "/user/fetchFriendRequestsReceived": true,
  "/user/fetchFriendRequestsSent": true,
  "/user/getuser": true,
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
} as const;

export type FnNames = keyof typeof loggingFns;

export function logger(fnName: FnNames, label: string = "", ...args: any[]) {
  if (disableGlobalLogging) {
    return;
  }
  if (loggingFns[fnName] === true) {
    console.log(`[${fnName}] ${label} : `, ...args);
  }
}
