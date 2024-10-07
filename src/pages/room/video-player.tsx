import { cn } from "@/lib/utils";
import { useGlobalStore, usePlayerStore, useRoomStore } from "@/store";
import React, { useEffect, useRef, useState } from "react";
import { TiArrowSortedUp, TiArrowSortedDown } from "react-icons/ti";
import ReactPlayer from "react-player";
import RoomJoinDialog from "./room-join-dialog";
import { useGetCurrentUser } from "@/hooks/user-hooks";
import { socket } from "@/socket";
import { Button } from "@/components/ui/button";

type Props = {
	screen: "mobile" | "desktop";
};

const VideoPlayer = React.forwardRef<
	React.ElementRef<typeof ReactPlayer>,
	Props
>(({ screen }, ref) => {
	const [open, setOpen] = useState(true);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const roomJoinDialogShown = useGlobalStore((s) => s.roomJoinDialogShown);
	const { currentLeader } = useRoomStore((s) => ({
		currentLeader: s.roomData?.activeMembersList![0],
	}));

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
		playerInSync,
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
		setPlayerInSync,
		isSystemAction,
		setIsSystemAction,
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
		playerInSync: s.playerInSync,
		isSystemAction: s.isSystemAction,
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
		setPlayerInSync: s.setPlayerInSync,
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
								playing={playing}
								loop={loop}
								playbackRate={playbackRate}
								volume={volume}
								muted={muted}
								progressInterval={1000}
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
											setPlayerInSync(false);
										}
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
											setPlayerInSync(false);
										}
										setPlaying(false);
									}
								}}
								onBuffer={() => console.log("[VideoPlayer] onBuffer")}
								onPlaybackRateChange={(speed: string) => {
									console.log("[VideoPlayer] onPlaybackRateChange", speed);
									setPlayerInSync(false);
									setPlaybackRate(Number.parseFloat(speed));
								}}
								onSeek={(e) => console.log("[VideoPlayer] onSeek", e)}
								onEnded={() => setPlaying(loop)}
								onError={(e) => console.log("[VideoPlayer] onError", e)}
								onProgress={(state) => {
									const currentProgress = state.playedSeconds;
									// console.log(
									// 	"[VideoPlayer] onProgress currentProgress, previousProgress",
									// 	currentProgress,
									// 	progress,
									// );
									// if (!isSystemAction) {
									// 	setIsSystemAction(false);
									// 	setProgress(currentProgress);
									// 	return;
									// }
									if (Math.abs(currentProgress - progress) > 5) {
										if (currentUser?._id === currentLeader) {
											console.log(
												"[VideoPlayer] onProgress sending seek to server: ",
												Math.floor(currentProgress),
											);
											socket.emit("seekVideo", Math.floor(currentProgress));
											setIsSystemAction(false);
											// setProgress(currentProgress);
										} else {
											setPlayerInSync(false);
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
									youtube: { playerVars: { controls: 1, autoplay: 1 } },
								}}
							/>
						)}
					</div>
				</div>
				{screen === "mobile" && (
					<>
						{open && (
							<div className="mx-auto flex h-[20px] w-20 cursor-pointer items-center justify-center rounded-b-xl bg-gray-600/50">
								{!playerInSync && (
									<Button
										onClick={() => {
											socket.emit("sendSyncPlayerStats");
										}}
										variant={"outline"}
									>
										sync
									</Button>
								)}
								<TiArrowSortedUp onClick={() => setOpen(false)} />
							</div>
						)}
						{!open && (
							<div className="mx-auto flex h-[20px] w-20 cursor-pointer items-center justify-center rounded-b-xl bg-gray-600/50">
								{!playerInSync && (
									<Button
										onClick={() => {
											socket.emit("sendSyncPlayerStats");
										}}
										variant={"outline"}
									>
										sync
									</Button>
								)}
								<TiArrowSortedDown onClick={() => setOpen(true)} />
							</div>
						)}
					</>
				)}
				{screen === "desktop" && !playerInSync && (
					<Button
						onClick={() => {
							socket.emit("sendSyncPlayerStats");
						}}
						variant={"outline"}
					>
						sync
					</Button>
				)}
			</div>
		</>
	);
});

export default VideoPlayer;
