"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    mongodb: process.env.NODE_ENV === "production"
        ? process.env.MONGODB_CON_STRING
        : "mongodb://localhost:27017/chatappAuth",
};
