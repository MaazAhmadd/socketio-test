import MemberIcon from "@/components/common/member-icon";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useGetCurrentUser, useGetNormalUser } from "@/hooks/user-hooks";
import { socket } from "@/socket";
import React, { useState } from "react";
import { BsPersonFillAdd } from "react-icons/bs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { DrawingPinFilledIcon } from "@radix-ui/react-icons";
import { VideoPinCard } from "@/components/common/video-pin-card";
import toast from "react-hot-toast";

const MAX_SELECTIONS = 100;

export function RoomPinDialog() {
	const { data: currentUser } = useGetCurrentUser();
	const id = currentUser?._id || "";
	// const voters: [string, string] = [id, id];
	const voters: [string, string, string, string, string] = [
		"670b608ca7526f111019590d",
		"670b608ba7526f1110195908",
		"670b68e65ea84c258e8afb57",
		"670c65d63f92b274d15d4606",
		"670d63b41b9ece293eb6c9fd",
	];
	const links: [string, string, string, string, string, string, number][] = [
		// const links: [string, string, string, number][] = [
		[...voters, "https://youtu.be/GBh3Pk2ctqY?si=u7sFgMNBhIlgsR_B", 0],
		[...voters, "https://youtu.be/Tqsz6fjvhZM?si=qtQCfrjpOsC3nSVz", 0],
		[...voters, "https://youtu.be/ENhfIeZF_AY?si=M6ImNfc9A9vJr0ZP", 0],
		[...voters, "https://youtu.be/PI5Sv0QNGvM?si=i62syXJ5oEgzGMwd", 0],
		[...voters, "https://youtu.be/nJ4qA-S-KmE?si=4EncFeM-LcNe3BGe", 0],
	];
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="ghost" size={"sm"} className="relative">
					<span className="absolute top-1 right-0 flex size-3 items-center justify-center rounded-full bg-primary text-[8px] text-primary-foreground">
						{links.length}
					</span>
					<DrawingPinFilledIcon className="size-[18px]" />
				</Button>
			</DialogTrigger>
			<DialogContent className="flex h-[max(550px,80svh)] max-w-[min(550px,100svw)] flex-col justify-between p-4">
				<div className="flex flex-col">
					<DialogHeader>
						<DialogTitle className="text-center">Pin Videos</DialogTitle>
					</DialogHeader>
					<DialogDescription className="my-1">
						pinned videos (click to vote)
					</DialogDescription>
					<ScrollArea className="w-[calc(100svw-2rem)] rounded-md border">
						<div className="flex w-max p-1 pb-4">
							{links.map((l) => {
								const vidType = l.pop() as number;
								const src = l.pop() as string;
								return (
									<div key={src} className="shrink-0">
										<VideoPinCard
											vidType={vidType}
											src={src}
											votes={l as string[]}
											onClick={() => {
												toast.success("pin clicked");
											}}
											className="mr-2"
										/>
									</div>
								);
							})}
						</div>
						<ScrollBar orientation="horizontal" />
					</ScrollArea>
					<DialogDescription className="my-1">
						pin a video, you can select different platforms
					</DialogDescription>
				</div>
				<DialogClose asChild>
					<Button className="my-2">Done</Button>
				</DialogClose>
			</DialogContent>
		</Dialog>
	);
}
