import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogOverlay,
	DialogTitle
} from "@/components/ui/dialog";
import { useGlobalStore } from "@/store";

function RoomJoinDialog() {
	const { roomJoinDialogShown, setRoomJoinDialogShown } = useGlobalStore(
		(s) => ({
			roomJoinDialogShown: s.roomJoinDialogShown,
			setRoomJoinDialogShown: s.setRoomJoinDialogShown,
		}),
	);
	return (
		<Dialog open={roomJoinDialogShown}>
			<DialogOverlay className="bg-black/40" />
			<DialogContent className="sm:max-w-[425px]" showClose={false}>
				<DialogHeader>
					<DialogTitle>Join Room</DialogTitle>
					<DialogDescription>
						you're about to join a room, be respectful to others
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button type="button" onClick={() => setRoomJoinDialogShown(false)}>
						Join
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default RoomJoinDialog;
