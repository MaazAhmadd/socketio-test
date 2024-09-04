import React, { useEffect } from "react";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useGetCurrentUser, useGetNormalUser } from "@/hooks/userHooks";
import {
  ClientToServerEvents,
  Message,
  ServerToClientEvents,
} from "server/src/types";
import { Socket } from "socket.io-client";
import { useGlobalStore, useRoomStore } from "@/state/store";
import { MemberPfpIcon } from "@/components/RoomCard";
import { useSwipeable } from "react-swipeable";

export function Chat({
  socket,
  screen,
}: {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  screen: "mobile" | "desktop";
}) {
  const scrollAreaRef = React.useRef<HTMLDivElement | null>(null);
  const { data: user } = useGetCurrentUser();
  const [input, setInput] = React.useState("");
  const { messages } = useRoomStore((s) => ({ messages: s.messages }));
  const { setRoomMembersDrawer, setRoomSettingsDrawer } = useGlobalStore(
    (s) => ({
      setRoomMembersDrawer: s.setRoomMembersDrawer,
      setRoomSettingsDrawer: s.setRoomSettingsDrawer,
    }),
  );
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      setRoomMembersDrawer(true);
      console.log("User Swiped left");
    },
  });
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
      });
    }
  }, [messages.length]);

  const handleSendMessage = (event: React.FormEvent) => {
    event.preventDefault();
    if (input.trim().length === 0) return;
    socket.emit("sendMessage", input);
    setInput("");
  };

  const renderMessage = (message: Message, index: number) => {
    const isSystemMsg = Boolean(message.system);
    const _message = splitLongWords(message.msg);
    const isMe = message.sender === user?._id;
    const isNewSender =
      !messages[index - 1] || messages[index - 1].sender !== message.sender;

    const messageClasses = cn(
      "flex w-max items-start gap-1 px-1 py-0 text-sm",
      isMe ? "ml-auto" : "",
      isSystemMsg
        ? "py-1"
        : isNewSender
          ? "py-1"
          : isMe
            ? "pr-[50px]"
            : "pl-[50px]",
    );

    const bubbleClasses = cn(
      "rounded-md border border-muted bg-background/20 px-2 py-1",
      screen === "mobile"
        ? isMe
          ? "max-w-[75vw]"
          : "max-w-[80vw]"
        : "max-w-[24vw]",
      _message.length < 100 && "mt-[7px]",
    );

    return (
      <div key={message.id} className={messageClasses}>
        {!isMe && (isSystemMsg || isNewSender) && (
          <MemberPfpIcon _id={message.sender} />
        )}
        <div className={bubbleClasses}>
          {((!isMe && isNewSender) || isSystemMsg) && (
            <Name sender={message.sender} isSystemMsg={isSystemMsg} />
          )}
          {isSystemMsg && _message.includes("joined") && (
            <span className="text-green-500">{_message}</span>
          )}
          {isSystemMsg && _message.includes("left") && (
            <span className="text-red-500">{_message}</span>
          )}
          {!isSystemMsg && _message}
        </div>
        {isMe && (isSystemMsg || isNewSender) && (
          <MemberPfpIcon _id={message.sender} />
        )}
      </div>
    );
  };

  return (
    <div {...handlers}>
      <ScrollArea hideScrollBar viewportRef={scrollAreaRef}>
        <div className={cn(screen === "mobile" ? "h-[56vh]" : "h-[89vh]")}>
          {messages.map(renderMessage)}
        </div>
      </ScrollArea>
      <div className="mt-1 h-[5vh] w-full">
        <form
          onSubmit={handleSendMessage}
          className="flex w-full items-center space-x-[10px] px-1"
        >
          <Input
            id="message"
            placeholder="Type your message..."
            className="flex-1"
            autoComplete="off"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
          <Button
            type="submit"
            size="icon"
            disabled={input.trim().length === 0}
          >
            <PaperPlaneIcon className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}

const Name = ({
  sender,
  isSystemMsg = false,
}: {
  sender: string;
  isSystemMsg?: boolean;
}) => {
  const { data: user } = useGetNormalUser(sender);
  if (!user) return null;

  let name = isSystemMsg ? user.name : user.name?.split(" ")[0] || "name";
  if (name && name.length > 24) {
    name = name.substring(0, 24) + "...";
  }

  return (
    <span className="font-bold">
      {name}
      {!isSystemMsg && ":"}{" "}
    </span>
  );
};

function splitLongWords(inputString: string, length: number = 50) {
  return inputString
    .split(" ")
    .map((word) => {
      if (word.length > length) {
        let chunks = [];
        for (let i = 0; i < word.length; i += length) {
          chunks.push(word.slice(i, i + length));
        }
        return chunks.join(" ");
      } else {
        return word;
      }
    })
    .join(" ");
}
