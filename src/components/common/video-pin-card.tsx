import { useVideoInfo } from "@/hooks/video-player-hooks";
import { cn } from "@/lib/utils";
import MemberIcon from "./member-icon";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ScrollArea } from "../ui/scroll-area";
import { useGetNormalUser } from "@/hooks/user-hooks";
import { Separator } from "../ui/separator";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import React, { useEffect, useRef } from "react";
type Props = {
	src: string;
	vidType: number;
	votes?: string[];
	onClick?: () => void;
	className?: string;
};
export const VideoPinCard = ({
	src,
	vidType,
	votes = [],
	onClick = () => {},
	className,
}: Props) => {
	const { info, player } = useVideoInfo(src, vidType);

	return (
		<div
			onClick={() => {
				if (!info.duration) return;
				console.log("ready to send data to server to make room: ", info);
				onClick();
			}}
			className={cn(
				"h-[100px] w-[177.77px] cursor-pointer rounded-sm border border-muted bg-center bg-cover bg-primary-foreground bg-no-repeat hover:border-muted-foreground",
				!info.thumbnail && "animate-pulse",
				!info.duration && "cursor-not-allowed",
				className,
			)}
			style={{
				backgroundImage: `url(${info.thumbnail})`,
			}}
		>
			{player}
			<div className="flex h-full flex-col justify-between">
				<div className="flex items-start justify-between">
					{votes.length > 0 && <PinVotes votes={votes} />}
					<span
						className={cn(
							"rounded-sm bg-muted/70 p-1 font-bold text-white text-xs leading-tight",
							!info.duration && "h-6 w-11 animate-pulse",
						)}
					>
						{info.duration && formatTime(info.duration)}
					</span>
				</div>
				<p
					className={cn(
						"rounded-t-sm bg-muted/70 px-2 py-1 text-white text-xs leading-tight",
						!info.title && "m-1 h-8 animate-pulse",
					)}
				>
					{trimString(info.title, 50)}
				</p>
			</div>
		</div>
	);
};
export function trimString(str: string, max = 40) {
	if (str.length > max) {
		return str.slice(0, max) + "...";
	}
	return str;
}

export function formatTime(seconds: number): string {
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);

	const formattedMinutes = String(minutes % 60).padStart(2, "0");
	const formattedSeconds = String(seconds % 60).padStart(2, "0");

	if (hours > 0) {
		const formattedHours = String(hours).padStart(2, "0");
		return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
	}
	if (minutes > 0) {
		return `${formattedMinutes}:${formattedSeconds}`;
	}
	return `00:${formattedSeconds}`;
}

const PinVotes = ({ votes }: { votes: string[] }) => {
	if (votes.length === 0) {
		return null;
	}
	const votersToRender = votes.slice(0, 3);
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<div className="flex items-center gap-[2px] rounded-sm bg-muted/70 p-[2px]">
					{votersToRender.map((voter) => (
						<span key={voter}>
							<MemberIcon _id={voter} _size="vote" />
						</span>
					))}
					{votes.length > 3 && (
						<p className="ml-[2px] text-xs">{votes.length - 3}+</p>
					)}
				</div>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-[min(40svw,180px)]">
				<div className="flex flex-col">
					{votes.map((voter, index) => (
						<React.Fragment key={voter}>
							<DropdownMenuItem className="p-1">
								<VotePopOverListItem _id={voter} />
							</DropdownMenuItem>
							{index < votes.length - 1 && <DropdownMenuSeparator />}
						</React.Fragment>
					))}
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

const VotePopOverListItem = ({ _id }: { _id: string }) => {
	const { data } = useGetNormalUser(_id);

	return (
		<div className="flex w-full items-center justify-between">
			<MemberIcon _id={_id} _size="vote" />
			<p className="text-xs">{data?.name}</p>
			<div></div>
		</div>
	);
};
