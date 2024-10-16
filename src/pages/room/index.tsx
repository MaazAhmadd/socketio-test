import ConnectionStatus from "@/components/common/connection-status";
import { TextGradient } from "@/components/common/text-gradient";
import { Button } from "@/components/ui/button";
import { useGetRoom } from "@/hooks/room-hooks";
import {
	useWindowSize,
	useFullscreen,
	screenBreakpoints,
} from "@/hooks/util-hooks";
import { socket } from "@/socket";
import { useGlobalStore, usePlayerStore, useRoomStore } from "@/store";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Message, Room } from "server/src/types";
import { Chat } from "./chat";
import { RoomMembersDrawer } from "./room-members-drawer";
import { RoomPinDialog } from "./room-pin-dialog";
import { RoomSettingsDrawer } from "./room-settings-drawer";
import {
	Dialog,
	DialogContent,
	DialogOverlay,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import VideoPlayer from "./video-player";
import { HiMiniXMark } from "react-icons/hi2";
import { Spinner } from "@/components/common/spinner";
import ReactPlayer from "react-player";
import { useGetCurrentUser } from "@/hooks/user-hooks";
import { cn } from "@/lib/utils";
const RoomLoading = () => {
	return (
		<div className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black/40 backdrop-blur-sm">
			<Spinner />
		</div>
	);
};
// const RoomPage = () => {
// 	const { data: currentUser } = useGetCurrentUser();
// 	if (!currentUser) {
// 		return <RoomLoading />;
// 	}
// 	return <RoomComponent />;
// };

const RoomPage = () => {
	const [timeReceivedDelay, setTimeReceivedDelay] = useState(0);
	const navigate = useNavigate();
	const { id } = useParams();
	const kickDialogRef = useRef<HTMLButtonElement | null>(null);
	const playerRef = useRef<ReactPlayer | null>(null);
	const { exitFullscreen } = useFullscreen();
	const { data: currentUser } = useGetCurrentUser();

	const { setConnected, setRoomJoinDialogShown, isFullscreen, keyboardHeight } =
		useGlobalStore((s) => ({
			setConnected: s.setConnected,
			setRoomJoinDialogShown: s.setRoomJoinDialogShown,
			isFullscreen: s.isFullscreen,
			keyboardHeight: s.keyboardHeight,
		}));

	const {
		roomData,
		setRoomData,
		updateActiveMembersList,
		addMessage,
		messages,
		setMessages,
		setMutedMembers,
		setMics,
		loading,
		setLoading,
		setPlayerStats,
		setRoomSettings,
		resetRoomState,
	} = useRoomStore((s) => ({
		roomData: s.roomData,
		setRoomData: s.setRoomData,
		updateActiveMembersList: s.updateActiveMembersList,
		addMessage: s.addMessage,
		messages: s.messages,
		setMessages: s.setMessages,
		setMutedMembers: s.setMutedMembers,
		setMics: s.setMics,
		loading: s.loading,
		setLoading: s.setLoading,
		setPlayerStats: s.setPlayerStats,
		setRoomSettings: s.setRoomSettings,
		resetRoomState: s.resetRoomState,
	}));
	const {
		url,
		playing,
		playbackRate,
		progress,
		serverTimeOffset,
		initialSync,
		setPlayerType,
		setUrl,
		setServerTimeOffset,
		setDuration,
		setProgress,
		setPlaying,
		setInitialSync,
		setUserIntervention,
		setIsSystemAction,
		setPlaybackRate,
		setControls,
		resetPlayerState,
	} = usePlayerStore((s) => ({
		url: s.url,
		playing: s.playing,
		playbackRate: s.playbackRate,
		progress: s.progress,
		serverTimeOffset: s.serverTimeOffset,
		initialSync: s.initialSync,
		setPlayerType: s.setPlayerType,
		setUrl: s.setUrl,
		setServerTimeOffset: s.setServerTimeOffset,
		setDuration: s.setDuration,
		setProgress: s.setProgress,
		setPlaying: s.setPlaying,
		setInitialSync: s.setInitialSync,
		setUserIntervention: s.setUserIntervention,
		setIsSystemAction: s.setIsSystemAction,
		setPlaybackRate: s.setPlaybackRate,
		setControls: s.setControls,
		resetPlayerState: s.resetPlayerState,
	}));

	const load = (newUrl: string | undefined) => {
		setUrl(newUrl);
		setInitialSync(false);
	};

	function onConnect() {
		// console.log("[socket connect] connected");
		socket.emit("joinRoom", id!);
		socket.emit("sendSyncTimer");
		setTimeReceivedDelay(getDateInSeconds());
		// socket.emit("sendSyncPlayerStats");
		setConnected(true);
		setLoading(false);
	}

	function onDisconnect() {
		// console.log("[socket disconnect] disconnected");
		// setRoomData(null);
		// setMessages([]);
		setInitialSync(false);
		setConnected(false);
		setLoading(false);
	}

	function onLeaveRoom() {
		socket.emit("leaveRoom");
		socket.disconnect();
		navigate("/home");
		setConnected(false);
		setRoomJoinDialogShown(true);
		resetRoomState();
		resetPlayerState();
	}

	function onStateError(err: string) {
		// console.log("[socket stateError] stateError: ", err);
		toast.error(err);
		setConnected(false);
		// navigate("/home");
	}

	function onRoomDesc(data: Room) {
		// console.log("[socket onRoomDesc] onRoomDesc: ", data);

		const mics = data.activeMembersList?.pop();
		const url = data.videoUrl;
		const isLeader = currentUser?._id === data.activeMembersList![0];
		setControls(isLeader);
		setUrl(url);
		setMics(mics!);
		setRoomData(data);
		if (isLeader) {
			const currentUrl = url;
			setUrl(undefined);
			setTimeout(() => load(currentUrl), 0);
		}
	}

	function onConnectError(err: Error) {
		// console.log("[socket connect_error] connect_error: ", err);
		toast.error("connect_error: " + err.message);
		setConnected(false);
		// navigate("/home");
	}
	function onActiveMemberListUpdate(data: string[]) {
		// console.log(
		// 	"[socket onActiveMemberListUpdate] onActiveMemberListUpdate: ",
		// 	data,
		// );
		const mics = data.pop();
		setMics(mics!);
		updateActiveMembersList(data);
	}
	function onMessage(data: Message) {
		addMessage(data);
		// console.log("[socket message] message: ", data);
	}
	function onGotKicked(data: string) {
		kickDialogRef.current?.click();
	}

	function onSyncPlayerStats(data: number[]) {
		const userIntervention = usePlayerStore.getState().userIntervention;
		const serverTimeOffset = usePlayerStore.getState().serverTimeOffset;
		setPlayerStats(data);
		if (userIntervention) return;
		const [duration, progress, lastChanged, status, type] = data;
		setIsSystemAction(true);
		// setUrl(roomData?.videoUrl!);
		setDuration(duration);
		setPlayerType(type);
		const serverTime = getDateInSeconds(); // + serverTimeOffset;
		const toProgress =
			status === 1 ? serverTime - lastChanged + progress : progress;
		setPlaybackRate(1);
		setProgress(toProgress);
		setPlaying(status === 1);
		playerRef.current?.seekTo(toProgress, "seconds");
	}

	function onSyncTimer(data: number) {
		setServerTimeOffset(
			getDateInSeconds() -
				(data +
					(timeReceivedDelay > 0 ? getDateInSeconds() - timeReceivedDelay : 0)),
		);
	}
	function onRoomSettings(data: [number, number, number]) {
		setRoomSettings(data);
	}
	// useEffect(() => {
	// 	if (playerRef.current) {
	// 		const internalPlayer = playerRef.current.getInternalPlayer();
	// 		if (internalPlayer) {
	// 			const iframe = internalPlayer.getIframe();
	// 			if (iframe) {
	// 				iframe.addEventListener("dblclick", (e: any) => {
	// 					e.stopPropagation();
	// 					e.preventDefault();
	// 				});
	// 			}
	// 		}
	// 	}
	// }, [playerRef.current]);

	useEffect(() => {
		console.log("[Room] id: ", id);
		setInitialSync(false);
		const token = localStorage.getItem("auth_token");
		socket.io.opts.query = { token };
		socket.connect();
		socket.on("connect", onConnect);
		socket.on("disconnect", onDisconnect);
		socket.on("activeMemberListUpdate", onActiveMemberListUpdate);
		socket.on("roomDesc", onRoomDesc);
		socket.on("stateError", onStateError);
		socket.on("connect_error", onConnectError);
		socket.on("message", onMessage);
		socket.on("onKicked", onGotKicked);
		socket.on("syncPlayerStats", onSyncPlayerStats);
		socket.on("syncTimer", onSyncTimer);
		socket.on("roomSettings", onRoomSettings);
		return () => {
			socket.off("connect", onConnect);
			socket.off("disconnect", onDisconnect);
			socket.off("activeMemberListUpdate", onActiveMemberListUpdate);
			socket.off("roomDesc", onRoomDesc);
			socket.off("stateError", onStateError);
			socket.off("connect_error", onConnectError);
			socket.off("message", onMessage);
			socket.off("onKicked", onGotKicked);
			socket.off("syncPlayerStats", onSyncPlayerStats);
			socket.off("syncTimer", onSyncTimer);
			socket.off("roomSettings", onRoomSettings);
			if (isFullscreen) {
				exitFullscreen();
			}
		};
	}, []);

	useEffect(() => {
		const initialSync = usePlayerStore.getState().initialSync;
		console.log("[useEffect] initialSync: ", initialSync);
		// const userIntervention = usePlayerStore.getState().userIntervention;
		if (initialSync) return;
		// if (userIntervention) return;
		if (!roomData) return;
		if (!roomData.playerStats) return;
		const [duration, progress, lastChanged, status, type] =
			roomData.playerStats;
		setPlaybackRate(1);
		setInitialSync(true);
		setUserIntervention(false);
		setDuration(duration);
		setPlayerType(type);
		setPlaying(status === 1);
		const serverTime = getDateInSeconds() + serverTimeOffset;
		const toProgress =
			status === 1 ? serverTime - lastChanged + progress : progress;
		setProgress(toProgress);
		playerRef.current?.seekTo(toProgress, "seconds");
	}, [playerRef.current, initialSync]);

	// mobile videoplayer height 33svh
	// desktop chat width 30svw
	// turn to ssvh if caused issue on mobile
	// const mobileView = width <= screenBreakpoints.lg;
	const MemoizedChat = useMemo(() => <Chat />, [messages.length]);

	if (!id) {
		return <Navigate to="/home" />;
	}
	if (!currentUser || !roomData) {
		return <RoomLoading />;
	}

	return (
		<>
			{loading && (
				<div className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black/40 backdrop-blur-sm">
					<Spinner />
				</div>
			)}
			<ConnectionStatus />
			<div className="lg:flex lg:flex-row-reverse">
				<div className="w-auto lg:w-[30svw]">
					<div className="h-[100svh]">{MemoizedChat}</div>
					<div
						className={cn(
							"fixed top-0 z-10 flex h-[40px] w-full border-muted border-b bg-primary-foreground lg:h-[45px] lg:w-[30svw]",
							keyboardHeight > 100 && "hidden lg:flex",
						)}
					>
						<RoomButtons
							kickDialogRef={kickDialogRef}
							onLeaveRoom={onLeaveRoom}
						/>
					</div>
				</div>
				<div
					className={cn(
						"fixed top-[40px] w-full lg:static lg:top-0 lg:w-[70svw]",
						keyboardHeight > 100 && "top-0 lg:top-[40px]",
					)}
				>
					<VideoPlayer
						screen={"mobile"}
						ref={playerRef}
						playerRef={playerRef}
					/>
				</div>
			</div>
		</>
	);
};
const RoomButtons = ({
	onLeaveRoom,
	kickDialogRef,
}: {
	onLeaveRoom: () => void;
	kickDialogRef: React.MutableRefObject<HTMLButtonElement | null>;
}) => {
	const isFullscreen = useGlobalStore((s) => s.isFullscreen);
	const { enterFullscreen, exitFullscreen } = useFullscreen();
	return (
		<>
			<KickDialogBox kickDialogRef={kickDialogRef} />
			<div className="my-auto flex w-full items-center justify-between px-2">
				<Button variant={"ghost"} size={"sm"} onClick={() => onLeaveRoom()}>
					<HiMiniXMark className="size-6" />
				</Button>
				<RoomSettingsDrawer />
				<TextGradient
					onClick={isFullscreen ? exitFullscreen : enterFullscreen}
					className="w-full max-w-40 cursor-pointer text-center text-lg"
				>
					Gather Groove
				</TextGradient>
				<RoomPinDialog />
				<RoomMembersDrawer />
			</div>
		</>
	);
};
export default RoomPage;

const KickDialogBox = ({
	kickDialogRef,
}: {
	kickDialogRef: React.MutableRefObject<HTMLButtonElement | null>;
}) => {
	const navigate = useNavigate();
	const { setConnected } = useGlobalStore((s) => ({
		setConnected: s.setConnected,
	}));

	const { setRoomData, setMessages, setMutedMembers } = useRoomStore((s) => ({
		setRoomData: s.setRoomData,
		setMessages: s.setMessages,
		setMutedMembers: s.setMutedMembers,
	}));
	return (
		<Dialog
			onOpenChange={(open) => {
				if (!open) {
					setConnected(false);
					setRoomData(null);
					setMessages([]);
					setMutedMembers([]);
					socket.disconnect();
					navigate("/home");
				}
			}}
		>
			<DialogTrigger asChild>
				<Button
					ref={kickDialogRef}
					variant="outline"
					className="hidden"
				></Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<Label className="font-semibold text-lg">
					You have been kicked out of the room
				</Label>
			</DialogContent>
		</Dialog>
	);
};
function getDateInSeconds() {
	return Math.floor(Date.now() / 1000);
}
