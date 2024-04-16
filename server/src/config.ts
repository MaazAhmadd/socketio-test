export const mongodb =
  process.env.NODE_ENV === "production"
    ? (process.env.MONGODB_CON_STRING as string)
    : "mongodb://localhost:27017/chatappAuth";

export const disableGlobalLogging =
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
} as const;

type FnNames = keyof typeof loggingFns;

export function logger(fnName: FnNames, label: string = "", ...args: any[]) {
  if (disableGlobalLogging) {
    return;
  }
  if (loggingFns[fnName] === true) {
    console.log(`[${fnName}] ${label} : `, ...args);
  }
}
