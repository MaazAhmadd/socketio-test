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
import { FaHeart, FaRegHeart } from "react-icons/fa6";
import { IoPlaySkipForward, IoPlaySkipForwardOutline } from "react-icons/io5";
import { RiFullscreenFill, RiFullscreenExitFill } from "react-icons/ri";
import { FaShareAlt } from "react-icons/fa";
import { OnProgressProps } from "react-player/base";
import { RoomInviteDialog } from "./room-invite-dialog";
import screenfull from "screenfull";
import toast from "react-hot-toast";

type Props = {
	screen: "mobile" | "desktop";
	playerRef: React.MutableRefObject<ReactPlayer | null>;
};

const VideoPlayer = React.forwardRef<
	React.ElementRef<typeof ReactPlayer>,
	Props
>(({ screen, playerRef }, ref) => {
	const [isPlayerSyncing, setIsPlayerSyncing] = useState(false);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const { keyboardHeight, roomJoinDialogShown } = useGlobalStore((s) => ({
		keyboardHeight: s.keyboardHeight,
		roomJoinDialogShown: s.roomJoinDialogShown,
	}));
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
		autoSync,
		pauseDelayTimeout,
		playerModalOpen,
		controlsJustChanged,
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
		setAutoSync,
		setPauseDelayTimeout,
		setPlayerModalOpen,
		setControlsJustChanged,
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
		autoSync: s.autoSync,
		pauseDelayTimeout: s.pauseDelayTimeout,
		playerModalOpen: s.playerModalOpen,
		controlsJustChanged: s.controlsJustChanged,
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
		setAutoSync: s.setAutoSync,
		setPauseDelayTimeout: s.setPauseDelayTimeout,
		setPlayerModalOpen: s.setPlayerModalOpen,
		setControlsJustChanged: s.setControlsJustChanged,
	}));
	const { data: currentUser } = useGetCurrentUser();

	// TODO: add fullscreen capabilities (add a button) -> screenfull.request(document.querySelector('.react-player'))

	useEffect(() => {
		if (!autoSync) return;
		if (currentUser?._id === currentLeader) return;
		syncPlayer();
	}, [userIntervention, autoSync]);

	function syncPlayer() {
		if (!playerStats) return;
		setIsPlayerSyncing(true);
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

	function onPlay() {
		if (playing) return;
		if (!autoSync) {
			setPlaying(true);
			return;
		}
		// console.log("[VideoPlayer] onplay serverTimeOffset: ", serverTimeOffset);
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
	}

	function onPause() {
		if (!playing) return;
		if (isPlayerSyncing) {
			setIsPlayerSyncing(false);
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
			return;
		}
		const timerId = setTimeout(() => {
			// console.log("[VideoPlayer] onpause serverTimeOffset: ", serverTimeOffset);
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
		}, 1000);
		setPauseDelayTimeout(timerId);
	}
	function onProgress(state: OnProgressProps) {
		const currentProgress = state.playedSeconds;
		if (controlsJustChanged) {
			setProgress(currentProgress);
			setControlsJustChanged(false);
			return;
		}
		if (!autoSync) {
			setProgress(currentProgress);
			return;
		}
		if (Math.abs(currentProgress - progress) > 5) {
			if (pauseDelayTimeout) {
				clearTimeout(pauseDelayTimeout);
			}
			if (currentUser?._id === currentLeader) {
				socket.emit("seekVideo", Math.floor(currentProgress));
				setIsSystemAction(false);
			} else {
				setUserIntervention(true);
			}
		}
		setProgress(currentProgress);
	}
	const [isFullscreen, setIsFullscreen] = useGlobalStore((s) => [
		s.isFullscreen,
		s.setIsFullscreen,
	]);

	return (
		<>
			<RoomJoinDialog />
			<div
				style={{
					transform: !playerModalOpen
						? `translate(0px, -${containerRef.current?.offsetHeight}px)`
						: "translate(0px, 0px)",
					transition: "transform .5s cubic-bezier(.32, .72, 0, 1)",
				}}
			>
				<div ref={containerRef} className={cn("w-full bg-red-800")}>
					<div className="react-player relative pt-[min(56.25%,100vh)]">
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
								onPlay={onPlay}
								onPause={onPause}
								onBuffer={() => console.log("[VideoPlayer] onBuffer")}
								onPlaybackRateChange={(speed: string) => {
									console.log("[VideoPlayer] onPlaybackRateChange", speed);
									setUserIntervention(true);
									setPlaybackRate(Number.parseFloat(speed));
								}}
								onSeek={(e) => console.log("[VideoPlayer] onSeek", e)}
								onEnded={() => setPlaying(loop)}
								onError={(e) => console.log("[VideoPlayer] onError", e)}
								onProgress={onProgress}
								onDuration={(duration: number) => {
									console.log("[VideoPlayer] onDuration", duration);
									setDuration(duration);
								}}
								config={{
									youtube: {
										playerVars: {
											/*controls: 1,*/ autoplay: 1,
											fs: 0,
											playsinline: 1,
											disablekb: 1,
										},
									},
								}}
							/>
						)}
					</div>
				</div>

				<div
					className={cn(
						"mt-1 flex items-center justify-center rounded-sm bg-background/80 py-1.5",
						keyboardHeight > 100 && "hidden",
					)}
				>
					<div
						className={cn(
							"flex h-[24px] w-full max-w-[min(550px,100vw)] items-center justify-between rounded-b-xl bg-transparent",
						)}
					>
						<Button
							size={screen === "mobile" ? "sm" : "default"}
							variant={"ghost"}
							onClick={() => {}}
						>
							<FaShareAlt />
						</Button>
						<RoomInviteDialog screen={screen} />
						<Button
							variant={"ghost"}
							size={screen === "mobile" ? "sm" : "default"}
						>
							{/* <FaHeart /> */}
							<FaRegHeart />
						</Button>
						<Button
							variant={"ghost"}
							size={screen === "mobile" ? "sm" : "default"}
						>
							{/* <IoPlaySkipForward /> */}
							<IoPlaySkipForwardOutline />
						</Button>
						<Button
							className="h-6 w-10"
							variant={"secondary"}
							onClick={() => setPlayerModalOpen(!playerModalOpen)}
							size={screen === "mobile" ? "sm" : "default"}
						>
							{playerModalOpen ? <TiArrowSortedUp /> : <TiArrowSortedDown />}
						</Button>
						<Button
							onClick={syncPlayer}
							variant={"ghost"}
							disabled={!userIntervention}
							className={cn(
								userIntervention ? "text-primary" : "text-muted-foreground",
							)}
							size={screen === "mobile" ? "sm" : "default"}
						>
							<FaSyncAlt />
						</Button>
						<Button
							variant={"ghost"}
							disabled={!controls}
							size={screen === "mobile" ? "sm" : "default"}
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
							disabled={!controls}
							size={screen === "mobile" ? "sm" : "default"}
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
						<Button
							variant={"ghost"}
							size={screen === "mobile" ? "sm" : "default"}
							onClick={() => {
								// document.querySelector(".react-player")?.requestFullscreen();
								const player = document.querySelector(".react-player");
								if (player) {
									screenfull.request(player);
								}
							}}
						>
							{/* <RiFullscreenExitFill /> */}
							<RiFullscreenFill />
						</Button>
					</div>
				</div>
			</div>
		</>
	);
});

export default VideoPlayer;

function getDateInSeconds() {
	return Math.floor(Date.now() / 1000);
}
