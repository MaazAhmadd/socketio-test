import express, { Request, RequestHandler, Response } from "express";
import { authUser } from "./userRouter";
import { checkIfMemberAlreadyActive } from "./socketServer";
import { FnNames, logger, makeRoute } from "./config";
const router = express.Router();
makeRoute(
  "get",
  "/room/publicrooms",
  [authUser],
  router,
  async function (req, res) {
    const rooms = await req.prisma?.room.findMany({
      where: {
        members: {
          some: {
            isConnected: true,
          },
        },
      },
      include: {
        members: {
          where: {
            isConnected: true,
          },
          orderBy: {
            leaderPC: "asc",
          },
        },
        videoPlayer: true,
      },
      take: 10,
    });
    res.status(200).json(rooms);
  },
);

makeRoute(
  "get",
  "/room/checkActiveMember",
  [authUser],
  router,
  async function (req, res) {
    const member = await req.prisma!.member.findFirst({
      where: {
        mongoId: req.user?._id,
        isConnected: true,
      },
    });
    res.status(200).json(member ? true : false);
  },
);

export default router;
