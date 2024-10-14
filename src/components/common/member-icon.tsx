import { useGetNormalUser, useGetCurrentUser } from "@/hooks/user-hooks";
import { getHexColorFromString, cn } from "@/lib/utils";
import { useRoomStore } from "@/store";
import { CgCrown } from "react-icons/cg";
import ReactCountryFlag from "react-country-flag";
const MemberIcon = ({
	_id,
	className,
	_size = "sm",
	crown = false,
	flag = false,
}: {
	_id: string;
	className?: string;
	_size?: "xs" | "sm" | "md" | "lg";
	crown?: boolean;
	flag?: boolean;
}) => {
	const sizeMap = {
		xs: "!size-[36px]",
		sm: "!size-[42px]",
		md: "!size-[56px]",
		lg: "!size-[65px]",
	};
	const crownClassesMap = {
		xs: "top-[-13px] left-[2px] size-[18px] rotate-[-21deg]",
		sm: "top-[-13px] left-[2px] size-[18px] rotate-[-21deg]",
		md: "top-[-17px] left-[2px] size-6 rotate-[-21deg]",
		lg: "top-[-17px] left-[2px] size-[26px] rotate-[-24deg]",
	};
	const flagClassesMap = {
		xs: "top-[24px] left-[28px] size-4",
		sm: "top-[24px] left-[28px] size-4",
		md: "top-[33px] left-[36px] size-7",
		lg: "top-[38px] left-[40px] size-10",
	};
	const randomColor = getHexColorFromString(_id);
	const { data: user } = useGetNormalUser(_id);

	const { data: currentUser,error } = useGetCurrentUser();
	
	const { activeMembersList } = useRoomStore((s) => ({
		activeMembersList: s.roomData?.activeMembersList,
	}));
	
	const isFriend =
		currentUser?._id === _id || currentUser?.friends.includes(_id);

	return (
		<div className="relative">
			{crown && activeMembersList && activeMembersList[0] === _id && (
				<CgCrown className={cn("absolute", crownClassesMap[_size])} />
			)}
			{flag && user && (
				<ReactCountryFlag
					countryCode={user.country}
					className={cn("absolute opacity-80", flagClassesMap[_size])}
				/>
			)}
			{user &&
				(user.pfp ? (
					<div className={cn(sizeMap[_size])}>
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
					</div>
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
