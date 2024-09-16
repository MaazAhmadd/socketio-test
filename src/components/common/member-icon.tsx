import { useGetNormalUser, useGetCurrentUser } from "@/hooks/user-hooks";
import { getHexColorFromString, cn } from "@/lib/utils";
import { useRoomStore } from "@/store";
import { CgCrown } from "react-icons/cg";

const MemberIcon = ({
	_id,
	className,
	_size = "sm",
}: {
	_id: string;
	className?: string;
	_size?: "sm" | "md" | "lg";
}) => {
	const sizeMap = {
		sm: "size-[42px]",
		md: "size-[56px]",
		lg: "size-[65px]",
	};
	const classesMap = {
		sm: "top-[-13px] left-[2px] size-[18px] rotate-[-21deg]",
		md: "top-[-17px] left-[2px] size-6 rotate-[-21deg]",
		lg: "top-[-17px] left-[2px] size-[26px] rotate-[-24deg]",
	};
	const randomColor = getHexColorFromString(_id);
	const { data: user } = useGetNormalUser(_id);
	const { data: currentUser } = useGetCurrentUser();
	const { activeMembersList } = useRoomStore((s) => ({
		activeMembersList: s.roomData?.activeMembersList,
	}));
	const isFriend =
		currentUser?._id === _id || currentUser?.friends.includes(_id);

	return (
		<div className="relative">
			{activeMembersList && activeMembersList[0] === _id && (
				<CgCrown className={cn("absolute", classesMap[_size])} />
			)}
			{user &&
				(user.pfp ? (
					<img
						src={user.pfp}
						alt=""
						className={cn(
							"rounded-full border object-cover p-[2px]",
							isFriend ? "border-primary" : "border-muted",
							sizeMap[_size],
							className,
						)}
					/>
				) : (
					<div
						style={{
							backgroundImage: `linear-gradient(to bottom, ${randomColor} 0%, ${randomColor} 100%), linear-gradient(to bottom, hsl(var(--muted)) 0%, hsl(var(--muted)) 100%)`,
							backgroundClip: isFriend ? "content-box, padding-box" : "",
						}}
						className={cn(
							"rounded-full border p-[2px]",
							isFriend ? "border-primary" : "border-muted",
							sizeMap[_size],
							className,
						)}
					></div>
				))}
		</div>
	);
};

export default MemberIcon;
