import cors from "cors";
import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import { createServer } from "node:http";
import { Server as IOSERVER } from "socket.io";
import { connectDB } from "./db";
import { logger } from "./logger";
import { allRequestLoggerMiddlerware, errorHandler } from "./middlewares";
import mongooseModels from "./mongoose/models";
import roomRouter from "./routers/roomRouter";
import userRouter from "./routers/userRouter";
import ytRouter from "./routers/ytRouter";
import socketServer from "./socketServer";
import {
	ClientToServerEvents,
	InterServerEvents,
	ServerToClientEvents,
} from "./types";
import { RedisSchemas } from "./redis-om/schemas";

const port = process.env.PORT || 3000;
const app = express();
const server = createServer(app);
const allowedHeaders = [
	"Origin",
	"X-Requested-With",
	"Content-Type",
	"Accept",
	"Authorization",
	"x-auth-token",
	"ngrok-skip-browser-warning",
];

app.use(express.json());
app.use(
	cors({
		allowedHeaders,
		origin: "*",
	}),
);

const io = new IOSERVER<
	ClientToServerEvents,
	ServerToClientEvents,
	InterServerEvents
>(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
		credentials: true,
		allowedHeaders,
	},
});
// >(server, { cors: { allowedHeaders } });

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

	// if (process.env.NODE_ENV !== "production") {
	app.use(allRequestLoggerMiddlerware);
	// }

	app.get("/test", (req, res) => res.send("Express Ready"));
	app.use("/user", userRouter);
	app.use("/room", roomRouter);
	app.use("/ytservice", ytRouter);

	app.use(errorHandler);

	// server.listen(3000, "0.0.0.0", () =>
	server.listen(port, () => {
		logger.info(`server running at http://localhost:${port}`);
		console.log(`server running at http://localhost:${port}`);
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
		THelpers,
		RawDocType = DocType,
		QueryOp = "find",
	> {
		cache(ttl?: number, customKey?: string): this;
	}
}
