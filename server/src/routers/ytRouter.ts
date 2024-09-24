import axios from "axios";
import express from "express";
import mongooseModels, { YtVideoType } from "../mongoose/models";
import { authUser } from "../middlewares";
import { forwardError } from "./asyncWrapper";
import { logger } from "../logger";

const YtVideo = mongooseModels.YtVideo;
const router = express.Router();

router.get(
	"/ytservice",
	authUser,
	forwardError(async function (req, res) {
		const videoInfo = await ytInfoService(req.query?.url as string);
		if (videoInfo) {
			return res.send(videoInfo);
		}
		res.status(404).send("video not found");
	}),
);

router.get(
	"/ytservice/search",
	authUser,
	forwardError(async function (req, res) {
		try {
			const response = await searchVideos(req.query?.q as string);
			if (response) {
				return res.send(response);
			}
			return res.status(404).send("videos not found");
		} catch (error: any) {
			res.status(500).send({
				errorMessage: "An error occurred on the server. [post - /ytservice]",
				error: error.message,
			});
		}
	}),
);

// makeRoute(
//   "get",
//   "/ytservice/test",
//   [],
//   router,
//   asyncWrapper(async function (req, res) {
//     const randomytid = Array.from({ length: 10 }).map((m) =>
//       Math.random().toString(36).slice(2),
//     );
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
//         .send({ message: "10 items added", ids: itemtoadd.map((m) => m.ytId) });
//     } catch (error: any) {
//       res.status(500).send({
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
	if (count >= 1000) {
		const items = await YtVideo.find({})
			.sort({ updatedAt: -1 })
			.skip(899)
			.limit(1);

		const oldestItem = items[0];

		const deleted = await YtVideo.deleteMany({
			updatedAt: { $lt: oldestItem.updatedAt },
		});
	}
	const ytVideo = new YtVideo(newItem);
	await ytVideo.save();
	return ytVideo;
}

function youTubeGetID(url: string) {
	const _url = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
	return _url[2] !== undefined ? _url[2].split(/[^0-9a-z_\-]/i)[0] : _url[0];
}

async function getVideoInfo(videoId: string): Promise<YtVideoType | null> {
	const apiKey = process.env.YOUTUBE_API_KEY;

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

		console.log("getVideoInfo youtube data api, info fetching response:", {
			title: response.data.items[0].snippet.title as string,
			thumbnail: response.data.items[0].snippet.thumbnails.high.url as string,
			duration: response.data.items[0].contentDetails.duration,
			ytId: videoId as string,
			updatedAt: new Date(),
		});
		return {
			title: response.data.items[0].snippet.title as string,
			thumbnail: response.data.items[0].snippet.thumbnails.high.url as string,
			duration: response.data.items[0].contentDetails.duration as string,
			ytId: videoId as string,
			updatedAt: new Date(),
		};
	} catch (error: any) {
		logger.info(`getVideoInfo youtube data api, info fetching error: ${error}`);

		return null;
	}
}

// function parseYouTubeDuration(duration: string): number {
// 	const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
// 	if (!match) {
// 		throw new Error("Invalid duration format");
// 	}

// 	const hours = (Number.parseInt(match[1]) || 0) * 3600000;
// 	const minutes = (Number.parseInt(match[2]) || 0) * 60000;
// 	const seconds = (Number.parseInt(match[3]) || 0) * 1000;

// 	return hours + minutes + seconds;
// }


