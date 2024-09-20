import cloudinary from "cloudinary";
import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import { Readable } from "node:stream";
import { z } from "zod";
// import { clearCacheAndLog } from "../config";
import { authUser } from "../middlewares";
import mongooseModels from "../mongoose/models";
import { NormalUser } from "../types";
import { forwardError } from "./asyncWrapper";
import { logger } from "../logger";
const User = mongooseModels.User;

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
	USER: "user-",
	USERSEARCH: "user-search-",
	USERCHECK: "user-check-",
};

const validations = {
	name: z
		.string({ required_error: "name is required" })
		.max(4096, "name is too long"),
	pfp: z
		.string({ required_error: "pfp is required" })
		.max(4096, "pfp url is too long"),
	handle: z
		.string({ required_error: "handle is required" })
		.regex(
			/^[a-zA-Z0-9#$_&\-+@()/*"':;!?~`|•√÷×§∆\\}{=°^¥€¢£%©®™✓\[\]\,\.<>]*$/,
			{ message: "no spaces or invalid characters allowed in handle" },
		)
		.min(6, "handle should me minimum 6 characters")
		.max(64, "handle should me maximum 64 characters"),
	password: z
		.string({ required_error: "password is required" })
		.min(6, "password should me minimum 6 characters")
		.max(64, "password should me maximum 64 characters"),
};
// Create user
router.post(
	"/user/register",
	forwardError(async function (req, res) {
		const { name, handle, pfp, password } = req.body as NormalUser & {
			password: string;
		};
		const updateBodySchema = z.object({
			handle: validations.handle,
			password: validations.password,
		});
		const { error } = updateBodySchema.safeParse({ handle, password });
		if (error) {
			return res
				.status(400)
				.send({ error: error.issues.map((issue) => issue.message)[0] });
		}

		let user = await User.findOne({ handle });

		if (user) {
			const isMatch = await user.comparePassword(password);
			if (!isMatch) {
				return res.status(400).send({ error: "Invalid handle or password" });
			}
			return res.status(200).send(user.generateAuthToken());
		}
		user = new User({ name, handle, pfp, password });
		await user.save();

		res.status(201).send(user.generateAuthToken());
	}),
);

// Update user name
router.put(
	"/user/updateusername",
	authUser,
	forwardError(async function (req, res) {
		const updateBodySchema = z.object({
			name: validations.name,
		});
		const { error } = updateBodySchema.safeParse(req.body);
		if (error) {
			return res
				.status(400)
				.send({ error: error.issues.map((issue) => issue.message)[0] });
		}
		const userId = req.user?._id;
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).send({ error: "User not found" });
		}
		user.name = req.body.name;
		await user.save();
		// clearCacheAndLog("/user/updateusername", [cacheKeys.USER + userId]);
		res.status(200).send(user);
	}),
);

// Update user handle
router.put(
	"/user/updateuserhandle",
	authUser,
	forwardError(async function (req, res) {
		const updateBodySchema = z.object({ handle: validations.handle });
		const { error } = updateBodySchema.safeParse(req.body);
		if (error) {
			return res
				.status(400)
				.send({ error: error.issues.map((issue) => issue.message)[0] });
		}

		const alreadyExistingUser = await User.findOne({ handle: req.body.handle });
		if (alreadyExistingUser) {
			return res.status(400).send({ error: "handle taken" });
		}
		const userId = req.user?._id;
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).send({ error: "User not found" });
		}
		user.handle = req.body.handle;
		await user.save();
		res.status(200).send(user);
	}),
);

// Update user password
router.put(
	"/user/updateuserpassword",
	authUser,
	forwardError(async function (req, res) {
		const updateBodySchema = z.object({
			password: validations.password,
		});
		const { error } = updateBodySchema.safeParse(req.body);
		if (error) {
			return res
				.status(400)
				.send({ error: error.issues.map((issue) => issue.message)[0] });
		}

		const userId = req.user?._id;
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).send({ error: "User not found" });
		}
		user.password = req.body.password;
		await user.save();
		// clearCacheAndLog("/user/updateuserpassword", [cacheKeys.USER + userId]);
		res.status(200).send(user);
	}),
);

