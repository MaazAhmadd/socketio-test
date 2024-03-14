import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
// import cors from "cors";
import {
  ClientToServerEvents,
  InterServerEvents,
  Rooms,
  ServerToClientEvents,
} from "../types/types";
import { connectDB } from "./db";
import roomRouter from "./roomRouter";
import socketServer from "./socketServer";
import userRouter from "./userRouter";

const app = express();
const server = createServer(app);

connectDB();
// console.log(
//   "jwt key: ",
//   process.env.JWT_PRIVATE_KEY || ""
// );

app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents
>(server, {
  cors: {
    origin: "*",
  },
});

socketServer(io);

app.use("/api/user", userRouter); 
app.use("/api/room", roomRouter);

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
 