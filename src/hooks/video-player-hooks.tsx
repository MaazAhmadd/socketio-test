import axios from "axios";
import { useEffect, useState } from "react";
import ReactPlayer from "react-player";

type NoembedRes = {
	thumbnail_url: string;
	title: string;
	error: string;
};

export type YoutubeInfo = {
	title: string;
	thumbnail: string;
	duration: number | null;
};

export function useVideoInfo(src: string, platform: number) {
	/*
	vidType
	0 -> youtube
	1 -> web/custom
	*/
	const [info, setInfo] = useState<YoutubeInfo>({
		title: "",
		thumbnail: "",
		duration: null,
	});
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const noembedUrl = `https://noembed.com/embed?url=${src}`;

	useEffect(() => {
		if (!src) return;

		const fetchData = async () => {
			setIsLoading(true);
			try {
				const res = await axios.get<NoembedRes>(noembedUrl);
				if (res.data.error) {
					setError("No playable source");
				} else {
					setInfo({
						title: res.data.title,
						thumbnail: res.data.thumbnail_url,
						duration: null,
					});
				}
			} catch (error) {
				setError("No playable source");
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [src, noembedUrl]);

	useEffect(() => {
		if (!isLoading || error) return;

		const timer = setTimeout(() => {
			if (isLoading) setIsLoading(false);
			if (!error) setError("Something went wrong, try another URL");
		}, 10000);

		return () => clearTimeout(timer);
	}, [isLoading, error]);

	if (!src) {
		return {
			info: { title: "", thumbnail: "", duration: null },
			error: "",
			setError: () => {},
			isLoading: false,
			player: null,
		};
	}

	const player = error ? null : (
		<ReactPlayer
			url={src}
			style={{ display: "none" }}
			onDuration={(duration: number) => {
				setInfo((prev) => ({ ...prev, duration }));
				setIsLoading(false);
			}}
			onReady={(p) => p.seekTo(1, "seconds")}
			onError={(error: any) => {
				setError(error.message || "Video unavailable");
				setIsLoading(false);
			}}
		/>
	);

	return { info, error, setError, isLoading, player };
}