// Update user pfp
router.put(
	"/user/updateuserpfp",
	authUser,
	upload.single("image"),
	forwardError(async function (req, res) {
		const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
		if (!allowedTypes.includes(req.file?.mimetype!)) {
			return res.status(400).send({ error: "Invalid file type" });
		}
		// Check file size (max 2MB)
		if (req.file?.size! > 2_000_000) {
			return res.status(400).send({ error: "File is too large" });
		}
		const userId = req.user?._id;

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).send({ error: "User not found" });
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
				// clearCacheAndLog("/user/updateuserpfp", [cacheKeys.USER + userId]);
				res.status(200).send(user);
			},
		);

		readableStream.pipe(streamUpload);
	}),
);

// Send Friend Request
router.post(
	"/user/sendFriendRequest/:receiverId",
	authUser,
	forwardError(async function (req, res) {
		if (req.user?._id === req.params.receiverId) {
			return res
				.status(400)
				.send({ error: "You cannot send a friend request to yourself." });
		}
		const user = await User.findById(req.user?._id);
		const friend = await User.findById(req.params.receiverId);
		if (!user || !friend) {
			return res.status(404).send({ error: "User not found" });
		}
		logger.info(
			`/user/sendFriendRequest/:receiverId user: ${user}, friend: ${friend}`,
		);
		if (
			user.friendReqsReceived.includes(friend._id) &&
			friend.friendReqsSent.includes(user._id)
		) {
			user.friends.push(friend._id);
			friend.friends.push(user._id);
			user.friendReqsReceived.pull(friend._id);
			friend.friendReqsSent.pull(user._id);
			await user.save();
			await friend.save();
			return res.status(200).send("done, Friend added!");
		}

		if (
			!friend.friends.includes(friend._id) &&
			!user.friendReqsSent.includes(friend._id)
		) {
			friend.friendReqsReceived.push(user._id);
			user.friendReqsSent.push(friend._id);
			await user.save();
			await friend.save();

			res.status(200).send("done, Friend request sent!");
		} else {
			res.status(400).send({ message: "Friend request already sent." });
		}
	}),
);

// Cancel Sent Friend Request
router.post(
	"/user/cancelFriendRequest/:receiverId",
	authUser,
	forwardError(async function (req, res) {
		const user = await User.findById(req.user?._id);
		const friend = await User.findById(req.params.receiverId);
		if (!user || !friend) {
			return res.status(404).send({ error: "User not found" });
		}

		if (user.friendReqsSent.includes(friend._id)) {
			user.friendReqsSent.pull(friend._id);
			friend.friendReqsReceived.pull(user._id);
			await user.save();
			await friend.save();
			// clearCacheAndLog("/user/sendFriendRequest/:receiverId", [
			//   cacheKeys.USER + friend._id,
			//   cacheKeys.USER + user._id,
			// ]);
			res.status(200).send("done, Friend request canceled!");
		} else {
			res.status(400).send({ message: "No friend request to cancel." });
		}
	}),
);

// Accept Friend Request
router.post(
	"/user/acceptFriendRequest/:senderId",
	authUser,
	forwardError(async function (req, res) {
		const user = await User.findById(req.user?._id);
		const friend = await User.findById(req.params.senderId);
		if (!user || !friend) {
			return res.status(404).send({ error: "User not found" });
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
			// clearCacheAndLog("/user/sendFriendRequest/:receiverId", [
			//   cacheKeys.USER + friend._id,
			//   cacheKeys.USER + user._id,
			// ]);
			res.status(200).send("done, Friend request accepted!");
		} else {
			res.status(400).send({ message: "no valid request to accept" });
		}
	}),
);

// Reject Received Friend Request
router.post(
	"/user/rejectFriendRequest/:senderId",
	authUser,
	forwardError(async function (req, res) {
		const user = await User.findById(req.user?._id);
		const friend = await User.findById(req.params.senderId);
		if (!user || !friend) {
			return res.status(404).send({ error: "User not found" });
		}
		if (user.friendReqsReceived.includes(friend._id)) {
			user.friendReqsReceived.pull(friend._id);
			friend.friendReqsSent.pull(user._id);
			await user.save();
			await friend.save();
			// clearCacheAndLog("/user/sendFriendRequest/:receiverId", [
			//   cacheKeys.USER + friend._id,
			//   cacheKeys.USER + user._id,
			// ]);
			res.status(200).send("done, Friend request rejected!");
		} else {
			res.status(400).send({ message: "No friend request to reject." });
		}
	}),
);

