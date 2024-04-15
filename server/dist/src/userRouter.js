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
// middleware to check if x-auth-token token attached and valid
const authUser = (req, res, next) => {
    const token = req.headers["x-auth-token"];
    if (!token)
        return res.status(401).json({ error: "Access denied. No token provided." });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_PRIVATE_KEY || "wefusdjnkcmjnkdsveuwdjnk34wefuijnk");
        req.user = decoded;
        next();
    }
    catch (ex) {
        console.log("[authUser] error in middleware: ", ex);
        res.status(400).json({ error: "Invalid token." });
    }
};
exports.authUser = authUser;
// Create user
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("register router body: ", req.body);
        const { name, handle, profilePicture, password } = req.body;
        let user = yield models_1.User.findOne({ handle });
        if (user) {
            return res.status(200).send(user.generateAuthToken());
        }
        user = new models_1.User({ name, handle, profilePicture, password });
        yield user.save();
        res.status(201).send(user.generateAuthToken());
    }
    catch (error) {
        console.log("[/api/user/register] error in register: ", error);
        res.status(400).send(error);
    }
}));
// Update user by id or handle whatever is provided
router.put("/updateuser/:id", exports.authUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "handle", "profilePicture", "password"];
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
        console.log("[/api/user/updateuser] error in updateuser: ", e);
        res.status(400).send(e);
    }
}));
// Send Friend Request
router.get("/sendFriendRequest/:senderId/:receiverId", exports.authUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield models_1.User.findById(req.params.senderId);
        const friend = yield models_1.User.findById(req.params.receiverId);
        if (!user || !friend) {
            return res.status(404).send();
        }
        if (!friend.friendRequests.includes(user._id)) {
            friend.friendRequests.push(user._id);
            yield friend.save();
        }
        res.send(friend);
    }
    catch (e) {
        console.log("[/api/user/sendFriendRequest] error in sendFriendRequest: ", e);
        res.status(500).send();
    }
}));
// Accept Friend Request
router.get("/acceptFriendRequest/:senderId/:receiverId", exports.authUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield models_1.User.findById(req.params.senderId);
        const friend = yield models_1.User.findById(req.params.receiverId);
        if (!user || !friend) {
            return res.status(404).send();
        }
        if (friend.friendRequests.includes(user._id)) {
            friend.friendRequests.pull(user._id);
            friend.friends.push(user._id);
            user.friends.push(friend._id);
            yield friend.save();
            yield user.save();
        }
        res.send({ user, friend });
    }
    catch (e) {
        console.log("[/api/user/acceptFriendRequest] error in acceptFriendRequest: ", e);
        res.status(500).send();
    }
}));
// Get a single user by ID or handle
router.get("/getuser/:id", exports.authUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user;
        if (mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            user = yield models_1.User.findById(req.params.id).select("-password");
        }
        else {
            user = yield models_1.User.findOne({ handle: req.params.id }).select("-password");
        }
        if (!user) {
            return res.status(404).send("User not found");
        }
        res.send(user);
    }
    catch (error) {
        console.log("[/api/user/getuser] error in getuser: ", error);
        res.status(500).send(error);
    }
}));
// Get all users
router.get("/all", exports.authUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield models_1.User.find({}).select("-password");
        res.send(users);
    }
    catch (error) {
        console.log("[/api/user/all] error in all: ", error);
        res.status(500).send(error);
    }
}));
// Search users by name or handle
// /api/user
router.get("/search", exports.authUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("search query: ", req.query.q);
    try {
        const query = req.query.q;
        let users = yield models_1.User.find({
            $or: [
                { name: { $regex: query, $options: "i" } },
                { handle: { $regex: query, $options: "i" } },
            ],
        }).select("name handle profilePicture");
        res.send(users);
    }
    catch (error) {
        console.log("[/api/user/search] error in search: ", error);
        res.status(500).send(error);
    }
}));
router.get("/check", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("check query: ", req.query.q);
    try {
        const handle = req.query.q;
        const user = yield models_1.User.findOne({ handle: handle });
        if (!user) {
            return res.status(200).send("false");
        }
        res.send("true");
    }
    catch (error) {
        console.log("[/api/user/check] error in check: ", error);
        res.status(500).send(error);
    }
}));
// login user
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("backend /login req.body: ", req.body);
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
        console.log("[/api/user/login] error in login: ", error);
        res.status(500).send(error);
    }
}));
exports.default = router;
