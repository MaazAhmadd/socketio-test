import express, { Request, RequestHandler, Response } from "express";
import { authUser } from "./userRouter";
import { checkIfMemberAlreadyActive } from "./socketServer";
import { FnNames, logger } from "./config";
const router = express.Router();
makeRoute(
  "get",
  "/room/publicrooms",
  [authUser],
  async function (req: Request, res: Response) {
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
  async function (req: Request, res: Response) {
    const isMemberAlreadyActive = await checkIfMemberAlreadyActive(
      req.user?.handle,
      req.prisma!,
    );
    res.status(200).json(isMemberAlreadyActive);
  },
);

function makeRoute(
  route: "get" | "post" | "put" | "delete" | "patch" | "options" | "head",
  endpoint: FnNames,
  middleware: RequestHandler[],
  fn: (req: Request, res: Response) => Promise<any>,
  // router: Router,
  errorMsg: string = "error on the server, check logs",
) {
  return router[route](
    endpoint,
    middleware,
    async (req: Request, res: Response) => {
      try {
        await fn(req, res);
      } catch (error) {
        logger(endpoint, errorMsg, error);
        if (process.env.NODE_ENV === "production") {
          res.status(500).send(errorMsg);
        } else {
          if (error instanceof Error) res.status(500).send(error.message);
        }
      }
    },
  );
}
export default router;
