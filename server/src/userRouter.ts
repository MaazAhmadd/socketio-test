import express, {
  NextFunction,
  Request,
  Response,
  RequestHandler,
  Router,
} from "express";
const router = express.Router();
import { User } from "./models";
import jwt from "jsonwebtoken";
import Mongoose from "mongoose";
import { CurrentUser, DecodedUser } from "./types";
import { FnNames, logger } from "./config";

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
makeRoute(
  "post",
  "/user/register",
  [],
  async function (req: Request, res: Response) {
    logger("/user/register", "register router req.body: ", req.body);
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
  },
);

// Update user by id or handle whatever is provided
makeRoute(
  "put",
  "/user/updateuser/:id",
  [authUser],
  async function (req: Request, res: Response) {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "handle", "pfp", "password"];
    const isValidOperation = updates.some((update) =>
      allowedUpdates.includes(update),
    );
    if (!isValidOperation) {
      return res.status(400).send({ error: "Invalid updates!" });
    }
    let user: any;
    if (Mongoose.Types.ObjectId.isValid(req.params.id)) {
      user = await User.findById(req.params.id);
    } else {
      user = await User.findOne({ handle: req.user?.handle });
    }
    if (!user) {
      return res.status(404).send("User not found");
    }
    updates.forEach((update) => ((user as any)[update] = req.body[update]));
    await user.save();
    res.send(user);
  },
);

// Send Friend Request
makeRoute(
  "get",
  "/user/sendFriendRequest/:receiverHandle",
  [authUser],
  async function (req: Request, res: Response) {
    const user = await User.findOne({
      handle: req.user?.handle,
    });
    const friend = await User.findOne({ handle: req.params.receiverHandle });
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
  },
);

// Accept Friend Request
makeRoute(
  "get",
  "/user/acceptFriendRequest/:senderHandle",
  [authUser],
  async function (req: Request, res: Response) {
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
  },
);

// Remove Friend
makeRoute(
  "get",
  "/user/removeFriend/:friendHandle",
  [authUser],
  async function (req: Request, res: Response) {
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
  },
);

// get Friendlist
makeRoute(
  "get",
  "/user/fetchFriendlist",
  [authUser],
  async function (req: Request, res: Response) {
    const user = await User.findOne({
      handle: req.user?.handle,
    }).populate("friends", "handle -_id");
    if (!user) {
      return res.status(404).send();
    }
    const friendsHandles = user.friends.map((f: any) => f.handle);
    res.status(200).json({ friends: friendsHandles });
  },
);

// Fetch Friend Requests Received
makeRoute(
  "get",
  "/user/fetchFriendRequestsReceived",
  [authUser],
  async function (req: Request, res: Response) {
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
  },
);

// Fetch Friend Requests Sent
makeRoute(
  "get",
  "/user/fetchFriendRequestsSent",
  [authUser],
  async function (req: Request, res: Response) {
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
  },
);

// Get a single user by ID or handle
makeRoute(
  "get",
  "/user/getuser/:id",
  [authUser],
  async function (req: Request, res: Response) {
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
  },
);

// Get current user by ID or handle
makeRoute(
  "get",
  "/user/getCurrentUser",
  [authUser],
  async function (req: Request, res: Response) {
    let userToSend: CurrentUser;
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
  },
);

// Get all users
makeRoute(
  "get",
  "/user/all",
  [authUser],
  async function (req: Request, res: Response) {
    const users = await User.find({}).select("-password -_id");
    res.send(users);
  },
);

// Search users by name or handle
makeRoute(
  "get",
  "/user/search",
  [authUser],
  async function (req: Request, res: Response) {
    const query = req.query.q;
    let users = await User.find({
      $or: [
        { name: { $regex: query as string, $options: "i" } },
        { handle: { $regex: query as string, $options: "i" } },
      ],
    }).select("name handle pfp");

    res.send(users);
  },
);

// check if user exists
makeRoute(
  "get",
  "/user/check",
  [authUser],
  async function (req: Request, res: Response) {
    const handle = req.query.q;
    const user = await User.findOne({ handle: handle as string });
    if (!user) {
      return res.status(200).send("false");
    }
    res.send("true");
  },
);

// login user
makeRoute(
  "post",
  "/user/login",
  [],
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
