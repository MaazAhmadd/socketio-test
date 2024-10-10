import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { GearIcon } from "@radix-ui/react-icons";
import { Switch } from "@/components/ui/switch";
import { usePlayerStore, useRoomStore } from "@/store";
import React from "react";
import ReactPlayer from "react-player";
import { socket } from "@/socket";
import { useGetCurrentUser } from "@/hooks/user-hooks";

export function RoomSettingsDrawer() {
	const {
		url,
		controls,
		volume,
		manualSync,
		setUrl,
		setControls,
		setVolume,
		setInitialSync,
		setManualSync,
	} = usePlayerStore((s) => ({
		url: s.url,
		controls: s.controls,
		volume: s.volume,
		manualSync: s.manualSync,
		setUrl: s.setUrl,
		setControls: s.setControls,
		setVolume: s.setVolume,
		setInitialSync: s.setInitialSync,
		setManualSync: s.setManualSync,
	}));
	const load = (newUrl: string | undefined) => {
		setUrl(newUrl);
		setInitialSync(false);
	};
	const handleToggleControls = () => {
		const currentUrl = url;
		setControls(!controls);
		setUrl(undefined);
		setTimeout(() => load(currentUrl), 0);
	};
	return (
		<Drawer direction="top">
			<DrawerTrigger asChild>
				<Button variant="ghost" size={"sm"}>
					<GearIcon />
				</Button>
			</DrawerTrigger>
			<DrawerContent className="right-0 mt-0 mb-24 flex h-min max-h-[50svh] w-[100svw] flex-col bg-background/80 md:w-[30svw]">
				{/* horizontal */}
				{/* <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted " /> */}
				{/* vertical */}
				<div className="">
					<DrawerHeader className="h-[7svh] py-0">
						<DrawerTitle className="my-2 text-center text-xl md:text-2xl">
							Settings
						</DrawerTitle>
					</DrawerHeader>
					<div className="flex w-[85svw] flex-col gap-2 rounded-md bg-muted/40 px-8 py-4 md:w-[28svw]">
						<div className="flex items-center justify-between">
							<DrawerDescription>Room Privacy:</DrawerDescription>
							<SelectRoomPrivacy />
						</div>
						<div className="flex items-center justify-between">
							<DrawerDescription>Playback:</DrawerDescription>
							<SelectPlayback />
						</div>
						<div className="flex items-center justify-between">
							<DrawerDescription>Microphone:</DrawerDescription>
							<SelectMicrophone />
						</div>
						<div className="flex items-center justify-between">
							<DrawerDescription>Controls</DrawerDescription>
							<Switch
								checked={controls}
								onCheckedChange={(e) => {
									handleToggleControls();
									// socket.emit("sendSyncPlayerStats");
								}}
							/>
						</div>
						<div className="flex items-center justify-between">
							<DrawerDescription>Auto Sync</DrawerDescription>
							<Switch
								checked={!manualSync}
								onCheckedChange={(e) => {
									setManualSync(!manualSync);
								}}
							/>
						</div>
						<div className="flex items-center justify-between">
							<DrawerDescription>Video Volume:</DrawerDescription>
							<Slider
								defaultValue={[1]}
								max={1}
								step={0.01}
								className={cn("w-[60%]")}
								value={[volume]}
								onValueChange={(e) => {
									setVolume(e[0]);
								}}
							/>
						</div>
						<div className="flex items-center justify-between">
							<DrawerDescription>Speaker Volume:</DrawerDescription>
							<Slider
								defaultValue={[100]}
								max={100}
								step={1}
								className={cn("w-[60%]")}
							/>
						</div>
					</div>
				</div>
				<div className="flex w-full items-center justify-between ">
					<div></div>
					<div className="mx-auto mt-4 mb-2 h-2 w-[100px] rounded-full bg-muted" />
				</div>
			</DrawerContent>
		</Drawer>
	);
}

