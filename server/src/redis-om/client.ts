import { createClient } from "redis";
import { logger, redis_url } from "../config";
  
const redis = createClient({
  url: redis_url,
  socket: {
    reconnectStrategy: (retries) => {
      return Math.min(retries * 100, 3000);
    },
  },
});
redis.on("connect", () => {
  logger("connectDB", "Redis Connected...",redis_url.includes("localhost") ? "local" : "remote");
});

redis.on("reconnecting", () => {
  logger("connectDB", "Reconnecting to Redis...");
});

redis.on("error", (err) => {
  logger("connectDB", "Redis connection error:", err);
});

redis.on("end", () => {
  logger("connectDB", "Disconnected from Redis");
});

export default redis;
