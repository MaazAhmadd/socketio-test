import { io, Socket } from "socket.io-client";
import {
	ClientToServerEvents,
	ServerToClientEvents,
} from "../server/src/types";
import { SOCKET_URL } from "./lib/config";

type CustomSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
export const socket: CustomSocket = io(SOCKET_URL, {
	auth:{
    token: localStorage.getItem("auth_token")
  },
	extraHeaders: {
    "ngrok-skip-browser-warning": "true"
  },
	autoConnect: false,
	// query: { token: localStorage.getItem("auth_token") },
});

// socket.io.on("reconnect_attempt", () => {
//   socket.io.opts.query = { token: localStorage.getItem("auth_token") };
// });
