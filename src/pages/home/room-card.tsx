import MemberIcon from "@/components/common/member-icon";
import { useGetCurrentUser } from "@/hooks/user-hooks";
import { screenBreakpoints, useWindowSize } from "@/hooks/util-hooks";
import { useVideoInfo } from "@/hooks/video-player-hooks";
import { cn, trimString } from "@/lib/utils"; 
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { Room } from "server/src/types";

interface RoomCardProps {
	room: Room;
	className?: string;
	onClick?: () => void;
}

const RoomCard = ({ room, className, onClick }: RoomCardProps) => {
	const { data: currentUser } = useGetCurrentUser();
	const { width } = useWindowSize();
	const { info } = useVideoInfo(room.videoUrl,0); // 0 for youtube
	if (!currentUser) return <></>;
	if (!room || !room.activeMembersList || !room.activeMembersList?.length) {
		return <></>;
	}
	const activeMembersList = [...room?.activeMembersList!];
	if (currentUser) {
		// sort room members based on friends come first
		const friends = currentUser.friends;
		activeMembersList.sort((a, b) => {
			if (friends.includes(a) && friends.includes(b)) {
				return friends.indexOf(a) - friends.indexOf(b);
			}
			if (friends.includes(a)) return -1;
			if (friends.includes(b)) return 1;
			return 0;
		});
	}

	return (
		<li
			className={cn(
				"mx-auto max-w-[95svw] cursor-pointer overflow-hidden rounded-xl border border-background bg-background/50 hover:border-muted-foreground focus:border-muted-foreground active:border-muted-foreground",
				className,
			)}
			onClick={onClick}
		>
			<div className="flex h-[80px] justify-start gap-4 sm:h-[100px]">
				{info.thumbnail ? (
					<img
						src={info.thumbnail}
						alt=""
						className="w-[120px] max-w-[200px] object-cover sm:w-[150px]"
					/>
				) : (
					<div className="w-[120px] max-w-[200px] bg-slate-400" />
				)}
				<div className="flex w-[60svw] flex-col justify-between py-2 pr-1 sm:w-[69svw] lg:max-w-[430px]">
					<p className="text-xs leading-tight sm:text-sm md:text-[15px]">
						{info.title &&
							trimString(
								info.title,
								width <= screenBreakpoints.sm
									? 48
									: width < screenBreakpoints.md - 100
										? 54
										: 96,
							)}
					</p>
					<div className="flex">
						<div
							className={cn(
								"no-scrollbar flex gap-1 overflow-x-scroll",
								activeMembersList.length > 5 && "pr-10",
							)}
						>
							{/* <div className="flex gap-2 overflow-x-scroll"> */}
							{activeMembersList?.map((m) => {
								return (
									<MemberIcon
										key={m}
										_id={m}
										_size={width <= screenBreakpoints.sm ? "xs" : "sm"}
									/>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</li>
	);
};
/* {[...activeMembersList, ...activeMembersList, ...activeMembersList]
	.length > 4 && (
	<span className="ml-1 flex items-center rounded-r-sm bg-muted">
		<ChevronRightIcon className="h-3 w-3 text-muted-foreground" />
	</span>
)} */

export default RoomCard;
