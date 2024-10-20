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
import { ScrollArea } from "@/components/ui/scroll-area";
import { DrawingPinFilledIcon } from "@radix-ui/react-icons";

const MAX_SELECTIONS = 100;

export function RoomPinDialog() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="ghost" size={"sm"} className="relative">
					<span className="absolute top-1 right-0 flex size-3 items-center justify-center rounded-full bg-primary text-[8px] text-primary-foreground">
						2
					</span>
					<DrawingPinFilledIcon className="size-[18px]" />
				</Button>
			</DialogTrigger>
			<DialogContent className="flex h-[max(550px,80svh)] max-w-[min(550px,100svw)] flex-col justify-between">
				<div className="flex flex-col">
					<DialogHeader>
						<DialogTitle className="text-center">Pin Videos</DialogTitle>
					</DialogHeader>
				<DialogDescription className="mt-1">pinned videos (click to vote)</DialogDescription>
				<ScrollArea></ScrollArea>
				</div>
				<DialogClose asChild>
					<Button className="my-2">Done</Button>
				</DialogClose>
			</DialogContent>
		</Dialog>
	);
}
 
