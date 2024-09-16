import api from "@/api";
import { Icons } from "@/components/common/icons";
import { Button } from "@/components/ui/button";
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
import { useRef } from "react";
import { toast } from "react-hot-toast";

import { BsThreeDots } from "react-icons/bs";
import { CgCrown } from "react-icons/cg";
import { FaRegHourglass } from "react-icons/fa";
import { GoPersonAdd } from "react-icons/go";
import { IoMicOffOutline, IoMicOutline } from "react-icons/io5";
import DialogWrapperPfpIcon from "./dialog-wrapper-pfp-icon";
import MemberIcon from "@/components/common/member-icon";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

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
				<DrawerContent className="right-0 mr-0 ml-24 max-w-[80vw] bg-background/80">
					<div className="flex h-full flex-col items-center justify-between ">
						<div></div>
						<DrawerClose asChild>
							{/* <Cross1Icon className="mt-3 h-6 w-6 cursor-pointer md:h-8 md:w-8" /> */}
							<div className="mx-auto mr-4 ml-4 h-[100px] w-2 rounded-full bg-muted" />
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
	const { data: user } = useGetNormalUser(_id);
	const { activeMembersList, mics } = useRoomStore((s) => ({
		activeMembersList: s.roomData?.activeMembersList,
		mics: s.mics,
	}));

	return (
		currentUser &&
		user && (
			<div className="mb-6 flex items-center justify-between gap-4">
				<div className="flex items-center gap-4">
					<DialogWrapperPfpIcon _id={_id}>
						<MemberIcon _id={_id} _size="md" />
					</DialogWrapperPfpIcon>

					<div className="flex flex-col items-start">
						<div className="text-gray-200">{user.name || "name"}</div>
						<div className="mb-2 flex items-center text-gray-400">
							{activeMembersList?.length &&
							mics.length &&
							mics[activeMembersList!.indexOf(_id)] == "1" ? (
								<IoMicOutline className="size-5" />
							) : (
								<IoMicOffOutline className="size-5" />
							)}
							<span className="ml-1 text-gray-400">@{user.handle}</span>
						</div>
					</div>
				</div>
				{/* {currentUser._id === user._id && (
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
				)} */}
				<div>
					<FriendshipButton _id={user._id} />
				</div>
			</div>
		)
	);
};

export const FriendshipButton = ({
	_id,
	className,
}: {
	_id: string;
	className?: string;
}) => {
	const { data: currentUser, isLoading: currentUserLoading } =
		useGetCurrentUser();

	const { mutate: _sendReq, isPending: sendReqPending } =
		useSendFriendRequest();
	const { mutate: _cancelReq, isPending: cancelReqPending } =
		useCancelFriendRequest();
	const { mutate: _acceptReq, isPending: acceptReqPending } =
		useAcceptFriendRequest();
	const { mutate: _rejectReq, isPending: rejectReqPending } =
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
	const commandMap = {
		cancelReq: { onClick: () => _cancelReq(_id), lable: "Cancel" },
		sendReq: { onClick: () => _sendReq(_id), lable: "Send" },
		acceptReq: { onClick: () => _acceptReq(_id), lable: "Accept" },
		rejectReq: { onClick: () => _rejectReq(_id), lable: "Reject" },
	};
	if (currentUser?.friendReqsSent.includes(_id)) {
		return (
			<FriendshipDropdownWrapper
				tooltipLabel="cancel the sent friend request?"
				renderData={[commandMap.cancelReq]}
				className={cn(className)}
			>
				<FaRegHourglass className="size-6 cursor-pointer" />
			</FriendshipDropdownWrapper>
		);
	}

	if (currentUser?.friendReqsReceived.includes(_id)) {
		return (
			<FriendshipDropdownWrapper
				tooltipLabel="accept or reject the received friend request?"
				renderData={[commandMap.acceptReq, commandMap.rejectReq]}
				className={cn(className)}
			>
				<BsThreeDots className="size-6 cursor-pointer" />
			</FriendshipDropdownWrapper>
		);
	}

	return (
		<FriendshipDropdownWrapper
			tooltipLabel="send a friend request?"
			renderData={[commandMap.sendReq]}
			className={cn(className)}
		>
			<GoPersonAdd className="ml-1 size-6 cursor-pointer" />
		</FriendshipDropdownWrapper>
	);
};

const FriendshipDropdownWrapper = ({
	children,
	tooltipLabel,
	renderData,
	className,
}: {
	children: React.ReactNode;
	tooltipLabel: string;
	renderData: {
		onClick: () => void;
		lable: string;
	}[];
	className?: string;
}) => {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger>
				<TooktipWrapper label={tooltipLabel}>
					<Button className={cn("mr-6", className)} variant={"secondary"}>
						{children}
					</Button>
				</TooktipWrapper>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				{renderData.map((r, i) => (
					<>
						<DropdownMenuItem key={i} onClick={r.onClick}>
							{r.lable}
						</DropdownMenuItem>
						{renderData.length - 1 !== i && <DropdownMenuSeparator />}
					</>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

const TooktipWrapper = ({
	children,
	label,
}: { children: React.ReactNode; label: string }) => {
	return (
		<TooltipProvider>
			<Tooltip delayDuration={50}>
				<TooltipTrigger>{children}</TooltipTrigger>
				<TooltipContent
					className={cn("border border-muted bg-background text-primary")}
				>
					<p>{label}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};
