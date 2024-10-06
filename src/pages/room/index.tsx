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
import { useEffect, useMemo, useRef } from "react";
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
// const RoomLoading = () => {
// 	const { loading, } = useRoomStore((s) => ({ loading: s.loading, }));
// 	return loading ? (
// 		<div className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black/40 backdrop-blur-sm"></div>
// 	) : (
// 		null
// 	);
// };
const RoomPage = () => {
	const navigate = useNavigate();
	const { id } = useParams();
	const kickDialogRef = useRef<HTMLButtonElement | null>(null);

	console.log("[Room] render");
	console.log("[Room] id: ", id);
	// const {
	// 	data: room,
	// 	isLoading: isRoomLoading,
	// 	error: roomError,
	// } = useGetRoom();
	// console.log("[Room] room: ", room, isRoomLoading);

	const { width } = useWindowSize();
	const { isFullscreen, exitFullscreen } = useFullscreen();

	const { connected, setConnected } = useGlobalStore((s) => ({
		connected: s.connected,
		setConnected: s.setConnected,
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
	}));
	const {
		setPlayerType,
		setUrl,
		serverTimeOffset,
		setServerTimeOffset,
		setDuration,
		setProgress,
		setPlaying,
		playerRef,
		initialSync,
		setInitialSync,
	} = usePlayerStore((s) => ({
		setPlayerType: s.setPlayerType,
		setUrl: s.setUrl,
		serverTimeOffset: s.serverTimeOffset,
		setServerTimeOffset: s.setServerTimeOffset,
		setDuration: s.setDuration,
		setProgress: s.setProgress,
		setPlaying: s.setPlaying,
		playerRef: s.playerRef,
		initialSync: s.initialSync,
		setInitialSync: s.setInitialSync,
	}));

	console.log("[Room] roomData: ", roomData);

	// useEffect(() => {
	//   console.log("[Room] loading effect");
	//   refetchRoom();
	//   async function fetchRoom() {
	//     if (roomData) {
	//       await refetchRoom();
	//     }
	//   }
	//   fetchRoom();
	// }, []);

	useEffect(() => {
		console.log("[Room] once effect");
		setInitialSync(false);
		const token = localStorage.getItem("auth_token");
		console.log("[Room] token: ", token);
		socket.io.opts.query = { token };

		socket.connect();

		function onConnect() {
			console.log("[socket connect] connected");
			socket.emit("joinRoom", id!);
			socket.emit("sendSyncTimer");
			socket.emit("sendSyncPlayerStats");
			setConnected(true);
			setLoading(false);
		}

		function onDisconnect() {
			console.log("[socket disconnect] disconnected");
			// setRoomData(null);
			// setMessages([]);
			setConnected(false);
			setLoading(false);
		}

		function onStateError(err: string) {
			console.log("[socket stateError] stateError: ", err);
			toast.error(err);
			setConnected(false);
			// navigate("/home");
		}

		function onRoomDesc(data: Room) {
			const mics = data.activeMembersList?.pop();
			const url = data.videoUrl;
			setUrl(url);
			setMics(mics!);
			setRoomData(data);
		}

		function onConnectError(err: Error) {
			console.log("[socket connect_error] connect_error: ", err);
			toast.error(err.message);
			setConnected(false);
			// navigate("/home");
		}
		function onActiveMemberListUpdate(data: string[]) {
			console.log(
				"[socket onActiveMemberListUpdate] onActiveMemberListUpdate: ",
				data,
			);
			const mics = data.pop();
			setMics(mics!);
			updateActiveMembersList(data);
		}
		function onMessage(data: Message) {
			addMessage(data);
			console.log("[socket message] message: ", data);
		}
		function onGotKicked(data: string) {
			kickDialogRef.current?.click();
		}

		function onSyncPlayerStats(data: number[]) {
			setPlayerStats(data);
			const [duration, progress, lastChanged, status, type] = data;
			const serverTime = getDateInSeconds() + serverTimeOffset;
			setPlaying(status === 1);
			setProgress(serverTime - lastChanged + progress);
			setDuration(duration);
			setPlayerType(type);
			console.log("[socket onSyncPlayerStats] onSyncPlayerStats: ", data);
		}

		function onSyncTimer(data: number) {
			setServerTimeOffset(getDateInSeconds() - data);
			console.log("[socket onSyncTimer] onSyncTimer: ", data);
		}

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
		return () => {
			socket.off("connect", onConnect);
			socket.off("disconnect", onDisconnect);
			socket.off("activeMemberListUpdate", onActiveMemberListUpdate);
			socket.off("roomDesc", onRoomDesc);
			socket.off("stateError", onStateError);
			socket.off("connect_error", onConnectError);
			socket.off("message", onMessage);
			socket.off("onKicked", onGotKicked);
			if (isFullscreen) {
				exitFullscreen();
			}
		};
	}, []);

	useEffect(() => {
		if (initialSync) return;
		if (!roomData) return;
		if (!roomData.playerStats) return;
		const [duration, progress, lastChanged, status, type] =
			roomData.playerStats;
		const serverTime = getDateInSeconds() + serverTimeOffset;
		setProgress(serverTime - lastChanged + progress);
		if (playerRef?.current) {
			setInitialSync(true);
			playerRef.current.seekTo(serverTime - lastChanged + progress, "seconds");
		}
	}, [playerRef]);

	// mobile videoplayer height 33svh
	// desktop chat width 30svw
	// turn to ssvh if caused issue on mobile
	const mobileView = width <= screenBreakpoints.md;
	const MobileChat = useMemo(
		() => <Chat screen={"mobile"} />,
		[messages.length],
	);
	const DesktopChat = useMemo(
		() => <Chat screen={"desktop"} />,
		[messages.length],
	);

	if (!id) {
		return <Navigate to="/home" />;
	}
	// if (roomError) {
	// 	toast.error(roomError.message);
	// 	return <Navigate to="/home" />;
	// }

	if (!roomData) {
		// setLoading(true);
		return <></>;
	}
	// if (!connected) {
	//   socket.connect();
	// }

	function onLeaveRoom() {
		socket.emit("leaveRoom");
		setConnected(false);
		setRoomData(null);
		setMessages([]);
		setMutedMembers([]);
		setLoading(false);
		socket.disconnect();
		navigate("/home");
	}

	return (
		<>
			{loading && (
				<div className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black/40 backdrop-blur-sm">
					<Spinner />
				</div>
			)}
			<ConnectionStatus />
			{mobileView ? (
				<div>
					<div className="h-[100svh]">{MobileChat}</div>

					<div className="fixed top-[40px] w-full">
						<VideoPlayer screen={"mobile"} />
					</div>
					<div className="fixed top-0 h-[40px] w-full border-muted border-b bg-primary-foreground">
						<RoomButtons
							kickDialogRef={kickDialogRef}
							onLeaveRoom={onLeaveRoom}
						/>
					</div>
				</div>
			) : (
				<div className="flex">
					<div className="w-[70svw]">
						<VideoPlayer screen={"desktop"} />
					</div>
					<div className="w-[30svw]">
						<div className=" h-[5svh]">
							<RoomButtons
								kickDialogRef={kickDialogRef}
								onLeaveRoom={onLeaveRoom}
							/>
						</div>
						<div className="h-[95svh]">{DesktopChat}</div>
					</div>
				</div>
			)}
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
	const { isFullscreen, enterFullscreen, exitFullscreen } = useFullscreen();
	return (
		<>
			<KickDialogBox kickDialogRef={kickDialogRef} />
			<div className="flex items-center justify-between px-2">
				<Button variant={"ghost"} onClick={() => onLeaveRoom()}>
					<HiMiniXMark className="size-7" />
				</Button>
				<RoomSettingsDrawer />
				<TextGradient
					onClick={isFullscreen ? exitFullscreen : enterFullscreen}
					className="cursor-pointer text-2xl md:text-xl"
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
