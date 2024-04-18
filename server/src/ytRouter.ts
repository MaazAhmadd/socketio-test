import express, { Request, Response } from "express";
import axios, { AxiosError } from "axios";
import { PrismaClient } from "@prisma/client";
import { VideoInfo } from "../types/types";
import { logger } from "./config";
const router = express.Router();

router.get("/ytservice", async ({ prisma, ...req }: Request, res: Response) => {
  try {
    const videoInfo = await ytInfoService(req.query?.url as string, prisma!);
    if (videoInfo) {
      return res.send(videoInfo);
    }
    return res.status(404).send("video not found");
  } catch (error) {
    logger("/ytservice", "error: ", error);
    res.status(500).json({
      errorMessage: "An error occurred on the server. [post - /ytservice]",
      error,
    });
  }
});

router.get(
  "/ytservice/search",
  async ({ prisma, ...req }: Request, res: Response) => {
    logger("/ytservice/search", "query: ", req.query?.q);

    try {
      const response = await searchVideos(req.query?.q as string, prisma!);
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

export default router;

async function searchVideos(searchTerm: string, prisma: PrismaClient) {
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
      searchResults.map((url) => ytInfoService(url, prisma!)),
    );
    return videoInfos;
  }
  return null;
}

export async function ytInfoService(
  url: string,
  prisma: PrismaClient,
): Promise<VideoInfo | null> {
  const id = youTubeGetID(url);
  const ytInfo = await prisma!.ytVideo.findUnique({
    where: {
      ytId: id,
    },
  });
  if (ytInfo) {
    return ytInfo;
  }
  const videoInfo = await getVideoInfo(id);
  if (videoInfo) {
    await addNewItem(videoInfo, prisma!);
    return videoInfo;
  }
  return null;
}

async function addNewItem(newItem: VideoInfo, prisma: PrismaClient) {
  const count = await prisma.ytVideo.count();
  if (count >= 10_000) {
    const oldestItem = await prisma.ytVideo.findFirst({
      orderBy: {
        updatedAt: "asc",
      },
      skip: 9000,
    });
    await prisma.ytVideo.deleteMany({
      where: {
        updatedAt: {
          lt: oldestItem?.updatedAt,
        },
      },
    });
  }
  const createdItem = await prisma.ytVideo.create({
    data: {
      ytId: newItem.ytId,
      title: newItem.title,
      thumbnail: newItem.thumbnail,
      duration: newItem.duration,
    },
  });

  return createdItem;
}

function youTubeGetID(url: string) {
  logger("youTubeGetID", "url: ", url);
  let _url = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  return _url[2] !== undefined ? _url[2].split(/[^0-9a-z_\-]/i)[0] : _url[0];
}

async function getVideoInfo(videoId: string) {
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
      title: response.data.items[0].snippet.title,
      thumbnail: response.data.items[0].snippet.thumbnails.high.url,
      duration: convertISO8601ToMinutesAndSeconds(
        response.data.items[0].contentDetails.duration,
      ),
      ytId: videoId,
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
