import express, { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { NormalUser } from "./types";
import { clearCacheAndLog, logger, makeRoute } from "./config";
import { User } from "./models";
import multer from "multer";
import cloudinary from "cloudinary";
import { z } from "zod";
import { Readable } from "stream";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cacheKeys = {
  FRIENDLIST: "friend-list-",
  FRIENDREQSRECEIVED: "friend-requests-received-",
  FRIENDREQSSENT: "friend-requests-sent-",
  USERNORMAL: "user-normal-",
  USERCURRENT: "user-current-",
  USERSEARCH: "user-search-",
  USERCHECK: "user-check-",
};

// middleware to check if x-auth-token token attached and valid
export const authUser = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["x-auth-token"];
  if (!token)
    return res.status(401).json({ error: "Access denied. No token provided." });
  try {
    const decoded = jwt.verify(
      token as string,
      process.env.JWT_PRIVATE_KEY || "",
    ) as { _id: string };

    req.user = decoded;
    next();
  } catch (ex) {
    logger("authUser middleware", "error in middleware: ", ex);
    res.status(400).json({ error: "Invalid token." });
  }
};

// Create user
makeRoute(
  "post",
  "/user/register",
  [],
  router,
  async function (req: Request, res: Response) {
    logger("/user/register", "register router req.body: ", req.body);
    const { name, handle, pfp, password } = req.body as NormalUser & {
      password: string;
    };
    let user = await User.findOne({ handle });
    // .cache(
    //   60,
    //   cacheKeys.USERNORMAL + handle,
    // );
    // .exec();
    if (user) {
      return res.status(200).send(user.generateAuthToken());
    }
    user = new User({ name, handle, pfp, password });
    await user.save();

    res.status(201).send(user.generateAuthToken());
  },
);

// Update user name
makeRoute(
  "put",
  "/user/updateusername",
  [authUser],
  router,
  async function (req: Request, res: Response) {
    const updateBodySchema = z.object({
      name: z.string().max(4096, "name is too long"),
    });
    const { error } = updateBodySchema.safeParse(req.body);
    if (error) {
      return res.status(400).send(error.issues[0].message);
    }
    const userId = req.user?._id;
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }
    user.name = req.body.name;
    await user.save();
    clearCacheAndLog("/user/updateusername", [
      cacheKeys.USERNORMAL + userId,
      cacheKeys.USERCURRENT + userId,
    ]);
    res.status(200).send(user);
  },
);
// Update user handle
makeRoute(
  "put",
  "/user/updateuserhandle",
  [authUser],
  router,
  async function (req: Request, res: Response) {
    const updateBodySchema = z.object({
      handle: z
        .string()
        .min(6, "handle is too short")
        .max(4096, "handle is too long"),
    });
    const { error } = updateBodySchema.safeParse(req.body);
    if (error) {
      return res.status(400).send(error.issues[0].message);
    }
    const alreadyExistingUser = await User.findOne({ handle: req.body.handle });
    if (alreadyExistingUser) {
      return res.status(400).send("handle taken");
    }
    const userId = req.user?._id;
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }
    user.handle = req.body.handle;
    await user.save();
    clearCacheAndLog("/user/updateuserhandle", [
      cacheKeys.USERNORMAL + userId,
      cacheKeys.USERCURRENT + userId,
    ]);
    res.status(200).send(user);
  },
);
// Update user password
makeRoute(
  "put",
  "/user/updateuserpassword",
  [authUser],
  router,
  async function (req: Request, res: Response) {
    const updateBodySchema = z.object({
      password: z
        .string()
        .min(6, "password is too short")
        .max(4096, "password is too long"),
    });
    const { error } = updateBodySchema.safeParse(req.body);
    if (error) {
      return res.status(400).send(error.issues[0].message);
    }

    const userId = req.user?._id;
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }
    user.password = req.body.password;
    await user.save();
    clearCacheAndLog("/user/updateuserpassword", [
      cacheKeys.USERNORMAL + userId,
      cacheKeys.USERCURRENT + userId,
    ]);
    res.status(200).send(user);
  },
);
// Update user pfp
makeRoute(
  "put",
  "/user/updateuserpfp",
  [authUser, upload.single("image")],
  router,
  async function (req: Request, res: Response) {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(req.file?.mimetype!)) {
      return res.status(400).send("Invalid file type");
    }
    // Check file size (max 2MB)
    if (req.file?.size! > 2_000_000) {
      return res.status(400).send("File is too large");
    }
    const userId = req.user?._id;
    logger("/user/updateuserpfp", "userId: ", userId);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }
    if (user.profilePicId) {
      await cloudinary.v2.uploader.destroy(user.profilePicId);
    }

    // Convert buffer to a readable stream
    const readableStream = new Readable();
    readableStream.push(req.file?.buffer);
    readableStream.push(null);

    // Upload the stream to cloudinary
    const streamUpload = cloudinary.v2.uploader.upload_stream(
      (error, result) => {
        if (error) {
          console.error(error);
          return;
        }
        user.pfp = result?.secure_url!;
        user.profilePicId = result?.public_id!;
        user.save();
        clearCacheAndLog("/user/updateuserpfp", [
          cacheKeys.USERNORMAL + userId,
          cacheKeys.USERCURRENT + userId,
        ]);
        res.status(200).send(user);
      },
    );

    readableStream.pipe(streamUpload);
  },
);

