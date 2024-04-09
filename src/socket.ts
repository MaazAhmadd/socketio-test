import { io, Socket } from "socket.io-client";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "../server/types/types";

const URL =
  process.env.NODE_ENV == "development"
    ? "http://localhost:3000/"
    : "https://socketiotest.adaptable.app/";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  URL as string,
  {
    autoConnect: false,
    query: { token: localStorage.getItem("auth_token") },
  },
);

// socket.io.on("reconnect_attempt", () => {
//   socket.io.opts.query = { token: localStorage.getItem("auth_token") };
// });
