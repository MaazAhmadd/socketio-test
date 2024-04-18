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
const router = express_1.default.Router();
const models_1 = require("./models");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("./config");
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
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, config_1.logger)("/api/user/register", "register router req.body: ", req.body);
        const { name, handle, pfp, password } = req.body;
        let user = yield models_1.User.findOne({ handle });
        if (user) {
            return res.status(200).send(user.generateAuthToken());
        }
        user = new models_1.User({ name, handle, pfp, password });
        yield user.save();
        res.status(201).send(user.generateAuthToken());
    }
    catch (error) {
        (0, config_1.logger)("/api/user/register", "error in register: ", error);
        res.status(400).send(error);
    }
}));
// Update user by id or handle whatever is provided
router.put("/updateuser/:id", exports.authUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "handle", "pfp", "password"];
    const isValidOperation = updates.some((update) => allowedUpdates.includes(update));
    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid updates!" });
    }
    try {
        let user;
        if (mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            user = yield models_1.User.findById(req.params.id);
        }
        else {
            user = yield models_1.User.findOne({ handle: req.params.id });
        }
        if (!user) {
            return res.status(404).send("User not found");
        }
        updates.forEach((update) => (user[update] = req.body[update]));
        yield user.save();
        res.send(user);
    }
    catch (e) {
        (0, config_1.logger)("/api/user/updateuser", "error in updateuser: ", e);
        res.status(400).send(e);
    }
}));
// Send Friend Request
router.get("/sendFriendRequest/:receiverHandle", exports.authUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = yield models_1.User.findOne({
            handle: (_a = req.user) === null || _a === void 0 ? void 0 : _a.handle,
        });
        const friend = yield models_1.User.findOne({ handle: req.params.receiverHandle });
        (0, config_1.logger)("/api/user/sendFriendRequest", "user: ", user, "friend: ", friend);
        if (!user || !friend) {
            return res.status(404).send();
        }
        if (!friend.friends.includes(friend._id) &&
            !user.friendReqsSent.includes(friend._id)) {
            friend.friendReqsReceived.push(user._id);
            user.friendReqsSent.push(friend._id);
            yield user.save();
            yield friend.save();
            res.status(200).json({ message: "Friend request sent successfully." });
        }
        else {
            res.status(400).json({ message: "Friend request already sent." });
        }
    }
    catch (e) {
        (0, config_1.logger)("/api/user/sendFriendRequest", "error in sendFriendRequest: ", e);
        res.status(500).send();
    }
})); // Accept Friend Request
router.get("/acceptFriendRequest/:senderHandle", exports.authUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const user = yield models_1.User.findOne({ handle: (_b = req.user) === null || _b === void 0 ? void 0 : _b.handle });
        const friend = yield models_1.User.findOne({ handle: req.params.senderHandle });
        if (!user || !friend) {
            return res.status(404).send();
        }
        if (friend.friendReqsReceived.includes(user._id) &&
            !user.friends.includes(friend._id)) {
            friend.friendReqsReceived.pull(user._id);
            friend.friends.push(user._id);
            user.friendReqsSent.pull(friend._id);
            user.friends.push(friend._id);
            yield friend.save();
            yield user.save();
            res
                .status(200)
                .json({ message: "Friend request accepted successfully." });
        }
        else {
            res.status(400).json({ message: "no valid request to accept" });
        }
    }
    catch (e) {
        (0, config_1.logger)("/api/user/acceptFriendRequest", "error in acceptFriendRequest: ", e);
        res.status(500).send();
    }
}));
// Remove Friend
router.get("/removeFriend/:friendHandle", exports.authUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const user = yield models_1.User.findOne({
            handle: (_c = req.user) === null || _c === void 0 ? void 0 : _c.handle,
        });
        const friend = yield models_1.User.findOne({ handle: req.params.friendHandle });
        if (!user || !friend) {
            return res.status(404).send();
        }
        if (user.friends.includes(friend._id)) {
            user.friends.pull(friend._id);
            friend.friends.pull(user._id);
            yield user.save();
            yield friend.save();
            res.status(200).json({ message: "Friend removed successfully." });
        }
        else {
            res.status(400).json({ message: "Friend not found." });
        }
    }
    catch (e) {
        (0, config_1.logger)("/api/user/removeFriend", "error in removeFriend: ", e);
        res.status(500).send();
    }
}));
// get Friendlist
router.get("/fetchFriendlist", exports.authUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e;
    try {
        (0, config_1.logger)("/api/user/fetchFriendlist", "fetchFriendlist: ", (_d = req.user) === null || _d === void 0 ? void 0 : _d.handle);
        const user = yield models_1.User.findOne({
            handle: (_e = req.user) === null || _e === void 0 ? void 0 : _e.handle,
        }).populate("friends", "handle -_id");
        (0, config_1.logger)("/api/user/fetchFriendlist", "user: ", user);
        if (!user) {
            return res.status(404).send();
        }
        const friendsHandles = user.friends.map((f) => f.handle);
        res.status(200).json({ friends: friendsHandles });
    }
    catch (e) {
        (0, config_1.logger)("/api/user/fetchFriendlist", "error in fetchFriendlist: ", e);
        res.status(500).send();
    }
}));
// Fetch Friend Requests Received
router.get("/fetchFriendRequestsReceived", exports.authUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _f;
    try {
        const user = yield models_1.User.findOne({
            handle: (_f = req.user) === null || _f === void 0 ? void 0 : _f.handle,
        }).populate("friendReqsReceived", "handle -_id");
        if (!user) {
            return res.status(404).send();
        }
        const friendRequestsReceivedHandles = user.friendReqsReceived.map((user) => user.handle);
        res
            .status(200)
            .json({ friendRequestsReceived: friendRequestsReceivedHandles });
    }
    catch (e) {
        (0, config_1.logger)("/api/user/fetchFriendRequestsReceived", "error in fetchFriendRequestsReceived: ", e);
        res.status(500).send();
    }
}));
// Fetch Friend Requests Sent
router.get("/fetchFriendRequestsSent", exports.authUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _g;
    try {
        const user = yield models_1.User.findOne({
            handle: (_g = req.user) === null || _g === void 0 ? void 0 : _g.handle,
        }).populate("friendReqsSent", "handle -_id");
        if (!user) {
            return res.status(404).send();
        }
        const friendRequestsSentHandles = user.friendReqsSent.map((user) => user.handle);
        res.status(200).json({ friendRequestsSent: friendRequestsSentHandles });
    }
    catch (e) {
        (0, config_1.logger)("/api/user/fetchFriendRequestsSent", "error in fetchFriendRequestsSent: ", e);
        res.status(500).send();
    }
}));
// Get a single user by ID or handle
router.get("/getuser/:id", exports.authUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user;
        if (mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            user = yield models_1.User.findById(req.params.id).select("-password -_id");
        }
        else {
            user = yield models_1.User.findOne({ handle: req.params.id }).select("-password -_id");
        }
        if (!user) {
            return res.status(404).send("User not found");
        }
        res.send(user);
    }
    catch (error) {
        (0, config_1.logger)("/api/user/getuser", "error in getuser: ", error);
        res.status(500).send(error);
    }
}));
// Get current user by ID or handle
router.get("/getCurrentUser", exports.authUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _h;
    let userToSend;
    try {
        let user = yield models_1.User.findOne({ handle: (_h = req.user) === null || _h === void 0 ? void 0 : _h.handle })
            .select("-password -_id")
            .populate("friends friendReqsSent friendReqsReceived", "handle -_id");
        if (!user) {
            return res.status(404).send("User not found");
        }
        userToSend = {
            name: user.name,
            handle: user.handle,
            pfp: user.pfp,
            friends: user.friends.map((f) => f.handle),
            friendReqsSent: user.friendReqsSent.map((f) => f.handle),
            friendReqsReceived: user.friendReqsReceived.map((f) => f.handle),
        };
        res.send(userToSend);
    }
    catch (error) {
        (0, config_1.logger)("/api/user/getuser", "error in getuser: ", error);
        res.status(500).send(error);
    }
}));
// Get all users
router.get("/all", exports.authUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield models_1.User.find({}).select("-password -_id");
        res.send(users);
    }
    catch (error) {
        (0, config_1.logger)("/api/user/all", "error in all: ", error);
        res.status(500).send(error);
    }
}));
// Search users by name or handle
// /api/user
router.get("/search", exports.authUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, config_1.logger)("/api/user/search", "search query: ", req.query.q);
    try {
        const query = req.query.q;
        let users = yield models_1.User.find({
            $or: [
                { name: { $regex: query, $options: "i" } },
                { handle: { $regex: query, $options: "i" } },
            ],
        }).select("name handle pfp");
        res.send(users);
    }
    catch (error) {
        (0, config_1.logger)("/api/user/search", "error in search: ", error);
        res.status(500).send(error);
    }
}));
router.get("/check", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, config_1.logger)("/api/user/check", "check query: ", req.query.q);
    try {
        const handle = req.query.q;
        const user = yield models_1.User.findOne({ handle: handle });
        if (!user) {
            return res.status(200).send("false");
        }
        res.send("true");
    }
    catch (error) {
        (0, config_1.logger)("/api/user/check", "error in check: ", error);
        res.status(500).send(error);
    }
}));
// login user
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, config_1.logger)("/api/user/login", "req.body: ", req.body);
    try {
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
    }
    catch (error) {
        (0, config_1.logger)("/api/user/login", "error in login: ", error);
        res.status(500).send(error);
    }
}));
exports.default = router;
