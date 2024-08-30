import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import {
  ClientToServerEvents,
  NormalUser,
  InterServerEvents,
  ServerToClientEvents,
  RedisSchemas,
} from "./types";
import { connectDB } from "./db";
import roomRouter from "./routers/roomRouter";
import userRouter from "./routers/userRouter";
import ytRouter from "./routers/ytRouter";
import socketServer, { deleteInactiveRooms } from "./socketServer";
import cors from "cors";
import { disableGlobalLogging, logger } from "./config";
import redisSchemas from "./redis-om/schemas";
import mongooseModels from "./mongoose/models";
const port = process.env.PORT || 3000;
const app = express();
const server = createServer(app);

app.use(express.json());
app.use(
  cors({
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "x-auth-token",
    ],
  }),
);

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents
>(server, {
  cors: {
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "x-auth-token",
    ],
  },
});
connectDB().then(() => {
  socketServer(io);
  // setTimeout(() => {
  // setInterval(
  //   async () => {
  //     logger("deleteInactiveRooms", "checking inactive rooms to delete...");
  //     await deleteInactiveRooms(prisma);
  //   },
  //   process.env.NODE_ENV === "production"
  //     ? 1000 * 60 * 60 * 24 // 1 day
  //     : 1000 * 60 * 5, // 5 minutes
  // );
  // setInterval(() => deleteInactiveRooms(prisma), 86_400_000);
  // }, 10_000);
  // }, 86_400_000);

  app.get("/api/test", (req, res) => res.send("Express Ready"));
  app.use("/api", userRouter);
  app.use("/api", roomRouter);
  app.use("/api", ytRouter);

  server.listen(port, () => {
    if (disableGlobalLogging) {
      console.log("[production] server running at http://localhost:" + port);
      console.log("logging disabled");
    }
    logger("server", "server running at http://localhost:" + port);
  });
});

module.exports = app;

declare module "express-serve-static-core" {
  export interface Request {
    user?: { _id: string };
    redisSchemas?: RedisSchemas;
    mongooseModels?: typeof mongooseModels;
    // Add other properties as needed
  }
}

declare module "mongoose" {
  export interface Query<
    ResultType,
    DocType extends Document<any, any, any>,
    THelpers = {},
    RawDocType = DocType,
    QueryOp = "find"
  > {
    cache(ttl?: number, customKey?: string): this;
  }
}

// declare module "mongoose" {
//   export interface Query<T, DocType extends Document, THelpers = {}> {
//     cache(ttl?: number, customKey?: string): this;
//   }
// }
