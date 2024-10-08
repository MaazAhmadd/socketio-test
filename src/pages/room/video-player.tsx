import { cn } from "@/lib/utils";
import { useGlobalStore, usePlayerStore, useRoomStore } from "@/store";
import React, { useEffect, useRef, useState } from "react";
import { TiArrowSortedUp, TiArrowSortedDown } from "react-icons/ti";
import ReactPlayer from "react-player";
import RoomJoinDialog from "./room-join-dialog";
import { useGetCurrentUser } from "@/hooks/user-hooks";
import { socket } from "@/socket";
import { Button } from "@/components/ui/button";
import { FaForward, FaBackward, FaSyncAlt } from "react-icons/fa";
import { BsPersonFillAdd } from "react-icons/bs";
type Props = {
	screen: "mobile" | "desktop";
	playerRef: React.MutableRefObject<ReactPlayer | null>;
};

const VideoPlayer = React.forwardRef<
	React.ElementRef<typeof ReactPlayer>,
	Props
>(({ screen, playerRef }, ref) => {
	const [open, setOpen] = useState(true);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const roomJoinDialogShown = useGlobalStore((s) => s.roomJoinDialogShown);
	const { currentLeader, playerStats } = useRoomStore((s) => ({
		currentLeader: s.roomData?.activeMembersList![0],
		playerStats: s.roomData?.playerStats,
	}));

	const {
		url,
		pip,
		controls,
		playing,
		loop,
		playbackRate,
		volume,
		muted,
		duration,
		progress,
		serverTimeOffset,
		playerType,
		userIntervention,
		setUrl,
		setPip,
		setControls,
		setPlaying,
		setLoop,
		setPlaybackRate,
		setVolume,
		setMuted,
		setDuration,
		setProgress,
		setServerTimeOffset,
		setPlayerType,
		setUserIntervention,
		isSystemAction,
		setIsSystemAction,
	} = usePlayerStore((s) => ({
		url: s.url,
		pip: s.pip,
		controls: s.controls,
		playing: s.playing,
		loop: s.loop,
		playbackRate: s.playbackRate,
		volume: s.volume,
		muted: s.muted,
		duration: s.duration,
		progress: s.progress,
		serverTimeOffset: s.serverTimeOffset,
		playerType: s.playerType,
		userIntervention: s.userIntervention,
		isSystemAction: s.isSystemAction,
		setUrl: s.setUrl,
		setPip: s.setPip,
		setControls: s.setControls,
		setPlaying: s.setPlaying,
		setLoop: s.setLoop,
		setPlaybackRate: s.setPlaybackRate,
		setVolume: s.setVolume,
		setMuted: s.setMuted,
		setDuration: s.setDuration,
		setProgress: s.setProgress,
		setServerTimeOffset: s.setServerTimeOffset,
		setPlayerType: s.setPlayerType,
		setUserIntervention: s.setUserIntervention,
		setIsSystemAction: s.setIsSystemAction,
	}));
	const { data: currentUser } = useGetCurrentUser();

	// const load = (url: string) => {
	// 	setUrl(url);
	// 	setProgress(0);
	// 	setPip(false);
	// };

	// const handlePlayPause = () => setPlaying(!playing);
	// const handleToggleLoop = () => setLoop(!loop);

	// const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
	// 	setVolume(Number.parseFloat(e.target.value));
	// };
	// const handleToggleMuted = () => setMuted(!muted);

	// const handleSetPlaybackRate = (e: React.MouseEvent<HTMLButtonElement>) => {
	// 	setPlaybackRate(Number.parseFloat(e.currentTarget.value));
	// };

	// const handleTogglePIP = () => setPip((prev) => !prev);
	// const handlePlay = () => {
	// 	console.log("onplay serverTimeOffset: ", serverTimeOffset);
	// 	setPlaying(true);
	// };
	// const handleEnablePIP = () => setPip(true);
	// const handleDisablePIP = () => setPip(false);

	// const handlePause = () => {
	// 	console.log("onpause serverTimeOffset: ", serverTimeOffset);
	// 	setPlaying(false);
	// };

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

	// const handleProgress = (state: { played: number }) => {
	// 	const currentProgress = state.played;

	// 	setProgress(currentProgress);

	// if (Math.abs(currentProgress - previousProgress.current) > 5) {
	// 	setProgress(currentProgress);
	// 	previousProgress.current = currentProgress;
	// }
	// };

	// const handleEnded = () => setPlaying(loop);
	// const handleDuration = (duration: number) => setDuration(duration);
	// const renderLoadButton = (url: string, label: string) => (
	// 	<button onClick={() => load(url)}>{label}</button>
	// );

	// TODO: player is paused when seeked, wait for 1.1 seconds and then pause otherwise seek
	// TODO: add fullscreen capabilities (add a button) -> screenfull.request(document.querySelector('.react-player'))
// TODO: add message to local then emit to server

	function syncPlayer() {
		if (!playerStats) return;
		setUserIntervention(false);
		setPlaybackRate(1);
		const [duration, progress, lastChanged, status, type] = playerStats;
		const serverTime = getDateInSeconds() + serverTimeOffset;
		const toProgress =
			status === 1 ? serverTime - lastChanged + progress : progress;
		setPlaying(status === 1);
		setProgress(toProgress);
		playerRef.current?.seekTo(toProgress, "seconds");
	}

	return (
		<>
			<RoomJoinDialog />
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
						{!roomJoinDialogShown && (
							<ReactPlayer
								ref={ref}
								className="absolute top-0 left-0"
								width="100%"
								height="100%"
								url={url}
								pip={pip}
								controls={controls}
								playing={playing}
								loop={loop}
								playbackRate={playbackRate}
								volume={volume}
								muted={muted}
								progressInterval={750}
								onReady={() => {
									console.log("[VideoPlayer] onReady");
								}}
								onStart={() => console.log("[VideoPlayer] onStart")}
								onPlay={() => {
									if (playing) return;
									console.log(
										"[VideoPlayer] onplay serverTimeOffset: ",
										serverTimeOffset,
									);
									if (currentUser?._id === currentLeader) {
										socket.emit("playPauseVideo", 1);
										setPlaying(true);
									} else {
										if (!isSystemAction) {
											setIsSystemAction(false);
										}
										setUserIntervention(true);
										setPlaying(true);
									}
								}}
								onPause={() => {
									if (!playing) return;
									console.log(
										"[VideoPlayer] onpause serverTimeOffset: ",
										serverTimeOffset,
									);
									if (currentUser?._id === currentLeader) {
										socket.emit("playPauseVideo", 0);
										setPlaying(false);
									} else {
										if (!isSystemAction) {
											setIsSystemAction(false);
										}
										setUserIntervention(true);
										setPlaying(false);
									}
								}}
								onBuffer={() => console.log("[VideoPlayer] onBuffer")}
								onPlaybackRateChange={(speed: string) => {
									console.log("[VideoPlayer] onPlaybackRateChange", speed);
									setUserIntervention(true);
									setPlaybackRate(Number.parseFloat(speed));
								}}
								onSeek={(e) => console.log("[VideoPlayer] onSeek", e)}
								onEnded={() => setPlaying(loop)}
								onError={(e) => console.log("[VideoPlayer] onError", e)}
								onProgress={(state) => {
									const currentProgress = state.playedSeconds;
									// console.log(
									// 	"[VideoPlayer] onProgress currentProgress, previousProgress, diff",
									// 	currentProgress,
									// 	progress,
									// 	Math.abs(currentProgress - progress),
									// );
									// if (!isSystemAction) {
									// 	setIsSystemAction(false);
									// 	setProgress(currentProgress);
									// 	return;
									// }

									if (Math.abs(currentProgress - progress) > 2) {
										if (currentUser?._id === currentLeader) {
											console.log(
												"[VideoPlayer] onProgress sending seek to server: ",
												Math.floor(currentProgress),
											);
											socket.emit("seekVideo", Math.floor(currentProgress));
											setIsSystemAction(false);
											// setProgress(currentProgress);
										} else {
											setUserIntervention(true);
											// setProgress(currentProgress);
										}
									}
									setProgress(currentProgress);
								}}
								onDuration={(duration: number) => {
									console.log("[VideoPlayer] onDuration", duration);
									setDuration(duration);
								}}
								config={{
									youtube: { playerVars: { /*controls: 1,*/ autoplay: 1 } },
								}}
							/>
						)}
					</div>
				</div>

				<div
					className={cn(
						"mx-auto mt-2 flex h-[24px] w-full max-w-[min(400px,90vw)] items-center justify-between rounded-b-xl bg-transparent",
					)}
				>
					<Button
						variant={"ghost"}
						onClick={() => {
							const toProgress = progress - 10 < 0 ? 0 : progress - 10;
							if (currentUser?._id === currentLeader) {
								socket.emit("seekVideo", Math.floor(toProgress));
							} else {
								setUserIntervention(true);
								playerRef.current?.seekTo(Math.floor(toProgress), "seconds");
							}
							setProgress(toProgress);
						}}
					>
						<FaBackward />
					</Button>
					<Button
						onClick={syncPlayer}
						variant={"ghost"}
						disabled={!userIntervention}
						className={cn(
							userIntervention ? "text-primary" : "text-muted-foreground",
						)}
					>
						<FaSyncAlt />
					</Button>

					<Button
						size={"sm"}
						className="h-6 w-10"
						variant={"secondary"}
						onClick={() => setOpen(!open)}
					>
						{open ? <TiArrowSortedUp /> : <TiArrowSortedDown />}
					</Button>
					<Button variant={"ghost"}>
						<BsPersonFillAdd />
					</Button>
					<Button
						variant={"ghost"}
						onClick={() => {
							const toProgress =
								progress + 10 > duration ? duration : progress + 10;
							if (currentUser?._id === currentLeader) {
								socket.emit("seekVideo", Math.floor(toProgress));
							} else {
								setUserIntervention(true);
								playerRef.current?.seekTo(Math.floor(toProgress), "seconds");
							}
							setProgress(toProgress);
						}}
					>
						<FaForward />
					</Button>
				</div>
			</div>
		</>
	);
});

export default VideoPlayer;

function getDateInSeconds() {
	return Math.floor(Date.now() / 1000);
}
