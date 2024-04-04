import { cn } from "@/lib/utils";
import { Room } from "server/types/types";

const RoomCard = ({ room, className }: { room: Room; className?: string }) => {
  return (
    <li className={cn("", className)}>
      {room.status} | {room.members.length} | {room.members[0].handle}
    </li>
  );
};

export default RoomCard;
