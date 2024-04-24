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
exports.ytInfoService = void 0;
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const config_1 = require("./config");
const userRouter_1 = require("./userRouter");
const router = express_1.default.Router();
(0, config_1.makeRoute)("get", "/ytservice", [userRouter_1.authUser], router, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const videoInfo = yield ytInfoService((_a = req.query) === null || _a === void 0 ? void 0 : _a.url, req.prisma);
        if (videoInfo) {
            return res.send(videoInfo);
        }
        res.status(404).send("video not found");
    });
});
(0, config_1.makeRoute)("get", "/ytservice/search", [userRouter_1.authUser], router, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        (0, config_1.logger)("/ytservice/search", "query: ", (_a = req.query) === null || _a === void 0 ? void 0 : _a.q);
        try {
            const response = yield searchVideos((_b = req.query) === null || _b === void 0 ? void 0 : _b.q, req.prisma);
            if (response) {
                (0, config_1.logger)("/ytservice/search", "videos found", response.length);
                return res.send(response);
            }
            (0, config_1.logger)("/ytservice/search", "videos not found");
            return res.status(404).send("videos not found");
        }
        catch (error) {
            (0, config_1.logger)("/ytservice/search", "error: ", error);
            res.status(500).json({
                errorMessage: "An error occurred on the server. [post - /ytservice]",
                error: error.message,
            });
        }
    });
});
exports.default = router;
function searchVideos(searchTerm, prisma) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axios_1.default.get("https://www.googleapis.com/youtube/v3/search", {
            params: {
                part: "snippet",
                maxResults: 4,
                type: "video",
                q: searchTerm,
                key: process.env.YOUTUBE_API_KEY,
            },
        });
        const resp = response.data.items.map((item) => item.id.videoId);
        const searchResults = resp;
        if (searchResults.length > 0) {
            const videoInfos = yield Promise.all(searchResults.map((url) => ytInfoService(url, prisma)));
            return videoInfos;
        }
        return null;
    });
}
function ytInfoService(url, prisma) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = youTubeGetID(url);
        const ytInfo = yield prisma.ytVideo.findUnique({
            where: {
                ytId: id,
            },
        });
        if (ytInfo) {
            return ytInfo;
        }
        const videoInfo = yield getVideoInfo(id);
        if (videoInfo) {
            yield addNewItem(videoInfo, prisma);
            return videoInfo;
        }
        return null;
    });
}
exports.ytInfoService = ytInfoService;
function addNewItem(newItem, prisma) {
    return __awaiter(this, void 0, void 0, function* () {
        const count = yield prisma.ytVideo.count();
        if (count >= 10000) {
            const oldestItem = yield prisma.ytVideo.findFirst({
                orderBy: {
                    updatedAt: "asc",
                },
                skip: 9000,
            });
            yield prisma.ytVideo.deleteMany({
                where: {
                    updatedAt: {
                        lt: oldestItem === null || oldestItem === void 0 ? void 0 : oldestItem.updatedAt,
                    },
                },
            });
        }
        const createdItem = yield prisma.ytVideo.create({
            data: {
                ytId: newItem.ytId,
                title: newItem.title,
                thumbnail: newItem.thumbnail,
                duration: newItem.duration,
            },
        });
        return createdItem;
    });
}
function youTubeGetID(url) {
    (0, config_1.logger)("youTubeGetID", "url: ", url);
    let _url = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    return _url[2] !== undefined ? _url[2].split(/[^0-9a-z_\-]/i)[0] : _url[0];
}
function getVideoInfo(videoId) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, config_1.logger)("getVideoInfo", "videoId: ", videoId);
        let apiKey = process.env.YOUTUBE_API_KEY;
        try {
            const response = yield axios_1.default.get("https://www.googleapis.com/youtube/v3/videos", {
                params: {
                    part: "snippet,contentDetails",
                    id: videoId,
                    key: apiKey,
                },
            });
            return {
                title: response.data.items[0].snippet.title,
                thumbnail: response.data.items[0].snippet.thumbnails.high.url,
                duration: convertISO8601ToMinutesAndSeconds(response.data.items[0].contentDetails.duration),
                ytId: videoId,
            };
        }
        catch (error) {
            (0, config_1.logger)("getVideoInfo", "youtube data api info fetching error: ", error.data);
            return null;
        }
    });
}
function convertISO8601ToMinutesAndSeconds(iso8601Duration) {
    const match = iso8601Duration.match(/PT(\d+M)?(\d+S)?/);
    let minutes = 0;
    let seconds = 0;
    if (match) {
        if (match[1])
            minutes = parseInt(match[1].replace("M", ""));
        if (match[2])
            seconds = parseInt(match[2].replace("S", ""));
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    }
    else {
        return "00:00";
    }
}
