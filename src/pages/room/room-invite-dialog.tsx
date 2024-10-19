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
import { useState } from "react";
import { BsPersonFillAdd } from "react-icons/bs";

type Props = {
	screen: "mobile" | "desktop";
};
const MAX_SELECTIONS = 100;

export function RoomInviteDialog({ screen }: Props) {
	const [selectedInvitees, setSelectedInvitees] = useState<string[]>([]);
	const { data: currentUser } = useGetCurrentUser();

	const handleInviteSelection = (checked: boolean, _id: string) => {
		setSelectedInvitees((prev) =>
			checked ? [...prev, _id] : prev.filter((id) => id !== _id)
		);
	};

	const inviteFriends = currentUser?.friends?.map((_id) => (
		<InviteListItem
			key={_id}
			_id={_id}
			onCheckedChange={(checked) => handleInviteSelection(checked, _id)}
			checked={selectedInvitees.includes(_id)}
			disabled={selectedInvitees.length >= MAX_SELECTIONS}
		/>
	));

	const inviteRecents = currentUser?.recentUsers
		?.filter((_id) => ![...currentUser.friends, currentUser._id].includes(_id))
		.map((_id) => (
			<InviteListItem
				key={_id}
				_id={_id}
				onCheckedChange={(checked) => handleInviteSelection(checked, _id)}
				checked={selectedInvitees.includes(_id)}
				disabled={selectedInvitees.length >= MAX_SELECTIONS}
			/>
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
					<Accordion type="single" collapsible className="w-full" defaultValue="friends">
						<AccordionItem value="friends">
							<AccordionTrigger>Friends</AccordionTrigger>
							<AccordionContent className="max-h-[300px] overflow-y-auto">
								{inviteFriends?.length ? inviteFriends : <p>No friends</p>}
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value="recents">
							<AccordionTrigger>Recents</AccordionTrigger>
							<AccordionContent className="max-h-[300px] overflow-y-auto">
								{inviteRecents?.length ? inviteRecents : <p>No recent users</p>}
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
		<div className="mb-4 flex cursor-pointer items-center justify-between gap-4" onClick={() => onCheckedChange(!checked)}>
			<div className="flex items-center gap-4">
				<MemberIcon _id={_id} _size="sm" />
				<div className="flex flex-col items-start">
					<span className="text-gray-200">{user.name || "name"}</span>
					<span className="text-gray-400">@{user.handle}</span>
				</div>
			</div>
			<div className="pr-4">
				<Checkbox checked={checked} onCheckedChange={onCheckedChange} disabled={!checked && disabled} />
			</div>
		</div>
	);
};
