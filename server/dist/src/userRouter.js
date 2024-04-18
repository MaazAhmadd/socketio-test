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
makeRoute("post", "/user/register", [], function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, config_1.logger)("/user/register", "register router req.body: ", req.body);
        const { name, handle, pfp, password } = req.body;
        let user = yield models_1.User.findOne({ handle });
        if (user) {
            return res.status(200).send(user.generateAuthToken());
        }
        user = new models_1.User({ name, handle, pfp, password });
        yield user.save();
        res.status(201).send(user.generateAuthToken());
    });
});
// Update user by id or handle whatever is provided
makeRoute("put", "/user/updateuser/:id", [exports.authUser], function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const updates = Object.keys(req.body);
        const allowedUpdates = ["name", "handle", "pfp", "password"];
        const isValidOperation = updates.some((update) => allowedUpdates.includes(update));
        if (!isValidOperation) {
            return res.status(400).send({ error: "Invalid updates!" });
        }
        let user;
        if (mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            user = yield models_1.User.findById(req.params.id);
        }
        else {
            user = yield models_1.User.findOne({ handle: (_a = req.user) === null || _a === void 0 ? void 0 : _a.handle });
        }
        if (!user) {
            return res.status(404).send("User not found");
        }
        updates.forEach((update) => (user[update] = req.body[update]));
        yield user.save();
        res.send(user);
    });
});
// Send Friend Request
makeRoute("get", "/user/sendFriendRequest/:receiverHandle", [exports.authUser], function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const user = yield models_1.User.findOne({
            handle: (_a = req.user) === null || _a === void 0 ? void 0 : _a.handle,
        });
        const friend = yield models_1.User.findOne({ handle: req.params.receiverHandle });
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
    });
});
// Accept Friend Request
makeRoute("get", "/user/acceptFriendRequest/:senderHandle", [exports.authUser], function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const user = yield models_1.User.findOne({ handle: (_a = req.user) === null || _a === void 0 ? void 0 : _a.handle });
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
    });
});
// Remove Friend
makeRoute("get", "/user/removeFriend/:friendHandle", [exports.authUser], function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const user = yield models_1.User.findOne({
            handle: (_a = req.user) === null || _a === void 0 ? void 0 : _a.handle,
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
    });
});
// get Friendlist
makeRoute("get", "/user/fetchFriendlist", [exports.authUser], function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const user = yield models_1.User.findOne({
            handle: (_a = req.user) === null || _a === void 0 ? void 0 : _a.handle,
        }).populate("friends", "handle -_id");
        if (!user) {
            return res.status(404).send();
        }
        const friendsHandles = user.friends.map((f) => f.handle);
        res.status(200).json({ friends: friendsHandles });
    });
});
// Fetch Friend Requests Received
makeRoute("get", "/user/fetchFriendRequestsReceived", [exports.authUser], function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const user = yield models_1.User.findOne({
            handle: (_a = req.user) === null || _a === void 0 ? void 0 : _a.handle,
        }).populate("friendReqsReceived", "handle -_id");
        if (!user) {
            return res.status(404).send();
        }
        const friendRequestsReceivedHandles = user.friendReqsReceived.map((user) => user.handle);
        res
            .status(200)
            .json({ friendRequestsReceived: friendRequestsReceivedHandles });
    });
});
// Fetch Friend Requests Sent
makeRoute("get", "/user/fetchFriendRequestsSent", [exports.authUser], function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const user = yield models_1.User.findOne({
            handle: (_a = req.user) === null || _a === void 0 ? void 0 : _a.handle,
        }).populate("friendReqsSent", "handle -_id");
        if (!user) {
            return res.status(404).send();
        }
        const friendRequestsSentHandles = user.friendReqsSent.map((user) => user.handle);
        res.status(200).json({ friendRequestsSent: friendRequestsSentHandles });
    });
});
// Get a single user by ID or handle
makeRoute("get", "/user/getuser/:id", [exports.authUser], function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
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
    });
});
// Get current user by ID or handle
makeRoute("get", "/user/getCurrentUser", [exports.authUser], function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        let userToSend;
        let user = yield models_1.User.findOne({ handle: (_a = req.user) === null || _a === void 0 ? void 0 : _a.handle })
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
    });
});
// Get all users
makeRoute("get", "/user/all", [exports.authUser], function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const users = yield models_1.User.find({}).select("-password -_id");
        res.send(users);
    });
});
// Search users by name or handle
makeRoute("get", "/user/search", [exports.authUser], function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = req.query.q;
        let users = yield models_1.User.find({
            $or: [
                { name: { $regex: query, $options: "i" } },
                { handle: { $regex: query, $options: "i" } },
            ],
        }).select("name handle pfp");
        res.send(users);
    });
});
// check if user exists
makeRoute("get", "/user/check", [exports.authUser], function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const handle = req.query.q;
        const user = yield models_1.User.findOne({ handle: handle });
        if (!user) {
            return res.status(200).send("false");
        }
        res.send("true");
    });
});
// login user
makeRoute("post", "/user/login", [], function (req, res) {
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
function makeRoute(route, endpoint, middleware, fn, 
// router: Router,
errorMsg = "error on the server, check logs") {
    return router[route](endpoint, middleware, (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            yield fn(req, res);
        }
        catch (error) {
            (0, config_1.logger)(endpoint, errorMsg, error);
            if (process.env.NODE_ENV === "production") {
                res.status(500).send(errorMsg);
            }
            else {
                if (error instanceof Error)
                    res.status(500).send(error.message);
            }
        }
    }));
}
exports.default = router;
