import MemberIcon from "@/components/common/member-icon";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useGetCurrentUser, useGetNormalUser } from "@/hooks/user-hooks";
import { socket } from "@/socket";
import React, { useState } from "react";
import { BsPersonFillAdd } from "react-icons/bs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

type Props = {
	screen: "mobile" | "desktop";
};
const MAX_SELECTIONS = 100;

export function RoomInviteDialog({ screen }: Props) {
	const [selectedInvitees, setSelectedInvitees] = useState<string[]>([]);
	const { data: currentUser } = useGetCurrentUser();

	const handleInviteSelection = (checked: boolean, _id: string) => {
		setSelectedInvitees((prev) =>
			checked ? [...prev, _id] : prev.filter((id) => id !== _id),
		);
	};

	const friends = currentUser?.friends!;
	const inviteFriends = friends?.map((_id, i) => (
		<React.Fragment key={_id}>
			<InviteListItem
				_id={_id}
				onCheckedChange={(checked) => handleInviteSelection(checked, _id)}
				checked={selectedInvitees.includes(_id)}
				disabled={selectedInvitees.length >= MAX_SELECTIONS}
			/>
			{friends.length > 1 && i < friends.length - 1 && (
				<Separator className={cn("my-1")} />
			)}
		</React.Fragment>
	));
	const filteredRecents = currentUser?.recentUsers?.filter(
		(_id) => ![...currentUser.friends, currentUser._id].includes(_id),
	)!;
	const inviteRecents = filteredRecents.map((_id, i) => (
		<React.Fragment key={_id}>
			<InviteListItem
				_id={_id}
				onCheckedChange={(checked) => handleInviteSelection(checked, _id)}
				checked={selectedInvitees.includes(_id)}
				disabled={selectedInvitees.length >= MAX_SELECTIONS}
			/>
			{filteredRecents.length > 1 && i < filteredRecents.length - 1 && (
				<Separator className={cn("my-1")} />
			)}
		</React.Fragment>
	));

	const handleInvite = () => {
		socket.emit("sendInvites", [...new Set(selectedInvitees)]);
		setSelectedInvitees([]);
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="ghost" size={screen === "mobile" ? "sm" : "default"}>
					<BsPersonFillAdd />
				</Button>
			</DialogTrigger>
			<DialogContent className="flex h-[max(550px,65svh)] max-w-[min(550px,90svw)] flex-col justify-between">
				<div className="flex flex-col">
					<DialogHeader>
						<DialogTitle className="text-center">Invite</DialogTitle>
					</DialogHeader>
					<Accordion
						type="single"
						collapsible
						className="w-full"
						defaultValue="friends"
					>
						<AccordionItem value="friends">
							<AccordionTrigger>Friends</AccordionTrigger>
							<AccordionContent>
								{inviteFriends?.length ? (
									<ScrollArea
										className={cn(
											"max-h-[300px]",
											inviteFriends.length == 1 && "h-[60px]",
											inviteFriends.length == 2 && "h-[120px]",
											inviteFriends.length == 3 && "h-[180px]",
											inviteFriends.length == 4 && "h-[240px]",
											inviteFriends.length >= 5 && "h-[300px]",
										)}
									>
										{inviteFriends}
									</ScrollArea>
								) : (
									<p>No friends</p>
								)}
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value="recents">
							<AccordionTrigger>Recents</AccordionTrigger>
							<AccordionContent>
								{inviteRecents?.length ? (
									<ScrollArea
										className={cn(
											"max-h-[300px]",
											inviteRecents.length == 1 && "h-[60px]",
											inviteRecents.length == 2 && "h-[120px]",
											inviteRecents.length == 3 && "h-[180px]",
											inviteRecents.length == 4 && "h-[240px]",
											inviteRecents.length >= 5 && "h-[300px]",
										)}
									>
										{inviteRecents}
									</ScrollArea>
								) : (
									<p>No recent users</p>
								)}
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</div>
				<DialogClose asChild>
					<Button
						disabled={!selectedInvitees.length}
						onClick={handleInvite}
						className="my-2"
					>
						Invite
					</Button>
				</DialogClose>
			</DialogContent>
		</Dialog>
	);
}

const InviteListItem = ({
	_id,
	onCheckedChange,
	checked,
	disabled,
}: {
	_id: string;
	onCheckedChange: (checked: boolean) => void;
	checked: boolean;
	disabled: boolean;
}) => {
	const { data: user } = useGetNormalUser(_id);

	if (!user) return null;

	return (
		<div
			className="mb-4 flex cursor-pointer items-center justify-between gap-4"
			onClick={() => onCheckedChange(!checked)}
		>
			<div className="flex items-center gap-4">
				<MemberIcon _id={_id} _size="sm" />
				<div className="flex flex-col items-start">
					<span className="text-gray-200">{user.name || "name"}</span>
					<span className="text-gray-400">@{user.handle}</span>
				</div>
			</div>
			<div className="pr-6">
				<Checkbox
					checked={checked}
					onCheckedChange={onCheckedChange}
					disabled={!checked && disabled}
				/>
			</div>
		</div>
	);
};
