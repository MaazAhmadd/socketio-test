import { useState, useEffect, useCallback, useLayoutEffect } from "react";
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

export const useFullscreen = () => {
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
export const screenBreakpoints = {
	xs: 320,
	sm: 395,
	md: 769,
	lg: 1024,
	xl: 1280,
	"2xl": 1440,
};
export function useCurrentBreakpoint() {
	type Breakpoints = keyof typeof screenBreakpoints;
	const [breakpoint, setBreakpoint] = useState<Breakpoints>("xs");

	useLayoutEffect(() => {
		const updateBreakpoint = () => {
			const width = window.innerWidth;
			let newBreakpoint: Breakpoints = "xs";
			if (width >= screenBreakpoints.sm) newBreakpoint = "sm";
			if (width >= screenBreakpoints.md) newBreakpoint = "md";
			if (width >= screenBreakpoints.lg) newBreakpoint = "lg";
			if (width >= screenBreakpoints.xl) newBreakpoint = "xl";
			if (width >= screenBreakpoints["2xl"]) newBreakpoint = "2xl";
			setBreakpoint(newBreakpoint);
		};

		updateBreakpoint();
		window.addEventListener("resize", updateBreakpoint);

		return () => window.removeEventListener("resize", updateBreakpoint);
	}, []);
	return breakpoint;
}
