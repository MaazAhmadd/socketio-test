import express, { Request, Response } from "express";
import { authUser } from "./userRouter";
import { checkIfMemberAlreadyActive } from "./socketServer";
const router = express.Router();

router.get(
  "/publicrooms",
  authUser,
  async ({ prisma, body, ...req }: Request, res: Response) => {
    console.log("[room/publicrooms]: ", req.user?.handle);

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
          members: {
            where: {
              isConnected: true,
            },
            orderBy: {
              leaderPriorityCounter: "asc",
            },
          },
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
router.get(
  "/checkActiveMember",
  authUser,
  async (req: Request, res: Response) => {
    try {
      if (!req.prisma) return;
      const isMemberAlreadyActive = await checkIfMemberAlreadyActive(
        req.user?.handle,
        req.prisma,
      );
      res.status(200).json(isMemberAlreadyActive);
    } catch (error) {
      res.status(500).json({
        errorMessage:
          "An error occurred on the server. [get - /api/room/checkActiveMember]",
        error,
      });
    }
  },
);

export default router;

// let roomss = [
//   {
//     id: "4bf817d4-17ee-44a5-9d2e-291333434f35",
//     status: "Public",
//     videoPlayer: {
//       id: "d460ddee-0181-4ea9-8cf8-a920448197d8",
//       isPlaying: false,
//       sourceUrl: "https://www.youtube.com/watch?v=0-S5a0eXPoc",
//       thumbnailUrl: "https://i.ytimg.com/vi/0-S5a0eXPoc/sddefault.jpg",
//       title: "React Native Tutorial for Beginners - Build a React Native App",
//       totalDuration: 0,
//       playedTill: 0,
//       roomId: "4bf817d4-17ee-44a5-9d2e-291333434f35",
//     },
//     members: [
//       {
//         id: "6094778a-caf3-4007-a05b-94d6d174a8d4",
//         name: "user1name",
//         handle: "user1handle",
//         roomId: "4bf817d4-17ee-44a5-9d2e-291333434f35",
//       },
//       {
//         id: "6094778a-caf3-4007-a05b-94d6d174a8d4",
//         name: "user1name",
//         handle: "user1handle",
//         roomId: "4bf817d4-17ee-44a5-9d2e-291333434f35",
//       },
//       {
//         id: "6094778a-caf3-4007-a05b-94d6d174a8d4",
//         name: "user1name",
//         handle: "user4handle",
//         roomId: "4bf817d4-17ee-44a5-9d2e-291333434f35",
//       },
//       {
//         id: "6094778a-caf3-4007-a05b-94d6d174a8d4",
//         name: "user1name",
//         handle: "user1handle",
//         roomId: "4bf817d4-17ee-44a5-9d2e-291333434f35",
//       },
//       {
//         id: "6094778a-caf3-4007-a05b-94d6d174a8d4",
//         name: "user1name",
//         handle: "user1handle",
//         roomId: "4bf817d4-17ee-44a5-9d2e-291333434f35",
//       },
//       {
//         id: "6094778a-caf3-4007-a05b-94d6d174a8d4",
//         name: "user1name",
//         handle: "user1handle",
//         roomId: "4bf817d4-17ee-44a5-9d2e-291333434f35",
//       },
//       {
//         id: "6094778a-caf3-4007-a05b-94d6d174a8d4",
//         name: "user2name",
//         handle: "user2handle",
//         roomId: "4bf817d4-17ee-44a5-9d2e-291333434f35",
//       },
//       {
//         id: "6094778a-caf3-4007-a05b-94d6d174a8d4",
//         name: "user1name",
//         handle: "user1handle",
//         roomId: "4bf817d4-17ee-44a5-9d2e-291333434f35",
//       },
//       {
//         id: "6094778a-caf3-4007-a05b-94d6d174a8d4",
//         name: "user1name",
//         handle: "user1handle",
//         roomId: "4bf817d4-17ee-44a5-9d2e-291333434f35",
//       },
//       {
//         id: "6094778a-caf3-4007-a05b-94d6d174a8d4",
//         name: "user1name",
//         handle: "user3handle",
//         roomId: "4bf817d4-17ee-44a5-9d2e-291333434f35",
//       },
//       {
//         id: "6094778a-caf3-4007-a05b-94d6d174a8d4",
//         name: "user1name",
//         handle: "user1handle",
//         roomId: "4bf817d4-17ee-44a5-9d2e-291333434f35",
//       },
//     ],
//   },
// ];
// let uniqueMembers = Array.from(
//   roomss[0].members
//     .reduce((map, item) => map.set(item.handle, item), new Map())
//     .values(),
// );
// console.log(uniqueMembers);
