import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { Room, SupportedPlatforms, VideoInfo } from "server/src/types";

export const useGetPublicRooms = () => {
  async function getPublicRooms() {
    const response = await api.get("/room/publicrooms");
    console.log("[useGetPublicRooms] all rooms: ", response.data);

    return response.data;
  }
  return useQuery<Room[]>({
    queryKey: ["rooms"],
    queryFn: getPublicRooms,
    staleTime: 1000 * 5, // 5 seconds
  });
};

export const useGetSearchResults = (
  query: string,
  debouncedValue: string,
  platform: SupportedPlatforms,
) => {
  const fetchFns: Record<SupportedPlatforms, (() => Promise<any>) | null> = {
    youtube: async function getYTSearchResults() {
      if (!query) {
        return null;
      }
      const response = await api.get("/ytservice/search", {
        params: {
          q: query,
        },
      });
      return response.data;
    },
    netflix: async () => {},
    prime: async () => {},
  };
  const fetchFn = fetchFns[platform];
  if (!fetchFn) {
    throw new Error(`Unsupported platform: ${platform}`);
  }
  return useQuery<VideoInfo[]>({
    queryKey: ["ytsearchresults", debouncedValue],
    queryFn: fetchFn,
  });
};
