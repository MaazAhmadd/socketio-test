import mongoose from "mongoose";
import { PrismaClient } from "@prisma/client";
import DB_CON from "./config";
export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(DB_CON.mongodb);
    console.log("MongoDB Connected...");
  } catch (err) {
    if (err instanceof Error) console.error(err.message);
    // Exit process with failure
    process.exit(1);
  }
};

export const prisma = new PrismaClient();
