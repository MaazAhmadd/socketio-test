import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getHexColorFromString(text: string): string {
	let hash = 0;
	for (let i = 0; i < text.length; i++) {
		const char = text.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash |= 0;
	}
	const validHex = (hash >>> 0).toString(16);
	const paddedHex = validHex.padStart(6, "0");
	return "#" + paddedHex.substring(0, 6);
}

export function splitMembersAndMicsArray(input: string[]): {
	mongoIDs: string[];
	mics: number[];
} {
	const result = {
		mongoIDs: [] as string[],
		mics: [] as number[],
	};
	if (!input) return result;
	input.map((item) => {
		const [mongoID, mic] = item.split(",");
		result.mongoIDs.push(mongoID);
		result.mics.push(Number(mic));
	});
	return result;
}

export function isValidJwt(jwt: string) {
	const parts = jwt.split(".");
	return parts.length === 3;
}

export function parseYouTubeDuration(duration: string): string {
	const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
	if (!match) {
		return "00:00:00";
	}

	const hours = match[1] ? Number.parseInt(match[1]) : 0;
	const minutes = match[2] ? Number.parseInt(match[2]) : 0;
	const seconds = match[3] ? Number.parseInt(match[3]) : 0;

	const formattedHours = hours > 0 ? `${hours}:` : "";
	const formattedMinutes =
		minutes < 10 && hours > 0 ? `0${minutes}` : `${minutes}`;
	const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

	return `${formattedHours}${formattedMinutes}:${formattedSeconds}`;
}
