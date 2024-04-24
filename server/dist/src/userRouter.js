"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authUser = void 0;
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("./config");
const models_1 = require("./models");
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const zod_1 = require("zod");
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ dest: "uploads/" });
cloudinary_1.default.v2.config({
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
const authUser = (req, res, next) => {
    const token = req.headers["x-auth-token"];
    if (!token)
        return res.status(401).json({ error: "Access denied. No token provided." });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_PRIVATE_KEY || "");
        req.user = decoded;
        next();
    }
    catch (ex) {
        (0, config_1.logger)("authUser middleware", "error in middleware: ", ex);
        res.status(400).json({ error: "Invalid token." });
    }
};
exports.authUser = authUser;
// Create user
(0, config_1.makeRoute)("post", "/user/register", [], router, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, config_1.logger)("/user/register", "register router req.body: ", req.body);
        const { name, handle, pfp, password } = req.body;
        let user = yield models_1.User.findOne({ handle });
        // .cache(
        //   60,
        //   cacheKeys.USERNORMAL + handle,
        // );
        // .exec();
        if (user) {
            return res.status(200).send(user.generateAuthToken());
        }
        user = new models_1.User({ name, handle, pfp, password });
        yield user.save();
        res.status(201).send(user.generateAuthToken());
    });
});
// Update user name
(0, config_1.makeRoute)("put", "/user/updateusername", [exports.authUser], router, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const updateBodySchema = zod_1.z.object({
            name: zod_1.z.string().max(4096, "name is too long"),
        });
        const { error } = updateBodySchema.safeParse(req.body);
        if (error) {
            return res.status(400).send(error.issues[0].message);
        }
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        let user = yield models_1.User.findById(userId);
        if (!user) {
            return res.status(404).send("User not found");
        }
        user.name = req.body.name;
        yield user.save();
        (0, config_1.clearCacheAndLog)("/user/updateusername", [
            cacheKeys.USERNORMAL + userId,
            cacheKeys.USERCURRENT + userId,
        ]);
        res.status(200).send(user);
    });
});
// Update user handle
(0, config_1.makeRoute)("put", "/user/updateuserhandle", [exports.authUser], router, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const updateBodySchema = zod_1.z.object({
            handle: zod_1.z
                .string()
                .min(6, "handle is too short")
                .max(4096, "handle is too long"),
        });
        const { error } = updateBodySchema.safeParse(req.body);
        if (error) {
            return res.status(400).send(error.issues[0].message);
        }
        const alreadyExistingUser = yield models_1.User.findOne({ handle: req.body.handle });
        if (alreadyExistingUser) {
            return res.status(400).send("handle taken");
        }
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        let user = yield models_1.User.findById(userId);
        if (!user) {
            return res.status(404).send("User not found");
        }
        user.handle = req.body.handle;
        yield user.save();
        (0, config_1.clearCacheAndLog)("/user/updateuserhandle", [
            cacheKeys.USERNORMAL + userId,
            cacheKeys.USERCURRENT + userId,
        ]);
        res.status(200).send(user);
    });
});
// Update user password
(0, config_1.makeRoute)("put", "/user/updateuserpassword", [exports.authUser], router, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const updateBodySchema = zod_1.z.object({
            password: zod_1.z
                .string()
                .min(6, "password is too short")
                .max(4096, "password is too long"),
        });
        const { error } = updateBodySchema.safeParse(req.body);
        if (error) {
            return res.status(400).send(error.issues[0].message);
        }
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        let user = yield models_1.User.findById(userId);
        if (!user) {
            return res.status(404).send("User not found");
        }
        user.password = req.body.password;
        yield user.save();
        (0, config_1.clearCacheAndLog)("/user/updateuserpassword", [
            cacheKeys.USERNORMAL + userId,
            cacheKeys.USERCURRENT + userId,
        ]);
        res.status(200).send(user);
    });
});
// Update user pfp
(0, config_1.makeRoute)("put", "/user/updateuserpfp", [exports.authUser, upload.single("image")], router, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        (0, config_1.logger)("/user/updateuserpfp", "userId: ", userId);
        const user = yield models_1.User.findById(userId);
        if (!user) {
            return res.status(404).send("User not found");
        }
        (0, config_1.logger)("/user/updateuserpfp", "req.file: ", (_b = req.file) === null || _b === void 0 ? void 0 : _b.filename);
        if (user.profilePicId) {
            yield cloudinary_1.default.v2.uploader.destroy(user.profilePicId);
        }
        const result = yield cloudinary_1.default.v2.uploader.upload(req.file.path);
        user.pfp = result.secure_url;
        user.profilePicId = result.public_id;
        yield user.save();
        (0, config_1.clearCacheAndLog)("/user/updateuserpfp", [
            cacheKeys.USERNORMAL + userId,
            cacheKeys.USERCURRENT + userId,
        ]);
        res.status(200).send(user);
    });
});
// Send Friend Request
(0, config_1.makeRoute)("post", "/user/sendFriendRequest/:receiverId", [exports.authUser], router, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) === req.params.receiverId) {
            return res
                .status(400)
                .json({ message: "You cannot send a friend request to yourself." });
        }
        const user = yield models_1.User.findById((_b = req.user) === null || _b === void 0 ? void 0 : _b._id);
        const friend = yield models_1.User.findById(req.params.receiverId);
        if (!user || !friend) {
            return res.status(404).send();
        }
        (0, config_1.logger)("/user/sendFriendRequest/:receiverId", "user", user, "friend: ", friend);
        if (!friend.friends.includes(friend._id) &&
            !user.friendReqsSent.includes(friend._id)) {
            friend.friendReqsReceived.push(user._id);
            user.friendReqsSent.push(friend._id);
            yield user.save();
            yield friend.save();
            (0, config_1.clearCacheAndLog)("/user/sendFriendRequest/:receiverId", [
                cacheKeys.USERNORMAL + friend._id,
                cacheKeys.USERCURRENT + user._id,
            ]);
            res.status(200).send("Friend request sent!");
        }
        else {
            res.status(400).json({ message: "Friend request already sent." });
        }
    });
});
// Cancel Sent Friend Request
(0, config_1.makeRoute)("post", "/user/cancelFriendRequest/:receiverId", [exports.authUser], router, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const user = yield models_1.User.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
        const friend = yield models_1.User.findById(req.params.receiverId);
        if (!user || !friend) {
            return res.status(404).send();
        }
        if (user.friendReqsSent.includes(friend._id)) {
            user.friendReqsSent.pull(friend._id);
            friend.friendReqsReceived.pull(user._id);
            yield user.save();
            yield friend.save();
            (0, config_1.clearCacheAndLog)("/user/sendFriendRequest/:receiverId", [
                cacheKeys.USERNORMAL + friend._id,
                cacheKeys.USERCURRENT + user._id,
            ]);
            res.status(200).send("Friend request canceled!");
        }
        else {
            res.status(400).json({ message: "No friend request to cancel." });
        }
    });
});
// Accept Friend Request
(0, config_1.makeRoute)("post", "/user/acceptFriendRequest/:senderId", [exports.authUser], router, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const user = yield models_1.User.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
        const friend = yield models_1.User.findById(req.params.senderId);
        if (!user || !friend) {
            return res.status(404).send();
        }
        if (friend.friendReqsSent.includes(user._id) &&
            !user.friends.includes(friend._id)) {
            friend.friendReqsSent.pull(user._id);
            friend.friends.push(user._id);
            user.friendReqsReceived.pull(friend._id);
            user.friends.push(friend._id);
            yield friend.save();
            yield user.save();
            (0, config_1.clearCacheAndLog)("/user/sendFriendRequest/:receiverId", [
                cacheKeys.USERNORMAL + friend._id,
                cacheKeys.USERCURRENT + user._id,
            ]);
            res.status(200).send("Friend request accepted!");
        }
        else {
            res.status(400).json({ message: "no valid request to accept" });
        }
    });
});
// Reject Received Friend Request
(0, config_1.makeRoute)("post", "/user/rejectFriendRequest/:senderId", [exports.authUser], router, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const user = yield models_1.User.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
        const friend = yield models_1.User.findById(req.params.senderId);
        if (!user || !friend) {
            return res.status(404).send();
        }
        if (user.friendReqsReceived.includes(friend._id)) {
            user.friendReqsReceived.pull(friend._id);
            friend.friendReqsSent.pull(user._id);
            yield user.save();
            yield friend.save();
            (0, config_1.clearCacheAndLog)("/user/sendFriendRequest/:receiverId", [
                cacheKeys.USERNORMAL + friend._id,
                cacheKeys.USERCURRENT + user._id,
            ]);
            res.status(200).send("Friend request rejected!");
        }
        else {
            res.status(400).json({ message: "No friend request to reject." });
        }
    });
});
// Remove Friend
(0, config_1.makeRoute)("post", "/user/removeFriend/:friendId", [exports.authUser], router, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const user = yield models_1.User.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
        const friend = yield models_1.User.findById(req.params.friendId);
        if (!user || !friend) {
            return res.status(404).send();
        }
        (0, config_1.logger)("/user/removeFriend/:friendId", "user", user, "friend: ", friend);
        if (user.friends.includes(friend._id)) {
            user.friends.pull(friend._id);
            friend.friends.pull(user._id);
            yield user.save();
            yield friend.save();
            (0, config_1.clearCacheAndLog)("/user/sendFriendRequest/:receiverId", [
                cacheKeys.USERNORMAL + friend._id,
                cacheKeys.USERCURRENT + user._id,
            ]);
            res.status(200).send("Friend removed!");
        }
        else {
            res.status(400).json({ message: "Friend not found." });
        }
    });
});
// get Friendlist
(0, config_1.makeRoute)("get", "/user/fetchFriendlist", [exports.authUser], router, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const user = yield models_1.User.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id).select("friends");
        if (!user) {
            return res.status(404).send();
        }
        res.status(200).json(user.friends);
    });
});
// Fetch Friend Requests Received
(0, config_1.makeRoute)("get", "/user/fetchFriendRequestsReceived", [exports.authUser], router, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const user = yield models_1.User.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id).select("friendReqsReceived");
        if (!user)
            return res.status(404).send();
        res.status(200).json(user.friendReqsReceived);
    });
});
// Fetch Friend Requests Sent
(0, config_1.makeRoute)("get", "/user/fetchFriendRequestsSent", [exports.authUser], router, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const user = yield models_1.User.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id).select("friendReqsSent");
        if (!user)
            return res.status(404).send();
        res.status(200).json(user.friendReqsSent);
    });
});
// Get a single user by ID or handle
(0, config_1.makeRoute)("get", "/user/getuser/:id", [exports.authUser], router, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // setTimeout(async () => {
        if (mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            let user = yield models_1.User.findById(req.params.id)
                .select("-password -friends -friendReqsSent -friendReqsReceived")
                .cache(60, cacheKeys.USERNORMAL + req.params.id);
            // .exec();
            if (!user) {
                return res.status(404).send("User not found");
            }
            res.send(user);
        }
        else {
            let user = yield models_1.User.findOne({ handle: req.params.id })
                .select("-password -friends -friendReqsSent -friendReqsReceived")
                .cache(60, cacheKeys.USERNORMAL + req.params.id);
            // .exec();
            if (!user) {
                return res.status(404).send("User not found");
            }
            res.send(user);
        }
        // }, 100);
    });
});
// Get current user
(0, config_1.makeRoute)("get", "/user/getCurrentUser", [exports.authUser], router, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        // let userToSend: CurrentUser;
        let user = yield models_1.User.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)
            .select("-password")
            .cache(60, cacheKeys.USERCURRENT + ((_b = req.user) === null || _b === void 0 ? void 0 : _b._id));
        // .exec();
        if (!user)
            return res.status(404).send("User not found");
        (0, config_1.logger)("/user/getCurrentUser", "user", user);
        res.send(user);
    });
});
// Search users by name or handle
(0, config_1.makeRoute)("get", "/user/search", [exports.authUser], router, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = req.query.q;
        let users = yield models_1.User.find({
            $or: [
                { name: { $regex: query, $options: "i" } },
                { handle: { $regex: query, $options: "i" } },
            ],
        })
            .select("name handle pfp")
            .cache(60, cacheKeys.USERSEARCH + query);
        // .exec();
        res.send(users);
    });
});
// check if user exists
(0, config_1.makeRoute)("get", "/user/check", [], router, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const handle = req.query.q;
        const user = yield models_1.User.findOne({ handle: handle });
        // .cache(
        //   60,
        //   cacheKeys.USERCHECK + handle,
        // );
        // .exec();
        if (!user) {
            return res.status(200).send("false");
        }
        res.status(200).send("true");
    });
});
// login user
(0, config_1.makeRoute)("post", "/user/login", [], router, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { handle, password } = req.body;
        const user = yield models_1.User.findOne({ handle });
        if (!user) {
            return res.status(400).send({ error: "Invalid handle or password" });
        }
        const isMatch = yield user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).send({ error: "Invalid handle or password" });
        }
        res.send(user.generateAuthToken());
    });
});
// login user
(0, config_1.makeRoute)("get", "/user/clearCache", [], router, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, config_1.clearCacheAndLog)("/user/clearCache", null);
        res.status(200).send("cleared cache");
    });
});
exports.default = router;
