import { cn } from "@/lib/utils";
import { usePlayerStore } from "@/store";
import { useEffect, useRef, useState } from "react";
import { TiArrowSortedUp, TiArrowSortedDown } from "react-icons/ti";
import ReactPlayer from "react-player";

const VideoPlayer = ({ screen }: { screen: "mobile" | "desktop" }) => {
	const [open, setOpen] = useState(true);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const pRef = useRef<ReactPlayer | null>(null);
	// Extract state values and setter functions from the store as an object
	const {
		url,
		pip,
		playing,
		loop,
		playbackRate,
		volume,
		muted,
		duration,
		progress,
		serverTimeOffset,
		playerType,
		playerRef,
		setUrl,
		setPip,
		setPlaying,
		setLoop,
		setPlaybackRate,
		setVolume,
		setMuted,
		setDuration,
		setProgress,
		setServerTimeOffset,
		setPlayerType,
		setPlayerRef,
	} = usePlayerStore((s) => ({
		url: s.url,
		pip: s.pip,
		playing: s.playing,
		loop: s.loop,
		playbackRate: s.playbackRate,
		volume: s.volume,
		muted: s.muted,
		duration: s.duration,
		progress: s.progress,
		serverTimeOffset: s.serverTimeOffset,
		playerType: s.playerType,
		playerRef: s.playerRef,
		setUrl: s.setUrl,
		setPip: s.setPip,
		setPlaying: s.setPlaying,
		setLoop: s.setLoop,
		setPlaybackRate: s.setPlaybackRate,
		setVolume: s.setVolume,
		setMuted: s.setMuted,
		setDuration: s.setDuration,
		setProgress: s.setProgress,
		setServerTimeOffset: s.setServerTimeOffset,
		setPlayerType: s.setPlayerType,
		setPlayerRef: s.setPlayerRef,
	}));

	const playerlog = usePlayerStore((s) => s);
	useEffect(() => {
		console.log("[videoPlayer] playerlog: ", playerlog);
	}, []);

	const load = (url: string) => {
		setUrl(url);
		setProgress(0);
		setPip(false);
	};

	const handlePlayPause = () => setPlaying(!playing);
	const handleToggleLoop = () => setLoop(!loop);

	const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setVolume(Number.parseFloat(e.target.value));
	};
	const handleToggleMuted = () => setMuted(!muted);

	const handleSetPlaybackRate = (e: React.MouseEvent<HTMLButtonElement>) => {
		setPlaybackRate(Number.parseFloat(e.currentTarget.value));
	};

	// const handleTogglePIP = () => setPip((prev) => !prev);
	const handlePlay = () => {
		console.log("onplay serverTimeOffset: ", serverTimeOffset);
		setPlaying(true);
	};
	// const handleEnablePIP = () => setPip(true);
	// const handleDisablePIP = () => setPip(false);
	const handlePause = () => {
		console.log("onpause serverTimeOffset: ", serverTimeOffset);
		setPlaying(false);
	};
	// const handleSeekMouseDown = () => setSeeking(true);
	// const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
	// 	console.log("onSeekChange: ", e.target.value);
	// 	setProgress(parseFloat(e.target.value));
	// };

	// const handleSeekMouseUp = (
	// 	e: React.MouseEvent<HTMLInputElement, MouseEvent>,
	// ) => {
	// 	setSeeking(false);
	// 	playerRef.current?.seekTo(Number.parseFloat(e.currentTarget.value));
	// };

	const handleProgress = (state: { played: number }) => {
		const currentProgress = state.played;

		setProgress(currentProgress);

		// if (Math.abs(currentProgress - previousProgress.current) > 5) {
		// 	setProgress(currentProgress);
		// 	previousProgress.current = currentProgress;
		// }
	};

	const handleEnded = () => setPlaying(loop);
	const handleDuration = (duration: number) => setDuration(duration);
	const renderLoadButton = (url: string, label: string) => (
		<button onClick={() => load(url)}>{label}</button>
	);

	return (
		<div
			style={{
				transform: !open
					? `translate(0px, -${containerRef.current?.offsetHeight}px)`
					: "translate(0px, 0px)",
				transition: "transform .5s cubic-bezier(.32, .72, 0, 1)",
			}}
		>
			<div ref={containerRef} className={cn("w-full bg-red-800")}>
				<div className="relative pt-[56.25%]">
					<ReactPlayer
						ref={pRef}
						className="absolute top-0 left-0"
						width="100%"
						height="100%"
						url={url}
						pip={pip}
						playing={playing}
						loop={loop}
						playbackRate={playbackRate}
						volume={volume}
						muted={muted}
						progressInterval={1000}
						onReady={() => {
							setPlayerRef(pRef);
							setPlaying(true);
							console.log("onReady");
						}}
						onStart={() => console.log("onStart")}
						onPlay={() => {
							console.log("onplay serverTimeOffset: ", serverTimeOffset);
							setPlaying(true);
						}}
						onPause={() => {
							console.log("onpause serverTimeOffset: ", serverTimeOffset);
							setPlaying(false);
						}}
						onBuffer={() => console.log("onBuffer")}
						onPlaybackRateChange={(speed: string) => {
							console.log("onPlaybackRateChange", speed);
							setPlaybackRate(Number.parseFloat(speed));
						}}
						onSeek={(e) => console.log("onSeek", e)}
						onEnded={() => setPlaying(loop)}
						onError={(e) => console.log("onError", e)}
						onProgress={(state) => {
							const currentProgress = state.played;

							setProgress(currentProgress);

							// if (Math.abs(currentProgress - previousProgress.current) > 5) {
							// 	setProgress(currentProgress);
							// 	previousProgress.current = currentProgress;
							// }
						}}
						onDuration={(duration: number) => setDuration(duration)}
						config={{ youtube: { playerVars: { controls: 1 } } }}
					/>
				</div>
			</div>
			{screen === "mobile" && (
				<>
					{open && (
						<div
							onClick={() => setOpen(false)}
							className="mx-auto flex h-[20px] w-12 cursor-pointer items-center justify-center rounded-b-xl bg-gray-600/50"
						>
							<TiArrowSortedUp />
						</div>
					)}
					{!open && (
						<div
							onClick={() => setOpen(true)}
							className="mx-auto flex h-[20px] w-12 cursor-pointer items-center justify-center rounded-b-xl bg-gray-600/50"
						>
							<TiArrowSortedDown />
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default VideoPlayer;
