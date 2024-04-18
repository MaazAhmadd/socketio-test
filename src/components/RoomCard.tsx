import { cn, getHexColorFromString } from "@/lib/utils";
import { DecodedUser, Member, Room } from "server/types/types";
import React from "react";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { useFetchFriendlist } from "@/hooks/userHooks";
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
      <div className="flex h-[100px] justify-between gap-4">
        {room.videoPlayer?.thumbnailUrl ? (
          <img
            src={room.videoPlayer?.thumbnailUrl}
            alt=""
            className="w-full min-w-[100px] max-w-[150px] object-contain"
          />
        ) : (
          <div className="w-full min-w-[100px] max-w-[150px] bg-slate-400"></div>
        )}
        <div className="flex w-full flex-col justify-between py-1 pr-2">
          <div className="text-sm font-bold leading-tight md:text-base">
            {room.videoPlayer?.title}
          </div>
          <div className="flex">
            <div className="no-scrollbar flex gap-2 overflow-x-scroll">
              {room.members.map((m) => {
                return (
                  <MemberPfpIcon key={m.handle} m={m} className="size-[42px]" />
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

export const MemberPfpIcon = ({
  m,
  className,
}: {
  m: Member | DecodedUser;
  className?: string;
}) => {
  const { data: friendlist } = useFetchFriendlist();
  const isFriend = friendlist?.includes(m.handle);

  const randomColor = getHexColorFromString(m.handle);

  return m.pfp ? (
    <img
      src={m.pfp}
      alt=""
      key={m.handle}
      className={cn(
        "size-[42px] rounded-full border border-muted p-[2px]",
        isFriend ? "border-primary" : "", // if friend
        className,
      )}
    />
  ) : (
    <div
      key={m.handle}
      style={{
        backgroundImage: `linear-gradient(to bottom, ${randomColor} 0%, ${randomColor} 100%), linear-gradient(to bottom, hsl(var(--muted)) 0%, hsl(var(--muted)) 100%)`,
        backgroundClip: "content-box, padding-box",
      }}
      className={cn(
        "size-[42px] rounded-full border border-muted p-[2px]",
        isFriend ? "border-primary" : "", // if friend
        className,
      )}
    ></div>
  );
};
export default RoomCard;
