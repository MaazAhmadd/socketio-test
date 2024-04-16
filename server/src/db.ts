import mongoose from "mongoose";
import { PrismaClient } from "@prisma/client";
import { logger, mongodb } from "./config";
export const connectDB = async (): Promise<void> => {
  try {
    logger("connectDB", " connecting to DB... ", mongodb);

    await mongoose.connect(mongodb);
    logger("connectDB", "MongoDB Connected...");
  } catch (err) {
    if (err instanceof Error) console.error("[db] error", err);
    // Exit process with failure
    process.exit(1);
  }
};

export const prisma = new PrismaClient();
