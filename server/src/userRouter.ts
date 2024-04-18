import express, { NextFunction, Request, Response } from "express";
const router = express.Router();
import { User } from "./models";
import jwt from "jsonwebtoken";
import Mongoose from "mongoose";
import { CurrentUser, DecodedUser } from "../types/types";
import { logger } from "./config";

// middleware to check if x-auth-token token attached and valid
export const authUser = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["x-auth-token"];
  if (!token)
    return res.status(401).json({ error: "Access denied. No token provided." });
  try {
    const decoded = jwt.verify(
      token as string,
      process.env.JWT_PRIVATE_KEY || "",
    );
    req.user = decoded as DecodedUser;
    next();
  } catch (ex) {
    logger("authUser middleware", "error in middleware: ", ex);
    res.status(400).json({ error: "Invalid token." });
  }
};

// Create user
router.post("/register", async (req: Request, res: Response) => {
  try {
    logger("/api/user/register", "register router req.body: ", req.body);
    const { name, handle, pfp, password } = req.body as DecodedUser & {
      password: string;
    };
    let user = await User.findOne({ handle });
    if (user) {
      return res.status(200).send(user.generateAuthToken());
    }
    user = new User({ name, handle, pfp, password });
    await user.save();

    res.status(201).send(user.generateAuthToken());
  } catch (error) {
    logger("/api/user/register", "error in register: ", error);
    res.status(400).send(error);
  }
});
// Update user by id or handle whatever is provided
router.put("/updateuser/:id", authUser, async (req: Request, res: Response) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "handle", "pfp", "password"];
  const isValidOperation = updates.some((update) =>
    allowedUpdates.includes(update),
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    let user: any;
    if (Mongoose.Types.ObjectId.isValid(req.params.id)) {
      user = await User.findById(req.params.id);
    } else {
      user = await User.findOne({ handle: req.params.id });
    }
    if (!user) {
      return res.status(404).send("User not found");
    }

    updates.forEach((update) => ((user as any)[update] = req.body[update]));

    await user.save();

    res.send(user);
  } catch (e) {
    logger("/api/user/updateuser", "error in updateuser: ", e);
    res.status(400).send(e);
  }
});

// Send Friend Request
router.get(
  "/sendFriendRequest/:receiverHandle",
  authUser,
  async (req: Request, res: Response) => {
    try {
      const user = await User.findOne({
        handle: req.user?.handle,
      });
      const friend = await User.findOne({ handle: req.params.receiverHandle });
      logger("/api/user/sendFriendRequest", "user: ", user, "friend: ", friend);
      if (!user || !friend) {
        return res.status(404).send();
      }
      if (
        !friend.friends.includes(friend._id) &&
        !user.friendReqsSent.includes(friend._id)
      ) {
        friend.friendReqsReceived.push(user._id);
        user.friendReqsSent.push(friend._id);
        await user.save();
        await friend.save();
        res.status(200).json({ message: "Friend request sent successfully." });
      } else {
        res.status(400).json({ message: "Friend request already sent." });
      }
    } catch (e) {
      logger("/api/user/sendFriendRequest", "error in sendFriendRequest: ", e);
      res.status(500).send();
    }
  },
); // Accept Friend Request
router.get(
  "/acceptFriendRequest/:senderHandle",
  authUser,
  async (req: Request, res: Response) => {
    try {
      const user = await User.findOne({ handle: req.user?.handle });
      const friend = await User.findOne({ handle: req.params.senderHandle });
      if (!user || !friend) {
        return res.status(404).send();
      }

      if (
        friend.friendReqsReceived.includes(user._id) &&
        !user.friends.includes(friend._id)
      ) {
        friend.friendReqsReceived.pull(user._id);
        friend.friends.push(user._id);
        user.friendReqsSent.pull(friend._id);
        user.friends.push(friend._id);
        await friend.save();
        await user.save();
        res
          .status(200)
          .json({ message: "Friend request accepted successfully." });
      } else {
        res.status(400).json({ message: "no valid request to accept" });
      }
    } catch (e) {
      logger(
        "/api/user/acceptFriendRequest",
        "error in acceptFriendRequest: ",
        e,
      );
      res.status(500).send();
    }
  },
);
// Remove Friend
router.get(
  "/removeFriend/:friendHandle",
  authUser,
  async (req: Request, res: Response) => {
    try {
      const user = await User.findOne({
        handle: req.user?.handle,
      });
      const friend = await User.findOne({ handle: req.params.friendHandle });
      if (!user || !friend) {
        return res.status(404).send();
      }

      if (user.friends.includes(friend._id)) {
        user.friends.pull(friend._id);
        friend.friends.pull(user._id);
        await user.save();
        await friend.save();
        res.status(200).json({ message: "Friend removed successfully." });
      } else {
        res.status(400).json({ message: "Friend not found." });
      }
    } catch (e) {
      logger("/api/user/removeFriend", "error in removeFriend: ", e);
      res.status(500).send();
    }
  },
);
// get Friendlist
router.get(
  "/fetchFriendlist",
  authUser,
  async (req: Request, res: Response) => {
    try {
      logger(
        "/api/user/fetchFriendlist",
        "fetchFriendlist: ",
        req.user?.handle,
      );
      const user = await User.findOne({
        handle: req.user?.handle,
      }).populate("friends", "handle -_id");
      logger("/api/user/fetchFriendlist", "user: ", user);
      if (!user) {
        return res.status(404).send();
      }
      const friendsHandles = user.friends.map((f: any) => f.handle);
      res.status(200).json({ friends: friendsHandles });
    } catch (e) {
      logger("/api/user/fetchFriendlist", "error in fetchFriendlist: ", e);
      res.status(500).send();
    }
  },
);
// Fetch Friend Requests Received
router.get(
  "/fetchFriendRequestsReceived",
  authUser,
  async (req: Request, res: Response) => {
    try {
      const user = await User.findOne({
        handle: req.user?.handle,
      }).populate("friendReqsReceived", "handle -_id");

      if (!user) {
        return res.status(404).send();
      }
      const friendRequestsReceivedHandles = user.friendReqsReceived.map(
        (user: any) => user.handle,
      );
      res
        .status(200)
        .json({ friendRequestsReceived: friendRequestsReceivedHandles });
    } catch (e) {
      logger(
        "/api/user/fetchFriendRequestsReceived",
        "error in fetchFriendRequestsReceived: ",
        e,
      );
      res.status(500).send();
    }
  },
);

