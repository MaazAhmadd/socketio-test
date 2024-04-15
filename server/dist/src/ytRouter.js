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
exports.ytInfoService = void 0;
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const router = express_1.default.Router();
router.get("/", (_a, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    var { prisma } = _a, req = __rest(_a, ["prisma"]);
    try {
        const videoInfo = yield ytInfoService((_b = req.query) === null || _b === void 0 ? void 0 : _b.url, prisma);
        if (videoInfo) {
            return res.send(videoInfo);
        }
        return res.status(404).send("video not found");
    }
    catch (error) {
        console.log("[post - /api/ytservice] error: ", error);
        res.status(500).json({
            errorMessage: "An error occurred on the server. [post - /api/ytservice]",
            error,
        });
    }
}));
router.get("/search", (_c, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e;
    var { prisma } = _c, req = __rest(_c, ["prisma"]);
    console.log("[ytRouter search] query: ", (_d = req.query) === null || _d === void 0 ? void 0 : _d.q);
    try {
        const response = yield searchVideos((_e = req.query) === null || _e === void 0 ? void 0 : _e.q, prisma);
        if (response) {
            console.log("[ytRouter search] videos found", response.length);
            return res.send(response);
        }
        console.log("[ytRouter search] videos not found");
        return res.status(404).send("videos not found");
    }
    catch (error) {
        console.log("[ytRouter search] error: ", error);
        res.status(500).json({
            errorMessage: "An error occurred on the server. [post - /api/ytservice]",
            error: error.message,
        });
    }
}));
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
    console.log("[youTubeGetID] url: ", url);
    let _url = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    return _url[2] !== undefined ? _url[2].split(/[^0-9a-z_\-]/i)[0] : _url[0];
}
function getVideoInfo(videoId) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("[getVideoInfo] calling youtube data api with videoId: ", videoId);
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
            console.log("[getVideoInfo] youtube data api info fetching error: ", error.data);
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
