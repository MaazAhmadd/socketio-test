// import cachegoose from "recachegoose";
// import { logger } from "./logger";

export const mongodb_url =
	process.env.NODE_ENV === "production"
		? (process.env.MONGODB_CON_STRING as string)
		: "mongodb://localhost:27017/chatappAuth";

export const redis_url =
	process.env.NODE_ENV === "production"
		? (process.env.REDIS_URL as string)
		: "redis://localhost:6379";

// export function clearCacheAndLog(endpoint: string, keys: string[] | null) {
// 	if (keys == null) {
// 		cachegoose.clearCache(null, () => {
// 			logger.info(endpoint + " all cache cleared");
// 		});
// 	} else {
// 		keys.forEach((key) => {
// 			cachegoose.clearCache(key, () => {
// 				logger.info(endpoint + " cache cleared for key " + key);
// 			});
// 		});
// 	}
// }