const SelectRoomPrivacy = () => {
	// type, 0 = privacy, 1 = playback, 2 = roomMic
	// privacy: number; // public(0), private(1), friends(2)
	// playback: number; // voting(0), justPlay(1), autoPlay(2), leaderChoice(3)
	// roomMic: number; // on(1), off(0)
	const _map = ["public", "private", "friends"];
	const { roomSettings, roomData, setRoomSettings } = useRoomStore((s) => ({
		roomSettings: [
			s.roomData!.privacy,
			s.roomData!.playback,
			s.roomData!.roomMic,
		],
		roomData: s.roomData,
		setRoomSettings: s.setRoomSettings,
	}));
	const { data: currentUser } = useGetCurrentUser();
	if (!roomData) return null;

	return (
		<Select
			disabled={currentUser?._id !== roomData.activeMembersList![0]}
			defaultValue="public"
			value={_map[roomSettings[0]]}
			onValueChange={(value) => {
				const update = _map.indexOf(value);
				setRoomSettings([update, roomSettings[1], roomSettings[2]]);
				socket.emit("updateRoomSettings", [0, update]);
			}}
		>
			<SelectTrigger className="w-min">
				<SelectValue placeholder="Select privacy" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectItem value="public">Public</SelectItem>
					<SelectItem value="private">Private</SelectItem>
					<SelectItem value="friends">Friends</SelectItem>
				</SelectGroup>
			</SelectContent>
		</Select>
	);
};

const SelectPlayback = () => {
	// playback: number; // voting(0), justPlay(1), autoPlay(2), leaderChoice(3)
	const _playbackMap = ["voting", "justplay", "autoplay", "leaderschoice"];
	const { roomSettings, roomData, setRoomSettings } = useRoomStore((s) => ({
		roomSettings: [
			s.roomData!.privacy,
			s.roomData!.playback,
			s.roomData!.roomMic,
		],
		roomData: s.roomData,
		setRoomSettings: s.setRoomSettings,
	}));
	const { data: currentUser } = useGetCurrentUser();
	if (!roomData) return null;

	return (
		<Select
			disabled={currentUser?._id !== roomData.activeMembersList![0]}
			defaultValue="voting"
			value={_playbackMap[roomSettings[1]]}
			onValueChange={(value) => {
				const update = _playbackMap.indexOf(value);
				setRoomSettings([roomSettings[0], update, roomSettings[2]]);
				socket.emit("updateRoomSettings", [1, update]);
			}}
		>
			<SelectTrigger className="w-min">
				<SelectValue placeholder="Select Playback" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectItem value="voting">Voting</SelectItem>
					<SelectItem value="justplay">Just Play</SelectItem>
					<SelectItem value="autoplay">Autoplay</SelectItem>
					<SelectItem value="leaderschoice">Leader's choice</SelectItem>
				</SelectGroup>
			</SelectContent>
		</Select>
	);
};

const SelectMicrophone = () => {
	// roomMic: number; // on(1), off(0)
	const _micMap = ["disabled", "enabled"];
	const { roomSettings, roomData, setRoomSettings } = useRoomStore((s) => ({
		roomSettings: [
			s.roomData!.privacy,
			s.roomData!.playback,
			s.roomData!.roomMic,
		],
		roomData: s.roomData,
		setRoomSettings: s.setRoomSettings,
	}));
	const { data: currentUser } = useGetCurrentUser();
	if (!roomData) return null;

	return (
		<Select
			disabled={currentUser?._id !== roomData.activeMembersList![0]}
			defaultValue="enabled"
			value={_micMap[roomSettings[2]]}
			onValueChange={(value) => {
				const update = _micMap.indexOf(value);
				setRoomSettings([roomSettings[0], roomSettings[1], update]);
				socket.emit("updateRoomSettings", [2, update]);
			}}
		>
			<SelectTrigger className="w-min">
				<SelectValue placeholder="Select mic" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectItem value="enabled">Enable</SelectItem>
					<SelectItem value="disabled">Disable</SelectItem>
				</SelectGroup>
			</SelectContent>
		</Select>
	);
};

function getDateInSeconds() {
	return Math.floor(Date.now() / 1000);
}