// Fetch Friend Requests Sent
router.get(
  "/fetchFriendRequestsSent",
  authUser,
  async (req: Request, res: Response) => {
    try {
      const user = await User.findOne({
        handle: req.user?.handle,
      }).populate("friendReqsSent", "handle -_id");
      if (!user) {
        return res.status(404).send();
      }
      const friendRequestsSentHandles = user.friendReqsSent.map(
        (user: any) => user.handle,
      );
      res.status(200).json({ friendRequestsSent: friendRequestsSentHandles });
    } catch (e) {
      logger(
        "/api/user/fetchFriendRequestsSent",
        "error in fetchFriendRequestsSent: ",
        e,
      );
      res.status(500).send();
    }
  },
);

// Get a single user by ID or handle
router.get("/getuser/:id", authUser, async (req: Request, res: Response) => {
  try {
    let user: any;
    if (Mongoose.Types.ObjectId.isValid(req.params.id)) {
      user = await User.findById(req.params.id).select("-password -_id");
    } else {
      user = await User.findOne({ handle: req.params.id }).select(
        "-password -_id",
      );
    }
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.send(user);
  } catch (error) {
    logger("/api/user/getuser", "error in getuser: ", error);
    res.status(500).send(error);
  }
});

// Get current user by ID or handle
router.get("/getCurrentUser", authUser, async (req: Request, res: Response) => {
  let userToSend: CurrentUser
  try {
    let user = await User.findOne({ handle: req.user?.handle })
      .select("-password -_id")
      .populate("friends friendReqsSent friendReqsReceived", "handle -_id");
    if (!user) {
      return res.status(404).send("User not found");
    }
    userToSend = {
      name: user.name,
      handle: user.handle,
      pfp: user.pfp,
      friends: user.friends.map((f: any) => f.handle as string),
      friendReqsSent: user.friendReqsSent.map((f: any) => f.handle as string),
      friendReqsReceived: user.friendReqsReceived.map(
        (f: any) => f.handle as string,
      ),
    };
    res.send(userToSend);
  } catch (error) {
    logger("/api/user/getuser", "error in getuser: ", error);
    res.status(500).send(error);
  }
});

// Get all users
router.get("/all", authUser, async (req: Request, res: Response) => {
  try {
    const users = await User.find({}).select("-password -_id");
    res.send(users);
  } catch (error) {
    logger("/api/user/all", "error in all: ", error);
    res.status(500).send(error);
  }
});

// Search users by name or handle
// /api/user
router.get("/search", authUser, async (req: Request, res: Response) => {
  logger("/api/user/search", "search query: ", req.query.q);

  try {
    const query = req.query.q;
    let users = await User.find({
      $or: [
        { name: { $regex: query as string, $options: "i" } },
        { handle: { $regex: query as string, $options: "i" } },
      ],
    }).select("name handle pfp");

    res.send(users);
  } catch (error) {
    logger("/api/user/search", "error in search: ", error);
    res.status(500).send(error);
  }
});
router.get("/check", async (req: Request, res: Response) => {
  logger("/api/user/check", "check query: ", req.query.q);

  try {
    const handle = req.query.q;
    const user = await User.findOne({ handle: handle as string });
    if (!user) {
      return res.status(200).send("false");
    }
    res.send("true");
  } catch (error) {
    logger("/api/user/check", "error in check: ", error);
    res.status(500).send(error);
  }
});

// login user
router.post("/login", async (req: Request, res: Response) => {
  logger("/api/user/login", "req.body: ", req.body);

  try {
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
  } catch (error) {
    logger("/api/user/login", "error in login: ", error);
    res.status(500).send(error);
  }
});

export default router;
