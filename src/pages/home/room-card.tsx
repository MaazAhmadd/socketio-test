import MemberIcon from "@/components/common/member-icon";
import { useGetCurrentUser } from "@/hooks/user-hooks";
import { screenBreakpoints, useWindowSize } from "@/hooks/util-hooks";
import { cn } from "@/lib/utils";
import { trimString } from "@/pages/home";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { Room } from "server/src/types";

interface RoomCardProps {
	room: Room;
	className?: string;
	onClick?: () => void;
}

const RoomCard = ({ room, className, onClick }: RoomCardProps) => {
	const { data } = useGetCurrentUser();
	const { width } = useWindowSize();
	if (!data) return <></>;
	if (!room || !room.activeMembersList || room.activeMembersList?.length! < 1)
		return <></>;
	const activeMembersList = [...room?.activeMembersList!];
	if (data) {
		// sort room members based on friends come first
		const friends = data.friends;
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
				"mx-auto mt-2 max-w-[95vw] cursor-pointer overflow-hidden rounded-xl border border-background bg-background/50 hover:border-muted-foreground focus:border-muted-foreground active:border-muted-foreground",
				className,
			)}
			// onClick={onClick}
		>
			<div className="flex h-[80px] justify-start gap-4 sm:h-[100px]">
				{room.v_thumbnailUrl ? (
					<img
						src={room.v_thumbnailUrl}
						alt=""
						className="w-[120px] max-w-[200px] object-cover sm:w-[150px]"
					/>
				) : (
					<div className="w-[120px] max-w-[200px] bg-slate-400" />
				)}
				<div className="flex w-[60vw] flex-col justify-between py-2 pr-1 sm:w-[65vw] lg:w-[40vw]">
					<p className="text-xs leading-tight sm:text-sm md:text-base">
						{trimString(
							`${room.v_title} ${room.v_title} ${room.v_title}`,
							width <= screenBreakpoints.sm
								? 48
								: width < screenBreakpoints.md - 100
									? 64
									: 128,
						)}
					</p>
					<div className="flex">
						<div className="no-scrollbar flex gap-1 overflow-x-scroll">
							{/* <div className="flex gap-2 overflow-x-scroll"> */}
							{[
								...activeMembersList,
								...activeMembersList,
								...activeMembersList,
								...activeMembersList,
								...activeMembersList,
								...activeMembersList,
							]?.map((m) => {
								return (
									<MemberIcon
										key={m}
										_id={m}
										_size={width <= screenBreakpoints.sm ? "xs" : "sm"}
									/>
								);
							})}
						</div>
						{/* {[...activeMembersList, ...activeMembersList, ...activeMembersList]
							.length > 4 && (
							<span className="ml-1 flex items-center rounded-r-sm bg-muted">
								<ChevronRightIcon className="h-3 w-3 text-muted-foreground" />
							</span>
						)} */}
					</div>
				</div>
			</div>
		</li>
	);
};

export default RoomCard;
