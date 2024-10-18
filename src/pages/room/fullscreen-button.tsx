import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePlayerStore } from "@/store";
import { useEffect, useRef, useState } from "react";
import { RiFullscreenExitFill, RiFullscreenFill } from "react-icons/ri";
import ReactPlayer from "react-player";
import screenfull from "screenfull";

const FullscreenButton = () => {
	const [isBlack, setIsBlack] = useState(true);
	const { isPlayerFullscreen, playing, controls, setIsPlayerFullscreen } =
		usePlayerStore((s) => ({
			setIsPlayerFullscreen: s.setIsPlayerFullscreen,
			isPlayerFullscreen: s.isPlayerFullscreen,
			playing: s.playing,
			controls: s.controls,
		}));
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const startTimer = () => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
		timeoutRef.current = setTimeout(() => {
			setIsBlack(false);
		}, 2000);
	};
	useEffect(() => {
		startTimer();
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	return (
		<div
			className={cn(
				"absolute right-0 bottom-0 z-50 flex h-[50px] w-[100px] items-end justify-end pr-1 pb-1",
				!controls && "w-[150px]",
			)}
		>
			<Button
				variant={"outline"}
				size={"sm"}
				className={cn(
					"bg-black transition-all duration-500 ease-in-out hover:bg-black",
					"h-[38px] w-[69px]",
					!isPlayerFullscreen && "h-[30px] w-[47px] lg:h-[38px] lg:w-[69px]",
					!isBlack && "opacity-80",
					playing && "opacity-40",
					// visible ? "opacity-100" : "pointer-events-none opacity-0",
				)}
				onClick={() => {
					startTimer();
					setIsBlack(true);
					const player = document.querySelector(".react-player");
					if (player) {
						if (isPlayerFullscreen) {
							screenfull.exit();
							setIsPlayerFullscreen(false);
						} else {
							screenfull.request(player);
							setIsPlayerFullscreen(true);
						}
					}
				}}
			>
				{isPlayerFullscreen ? (
					<RiFullscreenExitFill className="size-5" />
				) : (
					<RiFullscreenFill className="size-5" />
				)}
			</Button>
		</div>
	);
};

export default FullscreenButton;
