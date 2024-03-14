import { io, Socket } from "socket.io-client";
import {
  ServerToClientEvents,
  ClientToServerEvents,
} from "../server/types/types";
// "undefined" means the URL will be computed from the `window.location` object
const URL =
  process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000";
 
const token = localStorage.getItem("auth_token");
export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  URL as string,
  { autoConnect: false, query: { token } }
);
