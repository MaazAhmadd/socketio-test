import api from "@/api";
import { Icons } from "@/components/common/icons";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerTrigger,
} from "@/components/ui/drawer";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
	useAcceptFriendRequest,
	useCancelFriendRequest,
	useGetCurrentUser,
	useGetNormalUser,
	useRejectFriendRequest,
	useSendFriendRequest,
} from "@/hooks/user-hooks";
import { cn, getHexColorFromString } from "@/lib/utils";
import { useRoomStore } from "@/store";
import { PersonIcon } from "@radix-ui/react-icons";
import { useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { PhotoProvider, PhotoView } from "react-photo-view";

import { socket } from "@/socket";
import { BsThreeDots } from "react-icons/bs";
import { CgCrown } from "react-icons/cg";
import { FaRegHourglass } from "react-icons/fa";
import { GiBootKick } from "react-icons/gi";
import { GoPersonAdd } from "react-icons/go";
import {
	IoMicOffOutline,
	IoMicOutline,
	IoVolumeHighOutline,
	IoVolumeMuteOutline,
} from "react-icons/io5";
import { IconType } from "react-icons/lib";
import { useParams } from "react-router-dom";

export function RoomMembersDrawer() {
	const scrollAreaRef = useRef<HTMLDivElement | null>(null);
	const { activeMembersList } = useRoomStore((s) => ({
		activeMembersList: s.roomData?.activeMembersList,
	}));

	console.log("[RoomMembersDrawer] activeMembersList: ", activeMembersList);

	return (
		<>
			<Drawer direction="right">
				<DrawerTrigger asChild>
					<Button variant="outline">
						<PersonIcon className="h-4 w-4 md:h-6 md:w-6" />
					</Button>
				</DrawerTrigger>
				<DrawerContent className="right-0 ml-24 mr-0 max-w-[80vw] bg-background/80">
					<div className="flex h-full flex-col items-center justify-between ">
						<div></div>
						<DrawerClose asChild>
							{/* <Cross1Icon className="mt-3 h-6 w-6 cursor-pointer md:h-8 md:w-8" /> */}
							<div className="mx-auto ml-4 mr-4 h-[100px] w-2 rounded-full bg-muted" />
						</DrawerClose>
						<div></div>
					</div>
					<div className="h-full w-[80vw] max-w-sm pr-1 md:max-w-[27vw]">
						{/* <DrawerHeader>
            <DrawerTitle className="my-2 pr-4 text-center text-xl md:text-2xl">
              Members
            </DrawerTitle>
          </DrawerHeader> */}
						<ScrollArea viewportRef={scrollAreaRef} className="">
							<div className="mt-6 h-[95vh]">
								{activeMembersList?.map((m) => {
									return <RoomMember _id={m} key={m} />;
								})}
							</div>
						</ScrollArea>
					</div>
				</DrawerContent>
			</Drawer>
		</>
	);
}

const RoomMember = ({ _id }: { _id: string }) => {
	const { data: currentUser } = useGetCurrentUser();
	const { data: m } = useGetNormalUser(_id);
	const { activeMembersList, mics } = useRoomStore((s) => ({
		activeMembersList: s.roomData?.activeMembersList,
		mics: s.mics,
	}));

	return (
		currentUser &&
		m && (
			<div className="relative mb-6 flex items-center justify-between gap-4">
				{activeMembersList && activeMembersList[0] === _id && (
					<CgCrown className="absolute left-[2px] top-[-18px] size-6 rotate-[-18deg]" />
				)}
				<div className="flex items-center gap-4">
					<DialogWrapperPfpIcon _id={m._id}>
						<RoomMembersDrawerPfpIcon _id={m._id} />
					</DialogWrapperPfpIcon>

					<div className="flex flex-col items-start">
						<div className="text-gray-200">{m.name || "name"}</div>
						<div className="mb-2 flex items-center text-gray-400">
							{activeMembersList?.length &&
							mics.length &&
							mics[activeMembersList!.indexOf(_id)] == "1" ? (
								<IoMicOutline className="size-5" />
							) : (
								<IoMicOffOutline className="size-5" />
							)}
							<span className="ml-1 text-gray-400">@{m.handle}</span>
						</div>
					</div>
				</div>
				{currentUser._id === m._id && (
					<Button
						size={"sm"}
						variant={"destructive"}
						onClick={() => {
							api
								.get("/user/unfriendAll")
								.then((res) => toast.success(res.data));
						}}
					>
						rm all frs
					</Button>
				)}
				<div>
					<FriendshipButton _id={m._id} />
				</div>
			</div>
		)
	);
};

const RoomMembersDrawerPfpIcon = ({
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
				key={_id}
				src={user.pfp}
				alt=""
				className={cn(
					"size-[52px] rounded-full object-cover p-[2px]",
					isFriend ? "size-[56px] border border-primary" : "", // if friend
					className,
				)}
			/>
		) : (
			<div
				key={_id}
				style={{
					backgroundImage: `linear-gradient(to bottom, ${randomColor} 0%, ${randomColor} 100%), linear-gradient(to bottom, hsl(var(--muted)) 0%, hsl(var(--muted)) 100%)`,
					backgroundClip: isFriend ? "content-box, padding-box" : "",
				}}
				className={cn(
					"size-[52px] rounded-full p-[2px]",
					isFriend ? "size-[56px] border border-primary" : "", // if friend
					className,
				)}
			></div>
		))
	);
};

