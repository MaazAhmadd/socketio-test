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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userRouter_1 = require("./userRouter");
const socketServer_1 = require("./socketServer");
const router = express_1.default.Router();
router.get("/publicrooms", userRouter_1.authUser, (_a, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    var { prisma, body } = _a, req = __rest(_a, ["prisma", "body"]);
    console.log("[room/publicrooms]: ", (_b = req.user) === null || _b === void 0 ? void 0 : _b.handle);
    try {
        const rooms = yield (prisma === null || prisma === void 0 ? void 0 : prisma.room.findMany({
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
        }));
        res.status(200).json(rooms);
    }
    catch (error) {
        console.log("[room/publicrooms] error: ", error);
        res.status(500).json({
            errorMessage: "An error occurred on the server. [get - /api/room/allrooms]",
            error,
        });
    }
}));
router.get("/checkActiveMember", userRouter_1.authUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        if (!req.prisma)
            return;
        const isMemberAlreadyActive = yield (0, socketServer_1.checkIfMemberAlreadyActive)((_c = req.user) === null || _c === void 0 ? void 0 : _c.handle, req.prisma);
        res.status(200).json(isMemberAlreadyActive);
    }
    catch (error) {
        console.log("[room/checkActiveMember] error: ", error);
        res.status(500).json({
            errorMessage: "An error occurred on the server. [get - /api/room/checkActiveMember]",
            error,
        });
    }
}));
exports.default = router;
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
