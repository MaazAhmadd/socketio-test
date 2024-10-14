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
export function RoomInviteDialog({ screen }: Props) {
	const [selectedInvitees, setSelectedInvitees] = useState<string[]>([]);
	const { data: currentUser } = useGetCurrentUser();

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant={"ghost"} size={screen === "mobile" ? "sm" : "default"}>
					<BsPersonFillAdd />
				</Button>
			</DialogTrigger>
			<DialogContent className="flex h-[min(550px,65svh)] max-w-[min(550px,90svw)] flex-col justify-between gap-0">
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
							<AccordionContent className="max-h-[300px] overflow-y-auto">
								{currentUser?.friends.length === 0 && <p>No friends</p>}
								{currentUser?.friends.map((_id) => (
									<InviteListItem
										key={_id}
										_id={_id}
										onCheckedChange={(checked) => {
											if (checked) {
												setSelectedInvitees((prev) => [...prev, _id]);
											} else {
												setSelectedInvitees((prev) =>
													prev.filter((id) => id !== _id),
												);
											}
										}}
										checked={selectedInvitees.includes(_id)}
									/>
								))}
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value="recents">
							<AccordionTrigger>Recents</AccordionTrigger>
							<AccordionContent className="max-h-[300px] overflow-y-auto">
								{currentUser?.recentUsers.filter(
									(_id) => !currentUser?.friends.includes(_id),
								).length === 0 && <p>No recent users</p>}
								{currentUser
									?.recentUsers!.filter(
										(_id) => !currentUser?.friends.includes(_id),
									)
									.map((_id) => (
										<InviteListItem
											key={_id}
											_id={_id}
											onCheckedChange={(checked) => {
												if (checked) {
													setSelectedInvitees([...selectedInvitees, _id]);
												} else {
													setSelectedInvitees(
														selectedInvitees.filter((id) => id !== _id),
													);
												}
											}}
											checked={selectedInvitees.includes(_id)}
										/>
									))}
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</div>
				<DialogClose asChild>
					<Button
						disabled={selectedInvitees.length === 0}
						onClick={() => {
							console.log("selectedInvitees: ", selectedInvitees);
							socket.emit("sendInvites", [...new Set(selectedInvitees)]);
							setSelectedInvitees([]);
						}}
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
}: {
	_id: string;
	onCheckedChange: (checked: boolean) => void;
	checked: boolean;
}) => {
	const { data: currentUser } = useGetCurrentUser();
	const { data: user } = useGetNormalUser(_id);

	return (
		currentUser &&
		user && (
			<div
				className="mb-4 flex items-center justify-between gap-4"
				onClick={() => onCheckedChange(!checked)}
			>
				<div className="flex items-center gap-4">
					<MemberIcon _id={_id} _size="sm" />

					<div className="flex flex-col items-start">
						<div className="text-gray-200">{user.name || "name"}</div>
						<div className="mb-1 flex items-center text-gray-400">
							<span className="ml-1 text-gray-400">@{user.handle}</span>
						</div>
					</div>
				</div>

				<div className="pr-4">
					<Checkbox checked={checked} onCheckedChange={onCheckedChange} />
				</div>
			</div>
		)
	);
};
