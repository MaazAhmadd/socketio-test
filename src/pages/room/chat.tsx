import MemberIcon from "@/components/common/member-icon";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetCurrentUser, useGetNormalUser } from "@/hooks/user-hooks";
import { cn } from "@/lib/utils";
import { socket } from "@/socket";
import { useRoomStore } from "@/store";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { useEffect, useState, useRef, ReactNode, FormEvent } from "react";
import { Message } from "server/src/types";
import DialogWrapperPfpIcon from "./dialog-wrapper-pfp-icon";
import { Textarea } from "@/components/ui/textarea";

export function Chat({ screen }: { screen: "mobile" | "desktop" }) {
	const scrollAreaRef = useRef<HTMLDivElement | null>(null);

	const { data: user } = useGetCurrentUser();
	const { messages, activeMembersList } = useRoomStore((s) => ({
		messages: s.messages,
		activeMembersList: s.roomData?.activeMembersList,
	}));

	useEffect(() => {
		if (scrollAreaRef.current) {
			scrollAreaRef.current.scrollTo({
				top: scrollAreaRef.current.scrollHeight,
			});
		}
	}, [messages.length]);

	const renderMessage = (message: Message, index: number) => {
		const isSystemMsg = Boolean(message.system);
		const _message = (message.msg && splitLongWords(message.msg)) || "";
		const isMe = message.sender === user?._id;
		const isNewSender =
			!messages[index - 1] || messages[index - 1].sender !== message.sender;

		const messageClasses = cn(
			"flex w-max items-start gap-1 px-1 py-0 text-sm mt-2",
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
			<div key={message.time} className={messageClasses}>
				{!isMe && (isSystemMsg || isNewSender) && (
					<DialogWrapperPfpIcon _id={message.sender}>
						<MemberIcon _id={message.sender} crown />
					</DialogWrapperPfpIcon>
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
					{isSystemMsg && _message.includes("mic") && (
						<span className="">{_message}</span>
					)}
					{isSystemMsg && _message.includes("kick") && (
						<span className="">{_message}</span>
					)}
					{!isSystemMsg && _message}
				</div>
				{isMe && (isSystemMsg || isNewSender) && (
					<DialogWrapperPfpIcon _id={message.sender}>
						<MemberIcon _id={message.sender} crown />
					</DialogWrapperPfpIcon>
				)}
			</div>
		);
	};

	return (
		<>
			<ScrollArea
				hideScrollBar
				viewportRef={scrollAreaRef}
				className={cn(
					"bg-primary-foreground pb-5",
					screen === "mobile" ? "h-[56vh]" : "h-[89vh]",
				)}
			>
				<div className={cn()}>{messages.map(renderMessage)}</div>
			</ScrollArea>
			<ChatInput />
		</>
	);
}

const ChatInput = () => {
	const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
	const enterButtonRef = useRef<HTMLButtonElement | null>(null);
	const [heightInc, setHeightInc] = useState(0);
	const [input, setInput] = useState("");
	const handleSendMessage = (e: FormEvent) => {
		e.preventDefault();
		if (input.trim().length === 0) return;
		socket.emit("sendMessage", input);
		setInput("");
		setHeightInc(0);
		if (textAreaRef.current) {
			textAreaRef.current.focus();
			textAreaRef.current.style.height = "40px";
		}
	};
	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (event.shiftKey && event.key === "Enter") {
			event.preventDefault();
			if (input.trim().length === 0) return;
			socket.emit("sendMessage", input);
			setInput("");
			setHeightInc(0);
			if (textAreaRef.current) {
				textAreaRef.current.focus();
				textAreaRef.current.style.height = "40px";
			}
		}
	};
	return (
		<div
			className="fixed bottom-0 w-full bg-primary-foreground py-2"
			onKeyDown={handleKeyDown}
		>
			<div className="flex w-full items-center space-x-[10px] px-1">
				<Textarea
					style={{ resize: "none" }}
					ref={textAreaRef}
					id="message"
					placeholder="Type your message..."
					className="h-10 max-h-min min-h-min"
					autoComplete="off"
					value={input}
					aria-autocomplete="none"
					onChange={(e) => {
						const value = e.target.value;
						setInput(value);
						const isNewLineChar = value[value.length - 1] === "\n";

						if (isNewLineChar) {
							setHeightInc((v) => v + 1);
						}
						if (textAreaRef.current) {
							if (heightInc === 1) {
								textAreaRef.current.style.height = "60px";
							}
							if (heightInc === 10) {
								textAreaRef.current.style.height = "120px";
							}
						}
					}}
				/>
				<Button
					ref={enterButtonRef}
					size="icon"
					disabled={input.trim().length === 0}
					onClick={handleSendMessage}
				>
					<PaperPlaneIcon className="h-4 w-4" />
					<span className="sr-only">Send</span>
				</Button>
			</div>
		</div>
	);
};

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

function splitLongWords(inputString: string, length = 50) {
	return inputString
		.split(" ")
		.map((word) => {
			if (word.length > length) {
				const chunks = [];
				for (let i = 0; i < word.length; i += length) {
					chunks.push(word.slice(i, i + length));
				}
				return chunks.join(" ");
			}
			return word;
		})
		.join(" ");
}
