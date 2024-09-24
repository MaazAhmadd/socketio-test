import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api";
import { Room, SupportedPlatforms, VideoInfo } from "server/src/types";
import { useRoomStore } from "@/store";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

export const useGetUserRooms = () => {
	type ReturnObj = {
		publicRooms: Room[];
		friendsRooms: Room[];
		invitedRooms: Room[];
	};
	async function getUserRooms() {
		const response = await api.get("/room/userrooms");
		console.log("[useGetUserRooms] all rooms: ", response.data);
		return response.data;
	}
	return useQuery<ReturnObj>({
		queryKey: ["rooms"],
		queryFn: getUserRooms,
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

export const useMakeRoom = () => {
	const { setRoomData, setMics, setLoading } = useRoomStore((s) => ({
		setRoomData: s.setRoomData,
		setMics: s.setMics,
		setLoading: s.setLoading,
	}));
	const navigate = useNavigate();
	const makeRoom = async (url: string) => {
		const response = await api.post<Room>("/room/makeRoom", { url });
		return response.data;
	};

	return useMutation({
		mutationFn: makeRoom,
		onError: (error) => {
			type ErrorResponse = {
				message: string;
				nextAvailableTime: number;
			};
			const err = error as AxiosError<ErrorResponse>;
			if (err.response) {
				toast.error(err.response.data.message);
			}
		},
		onSuccess: (data) => {
			if (data) {
				const mics = data.activeMembersList?.pop();
				setMics(mics!);
				setRoomData(data);
				setLoading(true);
				navigate("/room/" + data?.entityId!);
			}
		},
	});
};

export const useGetRoom = () => {
	const { id: roomId } = useParams();
	const { setRoomData, setMics } = useRoomStore((s) => ({
		setRoomData: s.setRoomData,
		setMics: s.setMics,
	}));
	// "/room/getRoom/:roomId"
	const getRoom = async () => {
		const response = await api.get<Room>("/room/getRoom/" + roomId);
		setMics(response.data.activeMembersList?.pop()!);
		setRoomData(response.data);
		return response.data;
	};
	return useQuery({
		queryKey: ["room", roomId],
		queryFn: getRoom,
	});
};
