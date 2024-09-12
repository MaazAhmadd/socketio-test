import { cn, getHexColorFromString } from "@/lib/utils";
import { Room } from "server/src/types";
import React from "react";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { useGetCurrentUser, useGetNormalUser } from "@/hooks/user-hooks";
import { trimString } from "@/pages/home";
interface RoomCardProps {
	room: Room;
	className?: string;
	onClick?: () => void;
}
const RoomCard: React.FC<RoomCardProps> = ({
	room,
	className,
	onClick,
	...props
}) => {
	const { data } = useGetCurrentUser();
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
		<li className={cn("", className)} {...props} onClick={onClick}>
			<div className="flex h-[100px] justify-between gap-4">
				{room.v_thumbnailUrl ? (
					<img
						src={room.v_thumbnailUrl}
						alt=""
						className="w-full min-w-[100px] max-w-[150px] object-contain"
					/>
				) : (
					<div className="w-full min-w-[100px] max-w-[150px] bg-slate-400" />
				)}
				<div className="flex w-full flex-col justify-between py-2 pr-2">
					<div className="font-bold text-sm leading-tight md:text-base">
						{trimString(room.v_title)}
					</div>
					<div className="flex">
						<div className="no-scrollbar flex gap-2 overflow-x-scroll">
							{/* <div className="flex gap-2 overflow-x-scroll"> */}
							{activeMembersList?.map((m) => {
								return (
									<MemberPfpIcon key={m} _id={m} className="size-[42px]" />
								);
							})}
						</div>
						{activeMembersList.length > 4 && (
							<span className="ml-1 flex items-center rounded-r-sm bg-muted">
								<ChevronRightIcon className="h-3 w-3 text-muted-foreground" />
							</span>
						)}
					</div>
				</div>
			</div>
		</li>
	);
};

export const MemberPfpIcon = ({
	_id,
	className,
}: {
	_id: string;
	className?: string;
}) => {
	const randomColor = getHexColorFromString(_id);
	const { data: user } = useGetNormalUser(_id);
	const { data: currentUser } = useGetCurrentUser();
	const isFriend =
		currentUser?._id === _id || currentUser?.friends.includes(_id);
	return (
		user &&
		(user.pfp ? (
			<img
				src={user.pfp}
				alt=""
				className={cn(
					"size-[42px] rounded-full border border-muted object-cover p-[2px]",
					isFriend ? "border-primary" : "", // if friend
					className,
				)}
			/>
		) : (
			<div
				key={_id}
				style={{
					backgroundImage: `linear-gradient(to bottom, ${randomColor} 0%, ${randomColor} 100%), linear-gradient(to bottom, hsl(var(--muted)) 0%, hsl(var(--muted)) 100%)`,
					backgroundClip: "content-box, padding-box",
				}}
				className={cn(
					"size-[42px] rounded-full border border-muted p-[2px]",
					isFriend ? "border-primary" : "", // if friend
					className,
				)}
			></div>
		))
	);
};
export default RoomCard;
