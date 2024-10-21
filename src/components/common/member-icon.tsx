import { useGetNormalUser, useGetCurrentUser } from "@/hooks/user-hooks";
import { getHexColorFromString, cn } from "@/lib/utils";
import { useRoomStore } from "@/store";
import { CgCrown } from "react-icons/cg";
import ReactCountryFlag from "react-country-flag";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CircleFlag } from "react-circle-flags";

type Props = {
	_id: string;
	className?: string;
	_size?: "vote" | "xs" | "sm" | "md" | "lg";
	crown?: boolean;
	flag?: boolean;
};
const MemberIcon = ({
	_id,
	className,
	_size = "sm",
	crown = false,
	flag = false,
}: Props) => {
	const sizeMap = {
		vote: "!size-[27px]",
		xs: "!size-[36px]",
		sm: "!size-[42px]",
		md: "!size-[56px]",
		lg: "!size-[65px]",
	};
	const crownClassesMap = {
		vote: "",
		xs: "top-[-13px] left-[2px] size-[18px] rotate-[-21deg]",
		sm: "top-[-13px] left-[2px] size-[18px] rotate-[-21deg]",
		md: "top-[-17px] left-[2px] size-6 rotate-[-21deg]",
		lg: "top-[-17px] left-[2px] size-[26px] rotate-[-24deg]",
	};
	const flagClassesMap = {
		vote: "",
		xs: "size-[15px]",
		sm: "size-4",
		md: "size-[22px]",
		lg: "size-6",
	};
	const randomColor = getHexColorFromString(_id);
	const { data: user } = useGetNormalUser(_id);

	const { data: currentUser, error } = useGetCurrentUser();

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
			{/* {flag && user && (
				<ReactCountryFlag
					countryCode={user.country}
					className={cn("absolute opacity-80", flagClassesMap[_size])}
				/>
			)} */}
			{/* {flag && user && (
				<Avatar className={cn("absolute opacity-80", flagClassesMap[_size])}>
					<AvatarImage
						src={`https://flagsapi.com/${user.country}/flat/64.png`}
						alt={user.country}
					/>
					<AvatarFallback>{user.country}</AvatarFallback>
				</Avatar>
			)} */}
			{flag && user && (
				<CircleFlag
					className={cn(
						"absolute top-[55%] left-[70%] opacity-90",
						flagClassesMap[_size],
					)}
					countryCode={String(user.country).toLowerCase()}
					alt={user.country}
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
								_size === "vote"
									? ""
									: isFriend
										? "border-primary"
										: "border-muted",
								sizeMap[_size],
								className,
							)}
						/>
					</div>
				) : (
					<div
						style={{
							backgroundImage: `linear-gradient(to bottom, ${randomColor} 0%, ${randomColor} 100%), linear-gradient(to bottom, hsl(var(--muted)) 0%, hsl(var(--muted)) 100%)`,
							backgroundClip:
								_size === "vote"
									? ""
									: isFriend
										? "content-box, padding-box"
										: "",
						}}
						className={cn(
							"rounded-full border p-[2px]",
							_size === "vote"
								? ""
								: isFriend
									? "border-primary"
									: "border-muted",
							sizeMap[_size],
							className,
						)}
					></div>
				))}
		</div>
	);
};

export default MemberIcon;
