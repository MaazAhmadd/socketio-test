import { createClient } from "redis";
import { redis_url } from "../config";
import { logger } from "../logger";

const redis = createClient({
	url: redis_url,
	socket: {
		reconnectStrategy: (retries) => {
			return Math.min(retries * 100, 3000);
		},
	},
});
redis.on("connect", () => {
	logger.info(
		`Redis Connected... ${
			redis_url.includes("localhost") ? "local" : "remote"
		}`,
	);
});

redis.on("reconnecting", () => {
	logger.info("Reconnecting to Redis...");
});

redis.on("error", (err) => {
	logger.info("Redis connection error:", err);
});

redis.on("end", () => {
	logger.info("Redis Disconnected");
});

export default redis;
