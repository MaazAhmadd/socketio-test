"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const node_http_1 = require("node:http");
const socket_io_1 = require("socket.io");
const db_1 = require("./db");
const roomRouter_1 = __importDefault(require("./roomRouter"));
const userRouter_1 = __importDefault(require("./userRouter"));
const ytRouter_1 = __importDefault(require("./ytRouter"));
const socketServer_1 = __importStar(require("./socketServer"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const config_1 = require("./config");
const port = process.env.PORT || 3000;
const app = (0, express_1.default)();
const server = (0, node_http_1.createServer)(app);
const prisma = new client_1.PrismaClient();
app.use((req, res, next) => {
    req.prisma = prisma;
    next();
});
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    allowedHeaders: [
        "Origin",
        "X-Requested-With",
        "Content-Type",
        "Accept",
        "Authorization",
        "x-auth-token",
    ],
}));
(0, db_1.connectDB)();
const io = new socket_io_1.Server(server, {
    cors: {
        allowedHeaders: [
            "Origin",
            "X-Requested-With",
            "Content-Type",
            "Accept",
            "Authorization",
            "x-auth-token",
        ],
    },
});
(0, socketServer_1.default)(io, prisma);
// setTimeout(() => {
setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
    (0, config_1.logger)("deleteInactiveRooms", "checking inactive rooms to delete...");
    yield (0, socketServer_1.deleteInactiveRooms)(prisma);
}), process.env.NODE_ENV === "production"
    ? 1000 * 60 * 60 * 24 // 1 day
    : 1000 * 60 * 5);
// setInterval(() => deleteInactiveRooms(prisma), 86_400_000);
// }, 10_000);
// }, 86_400_000);
app.get("/api/test", (req, res) => res.send("Express Ready"));
app.use("/api", userRouter_1.default);
app.use("/api", roomRouter_1.default);
app.use("/api", ytRouter_1.default);
server.listen(port, () => {
    if (config_1.disableGlobalLogging) {
        console.log("[production] server running at http://localhost:" + port);
        console.log("logging disabled");
    }
    (0, config_1.logger)("server", "server running at http://localhost:" + port);
});
// prisma disconnect
process.on("SIGINT", () => {
    prisma.$disconnect();
    process.exit();
});
process.on("SIGTERM", () => {
    prisma.$disconnect();
    process.exit();
});
module.exports = app;
