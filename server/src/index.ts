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
import socketServer from "./socketServer";
import userRouter from "./userRouter";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

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
  })
);

connectDB();

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents
>(server, {
  cors: {
    origin: "*",
  },
});
socketServer(io, prisma);

app.get("/api/test", (req, res) => res.send("Express Ready"));
app.use("/api/user", userRouter);
app.use("/api/room", roomRouter);

server.listen(port, () => {
  console.log("server running at http://localhost:" + port);
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
