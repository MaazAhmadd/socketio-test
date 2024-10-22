import { Icons } from "@/components/common/icons";
import MemberIcon from "@/components/common/member-icon";
import { Spinner } from "@/components/common/spinner";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
	useAcceptFriendRequest,
	useCancelFriendRequest,
	useGetCurrentUser,
	useGetNormalUser,
	useRejectFriendRequest,
	useRemoveFriend,
	useSendFriendRequest,
} from "@/hooks/user-hooks";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { CurrentUser } from "server/src/types";

export function FriendlistAccordian() {
	// const currentUser = useGlobalStore((state) => state.currentUser);
	const { data: currentUser, isFetching: isCurrentUserFetching } =
		useGetCurrentUser();
	const recents = currentUser?.recentUsers || [];
	const friends = currentUser?.friends || [];
	const friendReqsReceived = currentUser?.friendReqsReceived || [];
	if (!currentUser) return <Spinner className="h-[200px]" />;
	return (
		<Accordion type="single" collapsible className="w-full">
			{/* <Accordion type="multiple"  className="w-full pr-4"> */}
			<AccordionItem value="item-1">
				<AccordionTrigger>Friends</AccordionTrigger>

				<AccordionContent
					className={cn(
						"grid grid-cols-2 items-start justify-center justify-items-center gap-2 md:grid-cols-3",
						"scrollbar-hide h-[50svh] overflow-auto",
					)}
				>
					{!friends?.length && "Friend List..."}
					{friends.map((f) => (
						<Friend _id={f} key={f} />
					))}
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-2">
				<AccordionTrigger>Friend Requests</AccordionTrigger>

				<AccordionContent
					className={cn(
						"grid grid-cols-2 items-start justify-center justify-items-center gap-2 md:grid-cols-3",
						"scrollbar-hide h-[50svh] overflow-auto",
					)}
				>
					{!friendReqsReceived?.length && "Friend Requests..."}
					{friendReqsReceived.map((f) => (
						<FriendRequest _id={f} key={f} />
					))}
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-3">
				<AccordionTrigger>Recents</AccordionTrigger>

				<AccordionContent
					className={cn(
						"grid grid-cols-2 items-start justify-center justify-items-center gap-2 md:grid-cols-3",
						"scrollbar-hide h-[50svh] overflow-auto",
					)}
				>
					{!recents?.length && "No recents yet..."}
					{recents.map((r) => {
						if (r === currentUser?._id) {
							return null;
						}
						return <Recent key={r} _id={r} currentUser={currentUser} />;
					})}
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-4">
				<AccordionTrigger>Blocked</AccordionTrigger>
				<AccordionContent>Blocked coming soon...</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}

const Friend = ({
	_id,
}: {
	_id: string;
}) => {
	const { data: targetUser } = useGetNormalUser(_id);
	const { mutate: removeFriend, isPending } = useRemoveFriend();
	const { isFetching: isCurrentUserFetching } = useGetCurrentUser();
	if (!targetUser) return;
	return (
		<div className=" relative flex w-[120px] flex-col justify-center gap-1 rounded border border-muted bg-muted/50 p-2 text-center transition-all duration-150 hover:border-muted-foreground/40">
			<MemberIcon _id={targetUser._id} _size="lg" className="mx-auto" />
			<p className="text-primary" style={{ overflowWrap: "break-word" }}>
				{targetUser.name || "name"}
			</p>
			<p
				className="text-muted-foreground text-sm"
				style={{
					overflowWrap: "break-word",
				}}
			>
				@{targetUser.handle}
			</p>
			<div className=" flex justify-center ">
				<Button
					variant="ghost"
					size={"sm"}
					className="h-6 border border-red-700 px-[6px] text-[12px]"
					onClick={() => {
						removeFriend(targetUser._id);
					}}
					disabled={isPending || isCurrentUserFetching}
				>
					{isPending ? (
						<Icons.spinner className="mx-auto h-4 w-4 animate-spin" />
					) : (
						"Remove"
					)}
				</Button>
			</div>
		</div>
	);
};

const FriendRequest = ({
	_id,
}: {
	_id: string;
}) => {
	const { data: targetUser } = useGetNormalUser(_id);
	const { mutate: acceptFriendRequest, isPending: isPendingAccept } =
		useAcceptFriendRequest();
	const { mutate: rejectFriendRequest, isPending: isPendingReject } =
		useRejectFriendRequest();
	const { isFetching: isCurrentUserFetching } = useGetCurrentUser();

	// useEffect(() => {});
	if (!targetUser) return;
	return (
		<div className="group/friend relative flex w-[120px] flex-col justify-center gap-1 rounded border border-muted bg-muted/50 p-2 text-center transition-all duration-150 hover:border-muted-foreground/40">
			<MemberIcon _id={targetUser._id} _size="lg" className="mx-auto" />
			<p className="text-primary" style={{ overflowWrap: "break-word" }}>
				{targetUser?.name || "name"}
			</p>
			<p
				className="text-muted-foreground text-sm"
				style={{
					overflowWrap: "break-word",
				}}
			>
				@{targetUser?.handle}
			</p>
			<div className=" flex gap-[2px]">
				<Button
					variant="ghost"
					size={"sm"}
					className="h-6 border border-red-700 px-[6px] text-[12px]"
					onClick={() => {
						rejectFriendRequest(targetUser._id);
					}}
					disabled={isPendingReject || isCurrentUserFetching}
				>
					{isPendingReject ? (
						<Icons.spinner className="mx-auto h-4 w-4 animate-spin" />
					) : (
						"Reject"
					)}
				</Button>
				<Button
					variant="ghost"
					size={"sm"}
					className="h-6 border border-green-700 px-[6px] text-[12px]"
					onClick={() => {
						acceptFriendRequest(targetUser._id);
					}}
					disabled={isPendingAccept || isCurrentUserFetching}
				>
					{isPendingAccept ? (
						<Icons.spinner className="mx-auto h-4 w-4 animate-spin" />
					) : (
						"Accept"
					)}
				</Button>
			</div>
		</div>
	);
};

const Recent = ({
	_id,
	currentUser,
}: {
	_id: string;
	currentUser?: CurrentUser | null;
}) => {
	const { data: targetUser } = useGetNormalUser(_id);
	const { mutate: addFriend, isPending: isPendingAdd } = useSendFriendRequest();
	const { mutate: cancelFriendRequest, isPending: isPendingCancel } =
		useCancelFriendRequest();
	const { mutate: rejectFriendRequest, isPending: isPendingReject } =
		useRejectFriendRequest();
	const { mutate: acceptFriendRequest, isPending: isPendingAccept } =
		useAcceptFriendRequest();
	const { isFetching: isCurrentUserFetching } = useGetCurrentUser();

	if (currentUser?._id === _id) return;
	if (!targetUser) return;
	if (currentUser?.friends.includes(_id)) return;
	return (
		<div className=" relative flex w-[120px] flex-col justify-center gap-1 rounded border border-muted bg-muted/50 p-2 text-center transition-all duration-150 hover:border-muted-foreground/40">
			{targetUser && (
				<MemberIcon _id={targetUser._id} _size="lg" className="mx-auto" />
			)}
			<p className="text-primary" style={{ overflowWrap: "break-word" }}>
				{targetUser.name || "name"}
			</p>
			<p
				className="text-muted-foreground text-sm"
				style={{
					overflowWrap: "break-word",
				}}
			>
				@{targetUser.handle}
			</p>
			<div className=" flex justify-center ">
				{currentUser?.friendReqsReceived.includes(_id) ? (
					<div className=" flex gap-[2px]">
						<Button
							variant="ghost"
							size={"sm"}
							className="h-6 border border-red-700 px-[6px] text-[12px]"
							onClick={() => {
								rejectFriendRequest(_id);
							}}
							disabled={isPendingReject || isCurrentUserFetching}
						>
							{isPendingReject ? (
								<Icons.spinner className="mx-auto h-4 w-4 animate-spin" />
							) : (
								"Reject"
							)}
						</Button>
						<Button
							variant="ghost"
							size={"sm"}
							className="h-6 border border-green-700 px-[6px] text-[12px]"
							onClick={() => {
								acceptFriendRequest(_id);
							}}
							disabled={isPendingAccept || isCurrentUserFetching}
						>
							{isPendingAccept ? (
								<Icons.spinner className="mx-auto h-4 w-4 animate-spin" />
							) : (
								"Accept"
							)}
						</Button>
					</div>
				) : currentUser?.friendReqsSent.includes(_id) ? (
					<Button
						variant="ghost"
						size={"sm"}
						className="h-6 border border-red-700 px-[6px] text-[12px]"
						onClick={() => {
							cancelFriendRequest(_id);
						}}
						disabled={isPendingCancel || isCurrentUserFetching}
					>
						{isPendingCancel ? (
							<Icons.spinner className="mx-auto h-4 w-4 animate-spin" />
						) : (
							"Cancel Request"
						)}
					</Button>
				) : (
					<Button
						variant="ghost"
						size={"sm"}
						className="h-6 border border-green-700 px-[6px] text-[12px]"
						onClick={() => {
							addFriend(_id);
						}}
						disabled={isPendingAdd || isCurrentUserFetching}
					>
						{isPendingAdd ? (
							<Icons.spinner className="mx-auto h-4 w-4 animate-spin" />
						) : (
							"Add Friend"
						)}
					</Button>
				)}
			</div>
		</div>
	);
};
