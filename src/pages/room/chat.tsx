import MemberIcon from "@/components/common/member-icon";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useGetCurrentUser, useGetNormalUser } from "@/hooks/user-hooks";
import { useWindowSize } from "@/hooks/util-hooks";
import { cn } from "@/lib/utils";
import { socket } from "@/socket";
import { useRoomStore } from "@/store";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import React, {
	FormEvent,
	ReactNode,
	useEffect,
	useRef,
	useState,
} from "react";
import { Message } from "server/src/types";
import DialogWrapperPfpIcon from "./dialog-wrapper-pfp-icon";

export function Chat({ screen }: { screen: "mobile" | "desktop" }) {
	const scrollAreaRef = useRef<HTMLDivElement | null>(null);
	const { messages } = useRoomStore((s) => ({ messages: s.messages }));
	const { data: user } = useGetCurrentUser();

	useEffect(() => {
		if (scrollAreaRef.current) {
			scrollAreaRef.current.scrollTo({
				top: scrollAreaRef.current.scrollHeight,
			});
		}
	}, [messages.length]);

	const ChatMessage = ({
		message,
		prevSender,
	}: { message: Message; prevSender: string | null }) => {
		const type = message[0];
		const sender = message[1];
		const time = message[2];
		const msg = message[3];

		const isSystemMsg = type !== 0;
		// const _message = (msg && splitLongWords(msg)) || "";
		const _message = msg || "";

		const isMe = sender === user?._id;
		const isNewSender = prevSender !== sender;

		const messageClasses = cn(
			"flex w-max items-start gap-1 px-1 py-0 text-sm mt-2",
			isMe ? "ml-auto flex-row-reverse" : "",
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
			isSystemMsg && "border-muted-foreground/60",
		);
		/*
			[type,sender,time,msg]
			type: 
				chat-----------------(0)
				join-----------------(1)
				leave----------------(2)
				kick-----------------(3)
				leadership-----------(4)
				micenable------------(5)
				micdisable-----------(6)
				roompublic-----------(7)
				roomprivate----------(8)
				roomfriends----------(9)
				videovote-----------(10)
				videojustplay-------(11)
				videoleaderschoice--(12) 
				playingvideochanged-(13)
*/
		switch (type) {
			case 0: // chat
				return (
					<div className={messageClasses}>
						{isNewSender && (
							<DialogWrapperPfpIcon _id={sender}>
								<MemberIcon _id={sender} crown />
							</DialogWrapperPfpIcon>
						)}
						<div className={bubbleClasses}>
							<ChatText
								text={_message}
								name={
									!isMe && isNewSender ? (
										<Name sender={sender} isSystemMsg={isSystemMsg} />
									) : null
								}
							/>
						</div>
					</div>
				);
			case 1: // join
				return (
					<div className={messageClasses}>
						<DialogWrapperPfpIcon _id={sender}>
							<MemberIcon _id={sender} crown />
						</DialogWrapperPfpIcon>
						<div className={bubbleClasses}>
							<ChatText
								text={"has joined"}
								doLineBreakCheck={false}
								// textClassName="text-green-500"
								name={<Name sender={sender} isSystemMsg />}
							/>
						</div>
					</div>
				);
			case 2: // leave
				return (
					<div className={messageClasses}>
						<DialogWrapperPfpIcon _id={sender}>
							<MemberIcon _id={sender} crown />
						</DialogWrapperPfpIcon>
						<div className={bubbleClasses}>
							<ChatText
								text={"has left"}
								doLineBreakCheck={false}
								// textClassName="text-red-500"
								name={<Name sender={sender} isSystemMsg />}
							/>
						</div>
					</div>
				);
			case 3: // kick
				return (
					<div className={messageClasses}>
						<div className={bubbleClasses}>
							<ChatText
								text={"has been kicked 🦶"}
								doLineBreakCheck={false}
								name={<Name sender={sender} isSystemMsg />}
							/>
						</div>
					</div>
				);
			case 4: // leadership
				return (
					<div className={messageClasses}>
						<div className={bubbleClasses}>
							<ChatText
								text={"you're the leader now 👑"}
								doLineBreakCheck={false}
							/>
						</div>
					</div>
				);
			case 5: // micenable
				return (
					<div className={messageClasses}>
						<div className={bubbleClasses}>
							<ChatText
								text={"your mic has been enabled"}
								doLineBreakCheck={false}
							// textClassName="text-green-500"
							/>
						</div>
					</div>
				);
			case 6: // micdisable
				return (
					<div className={messageClasses}>
						<div className={bubbleClasses}>
							<ChatText
								text={"your mic has been disabled"}
								doLineBreakCheck={false}
							// textClassName="text-red-500"
							/>
						</div>
					</div>
				);
			case 7: // roompublic
				return (
					<div className={messageClasses}>
						<div className={bubbleClasses}>
							<ChatText
								text={"room is public, anyone can join this room"}
								doLineBreakCheck={false}
							/>
						</div>
					</div>
				);
			case 8: // roomprivate
				return (
					<div className={messageClasses}>
						<div className={bubbleClasses}>
							<ChatText
								text={"room is private, invited people can join"}
								doLineBreakCheck={false}
							/>
						</div>
					</div>
				);
			case 9: // roomfriends
				return (
					<div className={messageClasses}>
						<div className={bubbleClasses}>
							<ChatText
								text={
									"room is friends only, friends or invited people can join"
								}
								doLineBreakCheck={false}
							/>
						</div>
					</div>
				);
			case 10: // videovote
				return (
					<div className={messageClasses}>
						<div className={bubbleClasses}>
							<ChatText text={"video voting is on"} doLineBreakCheck={false} />
						</div>
					</div>
				);
			case 11: // videojustplay
				return (
					<div className={messageClasses}>
						<div className={bubbleClasses}>
							<ChatText
								text={"videos will just play without waiting for votes"}
								doLineBreakCheck={false}
							/>
						</div>
					</div>
				);
			case 12: // videoleaderschoice
				return (
					<div className={messageClasses}>
						<div className={bubbleClasses}>
							<ChatText
								text={"video selection set to leader's choice only"}
								doLineBreakCheck={false}
							/>
						</div>
					</div>
				);
			case 13: // playingvideochanged
				return (
					<div className={messageClasses}>
						<div className={bubbleClasses}>
							<ChatText
								text={"Now playing: " + _message}
								doLineBreakCheck={false}
							/>
						</div>
					</div>
				);
			default: // chat
				return <></>;
		}
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
				<div className={cn()}>
					{messages.map((m, i, a) => (
						<ChatMessage
							message={m}
							prevSender={i === 0 ? null : String(a[i - 1][1])}
							key={m[2]}
						/>
					))}
				</div>
			</ScrollArea>
			<ChatInput screen={screen} />
		</>
	);
}
function ChatText({
	text,
	name = null,
	doLineBreakCheck = true,
	textClassName,
}: {
	text: string;
	name?: ReactNode | null;
	doLineBreakCheck?: boolean;
	textClassName?: string;
}) {
	if (doLineBreakCheck) {
		const filteredText = text.trim().replace(/\n+/g, "\n");
		const parts = filteredText.split("\n");
		const limitedParts = parts.slice(0, 50);
		const remainingParts = parts.slice(50).join(" ");
		const finalParts = [...limitedParts, remainingParts];
		const textWithBreaks = finalParts.map((part, index) => (
			<React.Fragment key={index}>
				{part}
				{index < finalParts.length - 1 && <br />}
			</React.Fragment>
		));
		return (
			<div>
				{name} <span className={cn('break-words', textClassName)}>{textWithBreaks}</span>
			</div>
		);
	}
	return (
		<div>
			{name} <span className={cn(textClassName)}>{text}</span>
		</div>
	);
}
const ChatInput = ({ screen }: { screen: "mobile" | "desktop" }) => {
	const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
	const enterButtonRef = useRef<HTMLButtonElement | null>(null);
	const [input, setInput] = useState("");
	const { width } = useWindowSize();

	const handleSendMessage = (e: FormEvent) => {
		e.preventDefault();
		if (input.trim().length === 0) return;
		socket.emit("sendMessage", input);
		setInput("");
		if (textAreaRef.current) {
			textAreaRef.current.focus();
			textAreaRef.current.style.height = "40px";
		}
	};
	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (screen === "mobile" && e.shiftKey && e.key === "Enter") {
			handleSendMessage(e);
		} else if (screen === "desktop" && e.shiftKey && e.key === "Enter") {
		} else if (screen === "desktop" && e.key === "Enter") {
			handleSendMessage(e);
		}
	};
	const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const value = e.target.value;
		setInput(value.slice(0, 512));
		if (textAreaRef.current) {
			const newLines = (value.match(/\n/g) || []).length;
			const maxLines = 10;
			const baseHeight = 40;
			const lineHeight = 20;
			textAreaRef.current.style.height = `${baseHeight + Math.min(newLines, maxLines) * lineHeight}px`;
		}
	};
	return (
		<div
			className="fixed bottom-0 w-full bg-primary-foreground py-2"
			onKeyDown={handleKeyDown}
		>
			<div className="flex w-full items-center space-x-[10px] px-1 lg:w-[30vw]">
				<Textarea
					style={{ resize: "none" }}
					ref={textAreaRef}
					id="message"
					placeholder="Type your message..."
					className="!max-h-[30vh] no-scrollbar h-[40px] min-h-[40px]"
					autoComplete="off"
					value={input}
					aria-autocomplete="none"
					onChange={onChange}
				/>
				<Button
					ref={enterButtonRef}
					size="icon"
					// disabled={input.trim().length === 0}
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

function splitLongWords(inputString: string, length = 50): string {
	return inputString.replace(/\S+/g, (word) => {
		if (word.length > length) {
			let result = "";
			for (let i = 0; i < word.length; i += length) {
				result += word.slice(i, i + length) + " ";
			}
			return result.trim();
		}
		return word;
	});
}
