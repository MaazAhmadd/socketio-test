import { useGetNormalUser } from "@/hooks/user-hooks";
import { useVideoInfo } from "@/hooks/video-player-hooks";
import { cn, formatTime, trimString } from "@/lib/utils";
import React from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import MemberIcon from "./member-icon";
type Props = {
	src: string;
	platform: number;
	votes?: string[];
	onClick?: () => void;
	titleLength?: number;
	className?: string;
};
export const VideoPinCard = ({
	src,
	platform,
	votes = [],
	onClick = () => {},
	titleLength = 50,
	className,
}: Props) => {
	const { info, player } = useVideoInfo(src, platform);

	return (
		<div className="relative">
			{votes.length > 0 && (
				<div className="absolute top-0 left-0">
					<PinVotes votes={votes} />
				</div>
			)}
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
						<span></span>
						<span
							className={cn(
								"select-none rounded-sm bg-muted/70 p-[3px] text-white text-xs leading-tight",
								!info.duration && "h-6 w-11 animate-pulse",
							)}
						>
							{info.duration && formatTime(info.duration)}
						</span>
					</div>
					<p
						className={cn(
							"select-none rounded-t-sm bg-muted/70 p-[3px] text-white text-xs leading-tight",
							!info.title && "m-1 h-8 animate-pulse",
						)}
					>
						{trimString(info.title, titleLength)}
					</p>
				</div>
			</div>
		</div>
	);
};

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
							<DropdownMenuItem className="p-1" onClick={() => {}}>
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
