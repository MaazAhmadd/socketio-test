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

export function formatTime(seconds: number): string {
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);

	const formattedMinutes = String(minutes % 60).padStart(2, "0");
	const formattedSeconds = String(seconds % 60).padStart(2, "0");

	if (hours > 0) {
		const formattedHours = String(hours).padStart(2, "0");
		return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
	}
	if (minutes > 0) {
		return `${formattedMinutes}:${formattedSeconds}`;
	}
	return `00:${formattedSeconds}`;
}


export function trimString(str: string, max = 40) {
	return str.length > max ? `${str.slice(0, max)}...` : str;
}
 