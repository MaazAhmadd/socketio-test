import { io, Socket } from "socket.io-client";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "../server/types/types";
// "undefined" means the URL will be computed from the `window.location` object
const URL =
  process.env.NODE_ENV == "development"
    ? "http://localhost:3000/"
    : "https://socketiotest.adaptable.app/";

const token = localStorage.getItem("auth_token");
export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  URL as string,
  // "http://localhost:3000/",
  { autoConnect: false, query: { token } }
);
// socket.io.on("reconnect_attempt", () => {
//   socket.io.opts.query = { token: localStorage.getItem("auth_token") };
// });
