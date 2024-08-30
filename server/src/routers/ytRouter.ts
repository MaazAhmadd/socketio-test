import axios from "axios";
import express from "express";
import { logger, makeRoute } from "../config";
import mongooseModels, { YtVideoType } from "../mongoose/models";
import { authUser } from "../middlewares";

const YtVideo = mongooseModels.YtVideo;
const router = express.Router();

makeRoute("get", "/ytservice", [authUser], router, async function (req, res) {
  const videoInfo = await ytInfoService(req.query?.url as string);
  if (videoInfo) {
    return res.send(videoInfo);
  }
  res.status(404).send("video not found");
});

makeRoute(
  "get",
  "/ytservice/search",
  [authUser],
  router,
  async function (req, res) {
    logger("/ytservice/search", "query: ", req.query?.q);
    try {
      const response = await searchVideos(req.query?.q as string);
      if (response) {
        logger("/ytservice/search", "videos found", response.length);
        return res.send(response);
      }
      logger("/ytservice/search", "videos not found");
      return res.status(404).send("videos not found");
    } catch (error: any) {
      logger("/ytservice/search", "error: ", error);
      res.status(500).json({
        errorMessage: "An error occurred on the server. [post - /ytservice]",
        error: error.message,
      });
    }
  },
);

// makeRoute(
//   "get",
//   "/ytservice/test",
//   [],
//   router,
//   async function (req, res) {
//     const randomytid = Array.from({ length: 10 }).map((m) =>
//       Math.random().toString(36).slice(2),
//     );
//     logger("/ytservice/test", "randomytid", randomytid);
//     try {
//       const itemtoadd: YtVideo[] = randomytid.map((m) => ({
//         ytId: m,
//         thumbnail: "https://i.ytimg.com/vi/" + req.query?.q + "/hqdefault.jpg",
//         title: "test",
//         duration: "00:00:00",
//         updatedAt: new Date(),
//       }));
//       for (let i in itemtoadd) {
//         await addNewItem(itemtoadd[i], req.mongooseModels?.YtVideo!);
//       }
//       // await Promise.all(
//       //   itemtoadd.map((m) => addNewItem(m, req.mongooseModels?.YtVideo!)),
//       // );

//       res
//         .status(201)
//         .json({ message: "10 items added", ids: itemtoadd.map((m) => m.ytId) });
//     } catch (error: any) {
//       logger("/ytservice/test", "error: ", error);
//       res.status(500).json({
//         errorMessage: "An error occurred on the server. [post - /ytservice]",
//         error: error.message,
//       });
//     }
//   },
// );

export default router;

async function searchVideos(searchTerm: string) {
  const response = await axios.get(
    "https://www.googleapis.com/youtube/v3/search",
    {
      params: {
        part: "snippet",
        maxResults: 4,
        type: "video",
        q: searchTerm,
        key: process.env.YOUTUBE_API_KEY,
      },
    },
  );

  const resp = response.data.items.map((item: any) => item.id.videoId);
  const searchResults = resp as string[];
  if (searchResults.length > 0) {
    const videoInfos = await Promise.all(
      searchResults.map((url) => ytInfoService(url)),
    );
    return videoInfos;
  }
  return null;
}

export async function ytInfoService(url: string): Promise<YtVideoType | null> {
  const id = youTubeGetID(url);
  const ytInfo = await YtVideo.findOne({ ytId: id });
  if (ytInfo) {
    return ytInfo;
  }
  const videoInfo = await getVideoInfo(id);
  if (videoInfo) {
    await addNewItem(videoInfo);
    return videoInfo;
  }
  return null;
}

async function addNewItem(newItem: YtVideoType) {
  const count = await YtVideo.countDocuments({});
  logger("/ytservice/test", "count: ", count);
  if (count >= 1000) {
    const items = await YtVideo.find({})
      .sort({ updatedAt: -1 })
      .skip(899)
      .limit(1);
    logger("/ytservice/test", "items retreived: ", items.length);

    const oldestItem = items[0];
    logger("/ytservice/test", "oldestItem: ", oldestItem);

    const deleted = await YtVideo.deleteMany({
      updatedAt: { $lt: oldestItem.updatedAt },
    });

    logger("/ytservice/test", "older items deleted: ", deleted);
  }
  const ytVideo = new YtVideo(newItem);
  await ytVideo.save();
  return ytVideo;
}

function youTubeGetID(url: string) {
  logger("youTubeGetID", "url: ", url);
  let _url = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  return _url[2] !== undefined ? _url[2].split(/[^0-9a-z_\-]/i)[0] : _url[0];
}

async function getVideoInfo(videoId: string): Promise<YtVideoType | null> {
  logger("getVideoInfo", "videoId: ", videoId);

  let apiKey = process.env.YOUTUBE_API_KEY;

  try {
    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/videos",
      {
        params: {
          part: "snippet,contentDetails",
          id: videoId,
          key: apiKey,
        },
      },
    );

    return {
      title: response.data.items[0].snippet.title as string,
      thumbnail: response.data.items[0].snippet.thumbnails.high.url as string,
      duration: convertISO8601ToMinutesAndSeconds(
        response.data.items[0].contentDetails.duration,
      ) as string,
      ytId: videoId as string,
      updatedAt: new Date(),
    };
  } catch (error: any) {
    logger(
      "getVideoInfo",
      "youtube data api info fetching error: ",
      error.data,
    );

    return null;
  }
}

function convertISO8601ToMinutesAndSeconds(iso8601Duration: string) {
  const match = iso8601Duration.match(/PT(\d+M)?(\d+S)?/);

  let minutes = 0;
  let seconds = 0;
  if (match) {
    if (match[1]) minutes = parseInt(match[1].replace("M", ""));
    if (match[2]) seconds = parseInt(match[2].replace("S", ""));
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  } else {
    return "00:00";
  }
}
