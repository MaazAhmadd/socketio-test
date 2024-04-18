import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
// import cors from "cors";
import {
  ClientToServerEvents,
  DecodedUser,
  InterServerEvents,
  ServerToClientEvents,
} from "../types/types";
import { connectDB } from "./db";
import roomRouter from "./roomRouter";
import userRouter from "./userRouter";
import ytRouter from "./ytRouter";
import socketServer, { deleteInactiveRooms } from "./socketServer";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { disableGlobalLogging, logger } from "./config";

const port = process.env.PORT || 3000;
const app = express();
const server = createServer(app);
const prisma = new PrismaClient();

app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});
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

connectDB();

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
socketServer(io, prisma);
// setTimeout(() => {
setInterval(
  async () => {
    logger("deleteInactiveRooms", "checking inactive rooms to delete...");
    await deleteInactiveRooms(prisma);
  },
  process.env.NODE_ENV === "production"
    ? 1000 * 60 * 60 * 24 // 1 day
    : 1000 * 60 * 5, // 5 minutes
);
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

// prisma disconnect
process.on("SIGINT", () => {
  prisma.$disconnect();
  process.exit();
});

process.on("SIGTERM", () => {
  prisma.$disconnect();
  process.exit();
});
module.exports = app;

declare module "express-serve-static-core" {
  export interface Request {
    user?: DecodedUser;
    prisma?: PrismaClient;
    // Add other properties as needed
  }
}
