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
					<CgCrown className="absolute top-[-18px] left-[2px] size-6 rotate-[-18deg]" />
				)}
				<div className="flex items-center gap-4">
					<DialogWrapperPfpIcon _id={m._id}>
						<MemberIcon _id={m._id} size={52} sizeDiff={4} />
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

const FriendshipButton = ({
	_id,
	className,
}: {
	_id: string;
	className?: string;
}) => {
	className = cn("mr-6 size-6 cursor-pointer", className);
	// const [status, setStatus] = useState<
	// 	"stranger" | "friend" | "reqSend" | "reqRec"
	// >("stranger");
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
					<DropdownMenuItem onClick={() => cancelReq(_id)}>
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
					<DropdownMenuItem onClick={() => acceptReq(_id)}>
						Accept
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={() => rejectReq(_id)}>
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
				<DropdownMenuItem onClick={() => sendReq(_id)}>
					Add Friend
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
