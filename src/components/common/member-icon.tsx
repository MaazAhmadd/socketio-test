import { useGetNormalUser, useGetCurrentUser } from "@/hooks/user-hooks";
import { getHexColorFromString, cn } from "@/lib/utils";

const MemberIcon = ({
	_id,
	className,
	size = 42,
	sizeDiff = 0,
}: {
	_id: string;
	className?: string;
	size?: number;
	sizeDiff?: number;
}) => {
	const randomColor = getHexColorFromString(_id);
	const { data: user } = useGetNormalUser(_id);
	const { data: currentUser } = useGetCurrentUser();

	const isFriend =
		currentUser?._id === _id || currentUser?.friends.includes(_id);

	const iconSize = size + sizeDiff;

	return (
		user &&
		(user.pfp ? (
			<img
				src={user.pfp}
				alt=""
				className={cn(
					`size-[${iconSize}px] rounded-full border object-cover p-[2px]`,
					isFriend ? "border-primary" : "border-muted",
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
					`size-[${iconSize}px] rounded-full border p-[2px]`,
					isFriend ? "border-primary" : "border-muted",
					className,
				)}
			></div>
		))
	);
};

export default MemberIcon;
