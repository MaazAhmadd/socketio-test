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
