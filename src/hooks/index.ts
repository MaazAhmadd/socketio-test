import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";

export const useGetAllRooms = () => {
  async function getAllRooms() {
    const response = await api.get("/room/allrooms");
    return response.data;
  }
  return useQuery({
    queryKey: ["rooms"],
    queryFn: getAllRooms,
  });
};
