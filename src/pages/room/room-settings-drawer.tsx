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

export function RoomSettingsDrawer() {
	const {
		url,
		controls,
		volume,
		setUrl,
		setControls,
		setVolume,
		setInitialSync,
	} = usePlayerStore((s) => ({
		url: s.url,
		controls: s.controls,
		volume: s.volume,
		setUrl: s.setUrl,
		setControls: s.setControls,
		setVolume: s.setVolume,
		setInitialSync: s.setInitialSync,
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
	return (
		<Select defaultValue="public">
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
	return (
		<Select defaultValue="voting">
			<SelectTrigger className="w-min">
				<SelectValue placeholder="Select Playback" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectItem value="voting">Voting</SelectItem>
					<SelectItem value="autoplay">Autoplay</SelectItem>
					<SelectItem value="justplay">Just Play</SelectItem>
					<SelectItem value="leaderschoice">Leader's choice</SelectItem>
				</SelectGroup>
			</SelectContent>
		</Select>
	);
};

const SelectMicrophone = () => {
	return (
		<Select defaultValue="enabled">
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
