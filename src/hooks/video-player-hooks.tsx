import axios from "axios";
import { useEffect, useState } from "react";
import ReactPlayer from "react-player";

type NoembedRes = {
	thumbnail_url: string;
	title: string;
};

export type YoutubeInfo = {
	title: string;
	thumbnail: string;
	duration: number | null;
};

export function useYoutubeInfo(yturl: string) {
	const [info, setInfo] = useState<YoutubeInfo>({
		title: "",
		thumbnail: "",
		duration: null,
	});
	// const yturl = `https://www.youtube.com/watch?v=${ytId}`;
	const noembedUrl = `https://noembed.com/embed?url=${yturl}`;

	useEffect(() => {
		axios.get<NoembedRes>(noembedUrl).then((res) => {
			setInfo((prev) => ({
				...prev,
				title: res.data.title,
				thumbnail: res.data.thumbnail_url,
			}));
		});
	}, [noembedUrl]);

	const player = !info.duration ? (
		<ReactPlayer
			url={yturl}
			style={{ display: "none" }}
			onDuration={(duration: number) => {
				setInfo((prev) => ({
					...prev,
					duration,
				}));
			}}
		/>
	) : null;

	return { info, player };
}