// Send Friend Request
makeRoute(
  "post",
  "/user/sendFriendRequest/:receiverId",
  [authUser],
  router,
  async function (req: Request, res: Response) {
    if (req.user?._id === req.params.receiverId) {
      return res
        .status(400)
        .json({ message: "You cannot send a friend request to yourself." });
    }
    const user = await User.findById(req.user?._id);
    const friend = await User.findById(req.params.receiverId);
    if (!user || !friend) {
      return res.status(404).send();
    }
    logger(
      "/user/sendFriendRequest/:receiverId",
      "user",
      user,
      "friend: ",
      friend,
    );
    if (
      !friend.friends.includes(friend._id) &&
      !user.friendReqsSent.includes(friend._id)
    ) {
      friend.friendReqsReceived.push(user._id);
      user.friendReqsSent.push(friend._id);
      await user.save();
      await friend.save();
      clearCacheAndLog("/user/sendFriendRequest/:receiverId", [
        cacheKeys.USERNORMAL + friend._id,
        cacheKeys.USERCURRENT + user._id,
      ]);
      res.status(200).send("Friend request sent!");
    } else {
      res.status(400).json({ message: "Friend request already sent." });
    }
  },
);

// Cancel Sent Friend Request
makeRoute(
  "post",
  "/user/cancelFriendRequest/:receiverId",
  [authUser],
  router,
  async function (req: Request, res: Response) {
    const user = await User.findById(req.user?._id);
    const friend = await User.findById(req.params.receiverId);
    if (!user || !friend) {
      return res.status(404).send();
    }

    if (user.friendReqsSent.includes(friend._id)) {
      user.friendReqsSent.pull(friend._id);
      friend.friendReqsReceived.pull(user._id);
      await user.save();
      await friend.save();
      clearCacheAndLog("/user/sendFriendRequest/:receiverId", [
        cacheKeys.USERNORMAL + friend._id,
        cacheKeys.USERCURRENT + user._id,
      ]);
      res.status(200).send("Friend request canceled!");
    } else {
      res.status(400).json({ message: "No friend request to cancel." });
    }
  },
);

// Accept Friend Request
makeRoute(
  "post",
  "/user/acceptFriendRequest/:senderId",
  [authUser],
  router,
  async function (req: Request, res: Response) {
    const user = await User.findById(req.user?._id);
    const friend = await User.findById(req.params.senderId);
    if (!user || !friend) {
      return res.status(404).send();
    }

    if (
      friend.friendReqsSent.includes(user._id) &&
      !user.friends.includes(friend._id)
    ) {
      friend.friendReqsSent.pull(user._id);
      friend.friends.push(user._id);
      user.friendReqsReceived.pull(friend._id);
      user.friends.push(friend._id);
      await friend.save();
      await user.save();
      clearCacheAndLog("/user/sendFriendRequest/:receiverId", [
        cacheKeys.USERNORMAL + friend._id,
        cacheKeys.USERCURRENT + user._id,
      ]);
      res.status(200).send("Friend request accepted!");
    } else {
      res.status(400).json({ message: "no valid request to accept" });
    }
  },
);

// Reject Received Friend Request
makeRoute(
  "post",
  "/user/rejectFriendRequest/:senderId",
  [authUser],
  router,
  async function (req: Request, res: Response) {
    const user = await User.findById(req.user?._id);
    const friend = await User.findById(req.params.senderId);
    if (!user || !friend) {
      return res.status(404).send();
    }
    if (user.friendReqsReceived.includes(friend._id)) {
      user.friendReqsReceived.pull(friend._id);
      friend.friendReqsSent.pull(user._id);
      await user.save();
      await friend.save();
      clearCacheAndLog("/user/sendFriendRequest/:receiverId", [
        cacheKeys.USERNORMAL + friend._id,
        cacheKeys.USERCURRENT + user._id,
      ]);
      res.status(200).send("Friend request rejected!");
    } else {
      res.status(400).json({ message: "No friend request to reject." });
    }
  },
);

