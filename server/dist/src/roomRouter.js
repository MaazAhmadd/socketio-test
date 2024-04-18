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
const socketServer_1 = require("./socketServer");
const config_1 = require("./config");
const router = express_1.default.Router();
makeRoute("get", "/room/publicrooms", [userRouter_1.authUser], function (req, res) {
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
makeRoute("get", "/room/checkActiveMember", [userRouter_1.authUser], function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const isMemberAlreadyActive = yield (0, socketServer_1.checkIfMemberAlreadyActive)((_a = req.user) === null || _a === void 0 ? void 0 : _a.handle, req.prisma);
        res.status(200).json(isMemberAlreadyActive);
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
