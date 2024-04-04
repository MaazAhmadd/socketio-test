import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { Room } from "server/types/types";

export const useGetPublicRooms = () => {
  async function getPublicRooms() {
    const response = await api.get("/room/publicrooms");
    // console.log("all rooms: ", response.data);

    return response.data;
  }
  return useQuery<Room[]>({
    queryKey: ["rooms"],
    queryFn: getPublicRooms,
  });
};
