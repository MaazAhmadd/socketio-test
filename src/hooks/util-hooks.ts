import { useState, useEffect, useCallback } from "react";

export function useDebounce(value: any, delay: number) {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
}

export function useWindowSize() {
	const [windowSize, setWindowSize] = useState({
		width: window.innerWidth,
		height: window.innerHeight,
	});

	useEffect(() => {
		const handleResize = () => {
			setWindowSize({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		};

		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);
	return windowSize;
}

const useFullscreen = () => {
	const [isFullscreen, setIsFullscreen] = useState(false);

	const enterFullscreen = useCallback(() => {
		if (document.documentElement.requestFullscreen) {
			document.documentElement.requestFullscreen();
		}
		setIsFullscreen(true);
	}, []);

	const exitFullscreen = useCallback(() => {
		if (document.exitFullscreen) {
			document.exitFullscreen();
		}
		setIsFullscreen(false);
	}, []);

	return { isFullscreen, enterFullscreen, exitFullscreen };
};

export default useFullscreen;
