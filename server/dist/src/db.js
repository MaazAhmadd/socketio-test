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
exports.prisma = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const client_1 = require("@prisma/client");
const config_1 = require("./config");
const recachegoose_1 = __importDefault(require("recachegoose"));
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, recachegoose_1.default)(mongoose_1.default, {
            engine: "memory",
        });
        (0, config_1.logger)("connectDB", " connecting to DB... ", config_1.mongodb);
        yield mongoose_1.default.connect(config_1.mongodb);
        (0, config_1.logger)("connectDB", "MongoDB Connected...");
    }
    catch (err) {
        if (err instanceof Error)
            console.error("[db] error", err);
        // Exit process with failure
        process.exit(1);
    }
});
exports.connectDB = connectDB;
exports.prisma = new client_1.PrismaClient();
