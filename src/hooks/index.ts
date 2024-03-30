import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { Room } from "server/types/types";

export const useGetAllRooms = () => {
  async function getAllRooms() {
    const response = await api.get("/room/allrooms");
    console.log("all rooms: ", response.data);

    return response.data;
  }
  return useQuery<Room[]>({
    queryKey: ["rooms"],
    queryFn: getAllRooms,
  });
};
