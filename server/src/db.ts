import mongoose from "mongoose";
import { logger, mongodb } from "./config";
import cachegoose from "recachegoose";
import redis from "./redis-om/client";
import redisSchemas from "./redis-om/schemas";

// const memberRepository = redisSchemas.member;
const roomRepository = redisSchemas.room;

export const connectDB = async () => {
  try {
    cachegoose(mongoose, {
      engine: "memory",
    });
    await mongoose.connect(mongodb);
    logger(
      "connectDB",
      `MongoDB Connected... ${
        mongodb.includes("localhost") ? "local" : "remote"
      }`,
    );
    await redis.connect();
    // await memberRepository.createIndex();
    await roomRepository.createIndex();
    logger("connectDB", "Redis OM index created for members and rooms...");
  } catch (err) {
    if (err instanceof Error)
      logger("connectDB", "Error connecting to DB:", err);

    // Exit process with failure
    process.exit(1);
  }
};

// export const prisma = new PrismaClient();
