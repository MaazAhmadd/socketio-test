import express, { Request, Response } from "express";
const router = express.Router();
import { PrismaClient } from "@prisma/client";
import { authUser } from "./userRouter";

const prisma = new PrismaClient();

router.post("/create", authUser, async (req: Request, res: Response) => {
  try {
    const newRoom = await prisma.room.create({
      data: {
        members: {
          create: [{
            name: req.user?.name || "",
            profilePicture: req.user?.profilePicture || "",
            handle: req.user?.handle || "",
            isConnected: true,
            isLeader: true,
            micEnabled: false,
          }],
        },
        videoPlayer: {
          create: {
            isPlaying: false,
            source: "",
            duration: 0,
            playStatus: "paused",
          },
          
        },
        lastEmpty: Date.now(),
        status: "Public",
      },
    });
    res.status(201).json(newRoom);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while creating the room." });
  }
});


export default router;
// id          Int          @id @default(autoincrement())
//   members     Member[]
//   videoPlayer VideoPlayer?
//   lastEmpty   String
//   status      String       @default("Public")
//   kicked      Kicked[]

// {
//   id         Int     @id @default(autoincrement())
//   isPlaying  Boolean
//   source     String
//   duration   Int
//   playStatus String
//   Room       Room?   @relation(fields: [roomId], references: [id])
//   roomId     Int     @unique
// }
