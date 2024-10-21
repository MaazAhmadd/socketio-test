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

export function useVideoInfo(src: string, vidType: number) {
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
		console.log("[useYoutubeInfo] effect yturl: ", src);
		if (!src) return;
		const fetchData = async () => {
			setIsLoading(true);
			try {
				const res = await axios.get<NoembedRes>(noembedUrl);
				if (res.data.error) {
					setError("Invalid URL");
					setIsLoading(false);
				} else {
					setInfo({
						title: res.data.title,
						thumbnail: res.data.thumbnail_url,
						duration: null,
					});
				}
			} catch (error) {
				setError("Invalid URL");
				setIsLoading(false);
			} finally {
				// setIsLoading(false);
			}
		};

		fetchData();
	}, [src, noembedUrl]);

	useEffect(() => {
		console.log("[useYoutubeInfo] effect isLoading: ", isLoading);
		if (!src) return;
		const timer = setTimeout(() => {
			if (isLoading) {
				setIsLoading(false);
			}
			if (!error) {
				setError("Something went wrong, try another URL");
			}
		}, 10000);

		return () => clearTimeout(timer);
	}, [isLoading, error]);

	if (!src) {
		return {
			info: {
				title: "",
				thumbnail: "",
				duration: null,
			},
			error: "",
			setError: () => {},
			isLoading: false,
			player: null,
		};
	}

	const player =
		!error &&
		(!info.duration ? (
			<ReactPlayer
				url={src}
				style={{ display: "none" }}
				onDuration={(duration: number) => {
					setIsLoading(false);
					setInfo((prev) => ({
						...prev,
						duration,
					}));
				}}
				onReady={(p) => {
					p.seekTo(1, "seconds");
				}}
				onError={(error: any) => {
					if (error.message) {
						setError(error.message);
						setIsLoading(false);
					}
					if (error === 150) {
						setError("video unavailable");
						setIsLoading(false);
					}
				}}
			/>
		) : null);

	return { info, error, setError, isLoading, player };
}