// Remove Friend
makeRoute(
  "post",
  "/user/removeFriend/:friendId",
  [authUser],
  router,
  async function (req: Request, res: Response) {
    const user = await User.findById(req.user?._id);
    const friend = await User.findById(req.params.friendId);
    if (!user || !friend) {
      return res.status(404).send();
    }
    logger("/user/removeFriend/:friendId", "user", user, "friend: ", friend);
    if (user.friends.includes(friend._id)) {
      user.friends.pull(friend._id);
      friend.friends.pull(user._id);
      await user.save();
      await friend.save();
      clearCacheAndLog("/user/sendFriendRequest/:receiverId", [
        cacheKeys.USERNORMAL + friend._id,
        cacheKeys.USERCURRENT + user._id,
      ]);
      res.status(200).send("Friend removed!");
    } else {
      res.status(400).json({ message: "Friend not found." });
    }
  },
);

// get Friendlist
makeRoute(
  "get",
  "/user/fetchFriendlist",
  [authUser],
  router,
  async function (req: Request, res: Response) {
    const user = await User.findById(req.user?._id).select("friends");
    if (!user) {
      return res.status(404).send();
    }
    res.status(200).json(user.friends);
  },
);

// Fetch Friend Requests Received
makeRoute(
  "get",
  "/user/fetchFriendRequestsReceived",
  [authUser],
  router,
  async function (req: Request, res: Response) {
    const user = await User.findById(req.user?._id).select(
      "friendReqsReceived",
    );
    if (!user) return res.status(404).send();
    res.status(200).json(user.friendReqsReceived);
  },
);

// Fetch Friend Requests Sent
makeRoute(
  "get",
  "/user/fetchFriendRequestsSent",
  [authUser],
  router,
  async function (req: Request, res: Response) {
    const user = await User.findById(req.user?._id).select("friendReqsSent");
    if (!user) return res.status(404).send();
    res.status(200).json(user.friendReqsSent);
  },
);

// Get a single user by ID or handle
makeRoute(
  "get",
  "/user/getuser/:id",
  [authUser],
  router,
  async function (req: Request, res: Response) {
    // setTimeout(async () => {
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      let user = await User.findById(req.params.id)
        .select("-password -friends -friendReqsSent -friendReqsReceived")
        .cache(60, cacheKeys.USERNORMAL + req.params.id);
      // .exec();
      if (!user) {
        return res.status(404).send("User not found");
      }
      res.send(user);
    } else {
      let user = await User.findOne({ handle: req.params.id })
        .select("-password -friends -friendReqsSent -friendReqsReceived")
        .cache(60, cacheKeys.USERNORMAL + req.params.id);
      // .exec();
      if (!user) {
        return res.status(404).send("User not found");
      }
      res.send(user);
    }
    // }, 100);
  },
);

// Get current user
makeRoute(
  "get",
  "/user/getCurrentUser",
  [authUser],
  router,
  async function (req: Request, res: Response) {
    // let userToSend: CurrentUser;
    let user = await User.findById(req.user?._id)
      .select("-password")
      .cache(60, cacheKeys.USERCURRENT + req.user?._id);
    // .exec();
    if (!user) return res.status(404).send("User not found");
    logger("/user/getCurrentUser", "user", user);
    res.send(user);
  },
);

// Search users by name or handle
makeRoute(
  "get",
  "/user/search",
  [authUser],
  router,
  async function (req: Request, res: Response) {
    const query = req.query.q;
    let users = await User.find({
      $or: [
        { name: { $regex: query as string, $options: "i" } },
        { handle: { $regex: query as string, $options: "i" } },
      ],
    })
      .select("name handle pfp")
      .cache(60, cacheKeys.USERSEARCH + query);
    // .exec();

    res.send(users);
  },
);

// check if user exists
makeRoute(
  "get",
  "/user/check",
  [],
  router,
  async function (req: Request, res: Response) {
    const handle = req.query.q;
    const user = await User.findOne({ handle: handle as string });
    // .cache(
    //   60,
    //   cacheKeys.USERCHECK + handle,
    // );
    // .exec();
    if (!user) {
      return res.status(200).send("false");
    }
    res.status(200).send("true");
  },
);

// login user
makeRoute(
  "post",
  "/user/login",
  [],
  router,
  async function (req: Request, res: Response) {
    const { handle, password } = req.body;
    const user = await User.findOne({ handle });
    if (!user) {
      return res.status(400).send({ error: "Invalid handle or password" });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).send({ error: "Invalid handle or password" });
    }
    res.send(user.generateAuthToken());
  },
);

// login user
makeRoute(
  "get",
  "/user/clearCache",
  [],
  router,
  async function (req: Request, res: Response) {
    clearCacheAndLog("/user/clearCache", null);
    res.status(200).send("cleared cache");
  },
);

export default router;