const FriendshipButton = ({
	_id,
	className,
}: {
	_id: string;
	className?: string;
}) => {
	className = cn("mr-6 size-6 cursor-pointer", className);
	const [status, setStatus] = useState<
		"stranger" | "friend" | "reqSend" | "reqRec"
	>("stranger");
	// console.log("[FriendshipButton] status", status);

	const { data: currentUser, isLoading: currentUserLoading } =
		useGetCurrentUser();
	// console.log("[FriendshipButton] currentUser", currentUser);

	const { mutate: sendReq, isPending: sendReqPending } = useSendFriendRequest();
	const { mutate: cancelReq, isPending: cancelReqPending } =
		useCancelFriendRequest();
	const { mutate: acceptReq, isPending: acceptReqPending } =
		useAcceptFriendRequest();
	const { mutate: rejectReq, isPending: rejectReqPending } =
		useRejectFriendRequest();

	const loading =
		sendReqPending ||
		cancelReqPending ||
		acceptReqPending ||
		rejectReqPending ||
		currentUserLoading;

	if (loading) {
		return <Icons.spinner className={cn("animate-spin", className)} />;
	}

	if (
		!currentUser ||
		currentUser?._id === _id ||
		currentUser?.friends.includes(_id)
	) {
		return <></>;
	}
	if (currentUser?.friendReqsSent.includes(_id)) {
		return (
			<DropdownMenu>
				<DropdownMenuTrigger>
					<FaRegHourglass className={cn(className)} title="cancel request" />
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem
						onClick={() => {
							setStatus("stranger");
							cancelReq(_id);
						}}
					>
						Cancel
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		);
	}
	if (currentUser?.friendReqsReceived.includes(_id)) {
		return (
			<DropdownMenu>
				<DropdownMenuTrigger>
					<BsThreeDots className={cn(className)} title="accept request" />
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem
						onClick={() => {
							setStatus("friend");
							acceptReq(_id);
						}}
					>
						Accept
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={() => {
							setStatus("stranger");
							rejectReq(_id);
						}}
					>
						Reject
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger>
				<GoPersonAdd className={cn(className)} title="add friend" />
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem
					onClick={() => {
						setStatus("reqSend");
						sendReq(_id);
					}}
				>
					Add Friend
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

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
			<DialogContent className="bg-background/40 sm:max-w-[425px]">
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
					<div className="flex flex-col items-center gap-1 ">
						<div className="text-sm text-primary">{user?.name}</div>
						<div className="text-sm font-semibold text-primary">
							@{user?.handle}
						</div>
					</div>
					{currentUser?._id != _id && <Separator className="my-4 mb-2" />}
					{/* <DialogListItem icon={AiOutlinePicture} label="Profile Picture" /> */}
					{activeMembersList &&
						currentUser?._id === activeMembersList[0] &&
						currentUser?._id != _id && (
							<DialogListItem
								onClick={() => {
									socket.emit("giveLeader", { targetMember: _id, roomId: id! });
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
									socket.emit("mic", _id + "," + id! + "," + "0");
								}}
							/>
						) : (
							<DialogListItem
								icon={IoMicOutline}
								label="Enable Mic"
								onClick={() => {
									socket.emit("mic", _id + "," + id! + "," + "1");
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
							<DialogListItem icon={GiBootKick} label="Kick" />
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
			className="mt-2 flex cursor-pointer items-center gap-4 rounded-md border px-4 py-2 text-sm transition-all hover:border-primary/40"
		>
			<div className="flex items-center gap-4">
				<Icon className="size-5" />
				<Separator className="h-6" orientation="vertical" />
			</div>
			<p className="text-sm">{label}</p>
		</div>
	);
};
