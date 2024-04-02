"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    mongodb: process.env.NODE_ENV === "development"
        ? "mongodb://localhost:27017/chatappAuth"
        : process.env.MONGODB_CON_STRING,
};
