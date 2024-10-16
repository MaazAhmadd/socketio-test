import MemberIcon from "@/components/common/member-icon";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useGetCurrentUser, useGetNormalUser } from "@/hooks/user-hooks";
import {
	screenBreakpoints,
	useFullscreen,
	useWindowSize,
} from "@/hooks/util-hooks";
import { cn } from "@/lib/utils";
import { socket } from "@/socket";
import { useGlobalStore, useRoomStore } from "@/store";
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
import toast from "react-hot-toast";

export function Chat() {
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
		isLast,
	}: { message: Message; prevSender: string | null; isLast: boolean }) => {
		const type = message[0];
		const sender = message[1];
		const time = message[2];
		const msg = message[3];
		/*
			[type,sender,time,msg]
			type: 
				chat------------------(0)
				join------------------(1)
				leave-----------------(2)
				kick------------------(3)
				leadership------------(4)
				micenable-------------(5)
				micdisable------------(6)
				roompublic------------(7)
				roomprivate-----------(8)
				roomfriends-----------(9)
				videovote------------(10)
				videojustplay--------(11)
				videoleaderschoice---(12)
				playingvideochanged--(13)
				roommicenable--------(14)
				roommicdisable-------(15)
*/

		const isSystemMsg = type !== 0;
		const _message = msg || "";

		const isMe = sender === user?._id;
		const isNewSender = prevSender !== sender;

		const messageClasses = cn(
			"flex w-max items-start gap-1 px-1 py-0 text-sm mt-2",
			isLast && "mb-[60px]",
			isMe && "ml-auto flex-row-reverse",
			isSystemMsg
				? "py-1"
				: isNewSender
					? "py-1"
					: isMe
						? "pr-[50px]"
						: "pl-[50px]",
		);

		const bubbleClasses = cn(
			"rounded-md border border-muted bg-background/20 px-2 py-1 max-w-[80svw] lg:max-w-[24svw]",
			isMe && "max-w-[75svw]",
			_message.length < 100 && "mt-[7px]",
			isSystemMsg && "border-muted-foreground/60",
		);
		function renderSystemMsg(msg: string) {
			return (
				<div className={messageClasses}>
					<div className={bubbleClasses}>
						<ChatText text={msg} doLineBreakCheck={false} />
					</div>
				</div>
			);
		}
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
				return renderSystemMsg("has been kicked 🦶");
			case 4: // leadership
				return renderSystemMsg("you're the leader now 👑");
			case 5: // micenable
				return renderSystemMsg("your mic has been enabled");
			case 6: // micdisable
				return renderSystemMsg("your mic has been disabled");
			case 7: // roompublic
				return renderSystemMsg("room is public, anyone can join this room");
			case 8: // roomprivate
				return renderSystemMsg("room is private, invited people can join");
			case 9: // roomfriends
				return renderSystemMsg(
					"room is friends only, friends or invited people can join",
				);
			case 10: // videovote
				return renderSystemMsg("video voting is on");
			case 11: // videojustplay
				return renderSystemMsg(
					"videos will just play without waiting for votes",
				);
			case 12: // videoleaderschoice
				return renderSystemMsg("video selection set to leader's choice only");
			case 13: // playingvideochanged
				return renderSystemMsg("Now playing: " + _message);
			case 14: // roommicenable
				return renderSystemMsg("room mic has been enabled");
			case 15: // roommicdisable
				return renderSystemMsg("room mic has been disabled");
			default: // chat
				return <></>;
		}
	};

	return (
		<>
			<ScrollArea
				hideScrollBar
				viewportRef={scrollAreaRef}
				className={cn("h-[100svh] bg-primary-foreground")}
			>
				<div className={cn("flex flex-col justify-end")}>
					<div
						className=""
						style={{
							height: `max(calc(calc(100svh - 60px) - ${messages.length * 50}px), 272px)`,
						}}
					></div>
					{messages.map((m, i, a) => (
						<ChatMessage
							message={m}
							prevSender={i === 0 ? null : String(a[i - 1][1])}
							key={String(m[2] + i + Math.random())}
							isLast={i === a.length - 1}
						/>
					))}
				</div>
			</ScrollArea>
			<ChatInput />
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
				{name}{" "}
				<span className={cn("break-words", textClassName)}>
					{textWithBreaks}
				</span>
			</div>
		);
	}
	return (
		<div>
			{name} <span className={cn(textClassName)}>{text}</span>
		</div>
	);
}
const ChatInput = () => {
	const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
	const enterButtonRef = useRef<HTMLButtonElement | null>(null);
	const chatContainerRef = useRef<HTMLDivElement | null>(null);

	const [input, setInput] = useState("");
	const { width } = useWindowSize();
	const { data: currentUser } = useGetCurrentUser();
	const addMessage = useRoomStore((s) => s.addMessage);
	const isFullscreen = useGlobalStore((s) => s.isFullscreen);

	const [bottomOffset, setBottomOffset] = useState(0);
	const mobileView = width <= screenBreakpoints.lg;
	useEffect(() => {
		const handleResize = () => {
			if (window.visualViewport) {
				const viewportHeight = window.visualViewport.height;
				const windowHeight = window.innerHeight;
				if (windowHeight - viewportHeight > 100) {
					const keyboardHeight = windowHeight - viewportHeight;
					setBottomOffset(keyboardHeight + (isFullscreen ? 50 : 0));
				} else {
					setBottomOffset(0);
				}
			}
		};
		window.visualViewport?.addEventListener("resize", handleResize);
		return () => {
			window.visualViewport?.removeEventListener("resize", handleResize);
		};
	}, [isFullscreen]);

	const handleSendMessage = (e: FormEvent) => {
		e.preventDefault();
		if (textAreaRef.current) {
			textAreaRef.current.focus();
			textAreaRef.current.style.height = "40px";
		}
		if (input.trim().length === 0) return;
		addMessage([0, currentUser?._id!, Date.now(), input]);
		socket.emit("sendMessage", input);
		setInput("");
	};
	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (mobileView && e.shiftKey && e.key === "Enter") {
			handleSendMessage(e);
		} else if (!mobileView && e.shiftKey && e.key === "Enter") {
		} else if (!mobileView && e.key === "Enter") {
			handleSendMessage(e);
		}
	};
	const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const value = e.target.value;
		setInput(value.slice(0, 512));
		if (textAreaRef.current) {
			const newLines = (value.match(/\n/g) || []).length;
			const maxLines = 3;
			const baseHeight = 40;
			const lineHeight = 20;
			textAreaRef.current.style.height = `${baseHeight + Math.min(newLines, maxLines) * lineHeight}px`;
		}
	};
	return (
		<div
			className={cn("fixed bottom-0 w-full bg-transparent py-2")}
			style={{ bottom: `${bottomOffset}px` }}
			ref={chatContainerRef}
			onKeyDown={handleKeyDown}
			// onClick={(e) => {
			// 	if (textAreaRef.current) {
			// 		textAreaRef.current.focus();
			// 	}
			// }}
		>
			<div className="flex w-full items-center space-x-[10px] px-1 lg:w-[30svw]">
				<Textarea
					style={{ resize: "none" }}
					ref={textAreaRef}
					id="message"
					placeholder="Type your message..."
					className="!max-h-[30svh] no-scrollbar h-[40px] min-h-[40px] bg-primary-foreground"
					autoComplete="off"
					value={input}
					onBlur={() => {
						// if (textAreaRef.current) {
						// 	textAreaRef.current.focus();
						// }

					}}
					onFocus={() => {
						if ("virtualKeyboard" in navigator) {
							toast.success("VirtualKeyboard API is supported!");
							const { x, y, width, height } =
								navigator.virtualKeyboard!.boundingRect;
							toast.success(
								`x: ${x}, y: ${y}, width: ${width}, height: ${height}`,
								{
									position: "top-right",
								},
							);
						} else {
							toast.success("VirtualKeyboard API is not supported");
						}
					}}

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
