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
const express_1 = __importDefault(require("express"));
const userRouter_1 = require("./userRouter");
const config_1 = require("./config");
const router = express_1.default.Router();
(0, config_1.makeRoute)("get", "/room/publicrooms", [userRouter_1.authUser], router, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const rooms = yield ((_a = req.prisma) === null || _a === void 0 ? void 0 : _a.room.findMany({
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
                        leaderPC: "asc",
                    },
                },
                videoPlayer: true,
            },
            take: 10,
        }));
        res.status(200).json(rooms);
    });
});
(0, config_1.makeRoute)("get", "/room/checkActiveMember", [userRouter_1.authUser], router, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const member = yield req.prisma.member.findFirst({
            where: {
                mongoId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
                isConnected: true,
            },
        });
        res.status(200).json(member ? true : false);
    });
});
exports.default = router;
