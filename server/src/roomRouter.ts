import express, { Request, Response } from "express";
const router = express.Router();

router.get(
  "/publicrooms",
  async ({ prisma, body, ...req }: Request, res: Response) => {
    // res.status(200).json(roomss);
    // return;
    try {
      const rooms = await prisma?.room.findMany({
        where: {
          members: {
            some: {
              isConnected: true,
            },
          },
        },
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
  },
);

export default router;