// Remove Friend
router.post(
	"/user/removeFriend/:friendId",
	authUser,
	forwardError(async function (req, res) {
		const user = await User.findById(req.user?._id);
		const friend = await User.findById(req.params.friendId);
		if (!user || !friend) {
			return res.status(404).send({ error: "User not found" });
		}
		logger.info(`/user/removeFriend/:friendId user ${user} friend: ${friend}`);
		if (user.friends.includes(friend._id)) {
			user.friends.pull(friend._id);
			friend.friends.pull(user._id);
			await user.save();
			await friend.save();
			// clearCacheAndLog("/user/sendFriendRequest/:receiverId", [
			//   cacheKeys.USER + friend._id,
			//   cacheKeys.USER + user._id,
			// ]);
			res.status(200).send("done, Friend removed!");
		} else {
			res.status(400).send({ message: "Friend not found." });
		}
	}),
);

// Get a single user by ID or handle
router.get(
	"/user/getuser/:id",
	authUser,
	forwardError(async function (req, res) {
		// setTimeout(async () => {
		const id = req.params.id;
		if (mongoose.Types.ObjectId.isValid(id)) {
			const user = await User.findById(id).select(
				"-password -friends -friendReqsSent -friendReqsReceived",
			);
			// .cache(2);
			// .cache(60, cacheKeys.USER + id);

			if (!user) {
				return res.status(404).send({ error: "User not found" });
			}
			res.send(user);
		} else {
			const handle = id;
			const user = await User.findOne({ handle }).select(
				"-password -friends -friendReqsSent -friendReqsReceived",
			);
			// .cache(2);
			// .cache(60, cacheKeys.USERCHECK + handle);

			if (!user) {
				return res.status(404).send({ error: "User not found" });
			}
			res.send(user);
		}
		// }, 100);
	}),
);

// Get current user
router.get(
	"/user/getCurrentUser",
	authUser,
	forwardError(async function (req, res) {
		// let userToSend: CurrentUser;
		const user = await User.findById(req.user?._id);
		// .cache(2);
		// .cache(60, cacheKeys.USER + req.user?._id);
		if (!user) return res.status(404).send({ error: "User not found" });
		user.password = "";
		res.send(user);
	}),
);

// Search users by name or handle
router.get(
	"/user/search",
	authUser,
	forwardError(async function (req, res) {
		const query = req.query.q as string;
		const users = await User.find({
			$or: [
				{ name: { $regex: query, $options: "i" } },
				{ handle: { $regex: query, $options: "i" } },
			],
		}).select("name handle pfp");
		// .cache(2);
		// .cache(60, cacheKeys.USERSEARCH + query);

		res.send(users);
	}),
);

// check if user exists
router.get(
	"/user/check",
	forwardError(async function (req, res) {
		const handle = req.query.q as string;
		const userCount = await User.countDocuments({ handle });
		// .cache(2);
		// .cache(60, cacheKeys.USERCHECK + handle);

		res.status(200).send(userCount === 0 ? "0" : "1");
	}),
);

// login user
router.post(
	"/user/login",
	forwardError(async function (req, res) {
		const { handle, password } = req.body;
		const updateBodySchema = z.object({
			handle: validations.handle,
			password: validations.password,
		});
		const { error } = updateBodySchema.safeParse(req.body);
		if (error) {
			return res
				.status(400)
				.send({ error: error.issues.map((issue) => issue.message)[0] });
		}
		const user = await User.findOne({ handle });
		// .cache(2);
		// .cache(60, cacheKeys.USERCHECK + handle);
		if (!user) {
			return res.status(400).send({ error: "Invalid handle or password" });
		}
		const isMatch = await user.comparePassword(password);
		if (!isMatch) {
			return res.status(400).send({ error: "Invalid handle or password" });
		}
		res.send(user.generateAuthToken());
	}),
);

// clearCache user
// router.get(
// 	"/user/clearCache",
// 	asyncWrapper(async function (req, res) {
// 		clearCacheAndLog("/user/clearCache", null);
// 		res.status(200).send("cleared cache");
// 	}),
// );

// unfriend all users
router.get(
	"/user/unfriendAll",
	authUser,
	forwardError(async function (req, res) {
		const userId = req.user?._id;
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).send({ error: "User not found" });
		}
		for (const friend of user.friends) {
			const friendUser = await User.findById(friend);
			if (friendUser) {
				friendUser.friends.pull(userId);
				await friendUser.save();
			}
		}
		user.friends.pull(...user.friends);
		await user.save();
		res.status(200).send("done, Friends removed!");
	}),
);

export default router;
