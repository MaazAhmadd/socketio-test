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
import { useGlobalStore, useRoomStore } from "@/store";
import { useEffect, useRef } from "react";
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
	const { exitFullscreen } = useFullscreen();

	const { setConnected } = useGlobalStore((s) => ({
		setConnected: s.setConnected,
	}));

	const {
		roomData,
		setRoomData,
		updateActiveMembersList,
		addMessage,
		setMessages,
		setMutedMembers,
		setMics,
	} = useRoomStore((s) => ({
		roomData: s.roomData,
		setRoomData: s.setRoomData,
		updateActiveMembersList: s.updateActiveMembersList,
		addMessage: s.addMessage,
		setMessages: s.setMessages,
		setMutedMembers: s.setMutedMembers,
		setMics: s.setMics,
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
		const token = localStorage.getItem("auth_token");
		console.log("[Room] token: ", token);
		socket.io.opts.query = { token };

		socket.connect();

		function onConnect() {
			console.log("[socket connect] connected");
			socket.emit("joinRoom", id!);
			setConnected(true);
		}

		function onDisconnect() {
			console.log("[socket disconnect] disconnected");
			// setRoomData(null);
			// setMessages([]);
			setConnected(false);
		}

		function onStateError(err: string) {
			console.log("[socket stateError] stateError: ", err);
			toast.error(err);
			setConnected(false);
			// navigate("/home");
		}

		function onRoomDesc(data: Room) {
			console.log("[socket roomDesc] roomDesc before pop: ", data);
			const mics = data.activeMembersList?.pop();
			console.log(
				"[socket roomDesc] roomDesc after pop: ",
				data,
				"mics: ",
				mics,
			);
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

		socket.on("connect", onConnect);
		socket.on("disconnect", onDisconnect);
		socket.on("activeMemberListUpdate", onActiveMemberListUpdate);
		socket.on("roomDesc", onRoomDesc);
		socket.on("stateError", onStateError);
		socket.on("connect_error", onConnectError);
		socket.on("message", onMessage);
		socket.on("onKicked", onGotKicked);

		return () => {
			socket.off("connect", onConnect);
			socket.off("disconnect", onDisconnect);
			socket.off("activeMemberListUpdate", onActiveMemberListUpdate);
			socket.off("roomDesc", onRoomDesc);
			socket.off("stateError", onStateError);
			socket.off("connect_error", onConnectError);
			socket.off("message", onMessage);
			socket.off("onKicked", onGotKicked);
			exitFullscreen();
		};
	}, []);

	if (!id) {
		return <Navigate to="/home" />;
	}
	// if (roomError) {
	// 	toast.error(roomError.message);
	// 	return <Navigate to="/home" />;
	// }

	if (!roomData) {
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
		socket.disconnect();
		navigate("/home");
	}

	// mobile videoplayer height 33vh
	// desktop chat width 30vw
	// turn to svh if caused issue on mobile
	const mobileView = width <= screenBreakpoints.md;
	return (
		<>
			<ConnectionStatus />
			{mobileView ? (
				<div>
					<div className="h-[5vh]">
						<RoomButtons
							kickDialogRef={kickDialogRef}
							onLeaveRoom={onLeaveRoom}
						/>
					</div>
					<div className="h-[33vh] bg-red-800">videoplayer</div>
					<div className="h-[62vh]">
						<Chat screen={"mobile"} />
					</div>
				</div>
			) : (
				<div className="flex">
					<div className="w-[70vw]">
						<div className="h-[80vh] bg-red-800">videoplayer</div>
					</div>
					<div className="w-[30vw]">
						<div className=" h-[5vh]">
							<RoomButtons
								kickDialogRef={kickDialogRef}
								onLeaveRoom={onLeaveRoom}
							/>
						</div>
						<div className="h-[95vh]">
							<Chat screen={"desktop"} />
						</div>
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
			<div className="flex h-[5vh] items-center justify-between px-2">
				<Button variant={"destructive"} onClick={() => onLeaveRoom()}>
					Leave
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
