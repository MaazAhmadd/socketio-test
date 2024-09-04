import { Request, RequestHandler, Response, Router } from "express";
import cachegoose from "recachegoose";

export const mongodb =
  process.env.NODE_ENV === "production"
    ? (process.env.MONGODB_CON_STRING as string)
    : // : (process.env.MONGODB_CON_STRING as string);
      "mongodb://localhost:27017/chatappAuth";

export const disableGlobalLogging = false; // enable global logging
// process.env.NODE_ENV === "production" ? true : false;
const loggingFns = {
  // roomRouter.ts
  "/room/userrooms": true,
  "/room/checkActiveMember": true,
  "/room/makeRoom": true,
  "/room/deleteAllRooms": true,
  "/room/deleteAllMembers": true,
  "/room/getRoom/:roomId": true,
  // userRouter.ts
  "authUser-middleware": true,
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
  "/user/unfriendAll": true,
  // ytRouter.ts
  "/ytservice": true,
  "/ytservice/search": true,
  "/ytservice/test": true,
  // socketServer.ts
  "socket-event": true,
  "auth-middleware": true,
  "socket-createRoom": true,
  "socket-disconnect": true,
  "socket-leaveRoom": true,
  makeMemberLeave: true,
  initializeSocketServer: true,
  deleteInactiveRooms: true,
  joinRoom: true,
  makeRoom: true,
  giveLeader: true,
  sendMessage: true,
  // db.ts
  connectDB: true,
  // index.ts
  server: true,
  youTubeGetID: true,
  getVideoInfo: true,
} as const;

export type FnNames = keyof typeof loggingFns;

export function logger(fnName: FnNames, label: string = "", ...args: any[]) {
  // if (disableGlobalLogging) {
  //   return;
  // }
  // const only: FnNames[] = [
  //   "joinRoom",
  //   "makeMemberLeave",
  //   "server",
  //   "connectDB",
  //   "/room/userrooms"
  // ];
  if (loggingFns[fnName] === true) {
    // if (only && !only.includes(fnName)) {
    //   return;
    // }
    const datenow = new Date();
    let hr: any = datenow.getHours(),
      m: any = datenow.getMinutes(),
      s: any = datenow.getSeconds();

    console.log(
      `[${hr % 12}:${m}:${s}][${fnName}] ${label}${args.length > 0 ? ":" : ""} `,
      ...args,
    );
  }
}

export function makeRoute(
  route: "get" | "post" | "put" | "delete" | "patch" | "options" | "head",
  endpoint: FnNames,
  middleware: RequestHandler[],
  router: Router,
  fn: (req: Request, res: Response) => Promise<any>,
  errorMsg: string = "error on the server, check logs",
) {
  return router[route](
    endpoint,
    middleware,
    async (req: Request, res: Response) => {
      try {
        logger(endpoint, "started");
        await fn(req, res);
      } catch (error) {
        console.trace("[logger] error: ", error);
        // logger(endpoint, errorMsg, error);
        if (process.env.NODE_ENV === "production") {
          // res.status(500).send(errorMsg);
          if (error instanceof Error) {
            res.status(500).json({
              errorName: error.name,
              errorMessage: error.message,
              errorStack: error.stack,
            });
          }
        } else {
          if (error instanceof Error) {
            res.status(500).json({
              errorName: error.name,
              errorMessage: error.message,
              errorStack: error.stack,
            });
          }
        }
      }
    },
  );
}

export function clearCacheAndLog(endpoint: FnNames, keys: string[] | null) {
  if (keys == null) {
    cachegoose.clearCache(null, () => {
      logger(endpoint, "all cache cleared");
    });
  } else {
    keys.forEach((key) => {
      cachegoose.clearCache(key, () => {
        logger(endpoint, "cache cleared for key", key);
      });
    });
  }
}
