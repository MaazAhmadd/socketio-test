import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTrigger,
	DialogClose,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useGetCurrentUser, useGetNormalUser } from "@/hooks/user-hooks";
import { cn, getHexColorFromString } from "@/lib/utils";
import { useRoomStore } from "@/store";
import { PhotoProvider, PhotoView } from "react-photo-view";

import { socket } from "@/socket";
import { CgCrown } from "react-icons/cg";
import { GiBootKick } from "react-icons/gi";
import {
	IoMicOffOutline,
	IoMicOutline,
	IoVolumeHighOutline,
	IoVolumeMuteOutline,
} from "react-icons/io5";
import { IconType } from "react-icons/lib";
import { useParams } from "react-router-dom";
import { FriendshipButton } from "./room-members-drawer";
import { Button } from "@/components/ui/button";

const DialogWrapperPfpIcon = ({
	children,
	_id,
}: {
	children: React.ReactNode;
	_id: string;
}) => {
	const { data: user } = useGetNormalUser(_id);
	const { data: currentUser } = useGetCurrentUser();
	const { id } = useParams();
	const {
		mutedMembers,
		mutedMembersPush,
		mutedMembersPull,
		mics,
		activeMembersList,
	} = useRoomStore((s) => ({
		mutedMembers: s.mutedMembers,
		mutedMembersPush: s.mutedMembersPush,
		mutedMembersPull: s.mutedMembersPull,
		mics: s.mics,
		activeMembersList: s.roomData?.activeMembersList,
	}));
	const randomColor = getHexColorFromString(_id);
	return (
		<Dialog>
			<DialogTrigger>{children}</DialogTrigger>
			<DialogContent className="max-w-[350px] rounded-sm bg-background/60 md:max-w-[425px]">
				<DialogHeader className="items-center">
					{user?.pfp ? (
						<PhotoProvider>
							<PhotoView src={user?.pfp}>
								<img
									src={user?.pfp}
									alt={user?.name}
									className="size-[250px] rounded-sm object-cover"
								/>
							</PhotoView>
						</PhotoProvider>
					) : (
						<div
							key={_id}
							style={{
								backgroundImage: `linear-gradient(to bottom, ${randomColor} 0%, ${randomColor} 100%), linear-gradient(to bottom, hsl(var(--muted)) 0%, hsl(var(--muted)) 100%)`,
							}}
							className={cn("size-[250px] rounded-sm p-[2px]")}
						></div>
					)}
				</DialogHeader>
				<div className="flex flex-col items-center">
					<div className="flex items-center gap-6">
						<div className="w-14"></div>
						<div className="flex flex-col items-center gap-1 hover:bg-background/50">
							<div className="text-primary text-sm">{user?.name}</div>
							<div className="font-semibold text-primary text-sm">
								@{user?.handle}
							</div>
						</div>
						<div>
							<FriendshipButton className="mr-0" _id={_id} />
						</div>
					</div>
					{currentUser?._id != _id && <Separator className="my-4 mb-2" />}
					{/* <DialogListItem icon={AiOutlinePicture} label="Profile Picture" /> */}
					{activeMembersList &&
						currentUser?._id === activeMembersList[0] &&
						currentUser?._id != _id && (
							<DialogListItem
								onClick={() => {
									socket.emit("giveLeader", _id);
								}}
								icon={CgCrown}
								label="Give Leadership"
							/>
						)}
					{/* TODO: add this functionality when adding audio chat */}
					{activeMembersList &&
						currentUser?._id === activeMembersList[0] &&
						currentUser?._id != _id &&
						(mics[activeMembersList!.indexOf(_id)] === "1" ? (
							<DialogListItem
								icon={IoMicOffOutline}
								label="Disable Mic"
								onClick={() => {
									socket.emit("mic", _id + ",0");
								}}
							/>
						) : (
							<DialogListItem
								icon={IoMicOutline}
								label="Enable Mic"
								onClick={() => {
									socket.emit("mic", _id + ",1");
								}}
							/>
						))}
					{currentUser?._id != _id &&
						(mutedMembers.includes(_id) ? (
							<DialogListItem
								onClick={() => mutedMembersPull(_id)}
								icon={IoVolumeHighOutline}
								label="Unmute"
							/>
						) : (
							<DialogListItem
								onClick={() => mutedMembersPush(_id)}
								icon={IoVolumeMuteOutline}
								label="Mute"
							/>
						))}
					{activeMembersList &&
						currentUser?._id === activeMembersList[0] &&
						currentUser?._id != _id && (
							<DialogClose>
								<DialogListItem
									icon={GiBootKick}
									label="Kick"
									onClick={() => {
										socket.emit("kickMember", _id);
									}}
								/>
							</DialogClose>
						)}
				</div>
				<DialogFooter></DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

const DialogListItem: React.FC<{
	icon: IconType;
	label: string;
	onClick?: () => void;
}> = ({ icon: Icon, label, onClick }) => {
	return (
		<div
			onClick={onClick}
			className="mt-2 flex cursor-pointer items-center gap-4 rounded-md border px-4 py-2 text-sm transition-all hover:border-primary/40 hover:bg-background/50"
		>
			<div className="flex items-center gap-4">
				<Icon className="size-5" />
				<Separator className="h-6" orientation="vertical" />
			</div>
			<p className="text-sm">{label}</p>
		</div>
	);
};

export default DialogWrapperPfpIcon;
