import { cn } from "@/lib/utils";
import { Room } from "server/types/types";
import React from "react";
import { ChevronRightIcon } from "@radix-ui/react-icons";
interface RoomCardProps {
  room: Room;
  className?: string;
  onClick?: () => void;
}
const RoomCard: React.FC<RoomCardProps> = ({
  room,
  className,
  onClick,
  ...props
}) => {
  return (
    <li className={cn("", className)} {...props} onClick={onClick}>
      <div className="flex gap-4">
        <img
          src={room.videoPlayer?.thumbnailUrl}
          alt=""
          className="w-full min-w-[100px] max-w-[200px] object-contain"
        />
        <div className="flex flex-col justify-between py-2 pr-1">
          <div className="text-sm font-bold leading-tight md:text-base">
            {room.videoPlayer?.title}
          </div>
          <div className="mb-1 flex">
            <div className="no-scrollbar flex gap-2 overflow-x-scroll">
              {room.members.map((m) => {
                return (
                  <img
                    src={m.profilePicture as string}
                    alt=""
                    className={cn(
                      "size-[42px] rounded-full border border-muted p-[2px]",
                      false ? "border-primary" : "",
                    )}
                  />
                );
              })}
            </div>
            {room.members.length > 4 && (
              <span className="ml-1 flex items-center rounded-r-sm bg-muted">
                <ChevronRightIcon className="h-3 w-3 text-muted-foreground" />
              </span>
            )}
          </div>
        </div>
      </div>
    </li>
  );
};

export default RoomCard;
