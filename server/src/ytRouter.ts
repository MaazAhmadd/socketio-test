import express, { Request, Response } from "express";
import axios from "axios";
import { PrismaClient } from "@prisma/client";
const router = express.Router();

router.get("/", async ({ prisma, ...req }: Request, res: Response) => {
  try {
    const videoInfo = await ytInfoService(req.query?.url as string, prisma!);
    if (videoInfo) {
      return res.send(videoInfo);
    }
    return res.status(404).send("video not found");
  } catch (error) {
    res.status(500).json({
      errorMessage: "An error occurred on the server. [post - /api/ytservice]",
      error,
    });
  }
});

export default router;

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
    });

    if (oldestItem) {
      await prisma.ytVideo.delete({
        where: {
          id: oldestItem.id,
        },
      });
    }
  }

  const createdItem = await prisma.ytVideo.create({
    data: {
      ytId: newItem.ytId,
      title: newItem.title,
      thumbnail: newItem.thumbnail,
    },
  });

  return createdItem;
}

function youTubeGetID(url: string) {
  console.log("[youTubeGetID] url: ", url);
  let _url = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  return _url[2] !== undefined ? _url[2].split(/[^0-9a-z_\-]/i)[0] : _url[0];
}

async function getVideoInfo(videoId: string) {
  console.log(
    "[getVideoInfo] calling youtube data api with videoId: ",
    videoId,
  );

  let apiKey = process.env.YOUTUBE_API_KEY;
  let url =
    "https://www.googleapis.com/youtube/v3/videos?id=" +
    videoId +
    "&key=" +
    apiKey +
    "&part=snippet";
  try {
    const response = await axios.get(url);
    return {
      title: response.data.items[0].snippet.title,
      thumbnail: response.data.items[0].snippet.thumbnails.standard.url,
      ytId: videoId,
    };
  } catch (error) {
    console.log("youtube data api info fetching error: ", error);
    return null;
  }
}

type VideoInfo = {
  title: string;
  thumbnail: string;
  ytId: string;
};
