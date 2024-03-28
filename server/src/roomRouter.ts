import express, { Request, Response } from "express";
const router = express.Router();

router.get(
  "/allrooms",
  /* authUser, */ async (
    { prisma, body, user, ...req }: Request,
    res: Response
  ) => {
    try {
      const rooms = await prisma?.room.findMany({
        include: {
          members: true,
          videoPlayer: true,
        },
        take: 10,
      });
      res.status(200).json(rooms);
    } catch (error) {
      res.status(500).json({
        errorMessage:
          "An error occurred on the server. [get - /api/room/allrooms]",
        error,
      });
    }
  }
);

export default router;
