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
        <div className="flex w-full flex-col justify-between py-2 pr-1">
          <div className="text-sm font-bold leading-tight md:text-base">
            {room.videoPlayer?.title}
          </div>
          <div className="mb-1 flex">
            <div className="no-scrollbar flex gap-2 overflow-x-scroll">
              {room.members.map((m) => {
                const randomColor = getRandomColor(m.handle);
                return (m.profilePicture as string) ? (
                  <img
                    src={m.profilePicture as string}
                    alt=""
                    key={m.handle}
                    className={cn(
                      "size-[42px] rounded-full border border-muted p-[2px]",
                      false ? "border-primary" : "", // if friend
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
                      false ? "border-primary" : "", // if friend
                    )}
                  ></div>
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
function getRandomColor(text: string): string {
  // Create an MD5 hash of the input text
  const hash = textToHash(text);

  // Take the first 6 characters of the hash as the color code
  const colorCode = "#" + hash.substring(0, 6);

  return colorCode;
}

function textToHash(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32-bit integer
  }

  // Convert the hash to a valid hexadecimal string
  const validHex = (hash >>> 0).toString(16);

  // Pad with zeros if needed to ensure 6 characters
  const paddedHex = validHex.padStart(6, "0");

  return paddedHex;
}

// Example usage:
// const inputText = "user2handle";
// const randomColor = getRandomColor(inputText);
// console.log(`Color for '${inputText}': ${randomColor}`);
