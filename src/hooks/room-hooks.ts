import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api";
import { Room, SupportedPlatforms, VideoInfo } from "server/src/types";
import { usePlayerStore, useRoomStore } from "@/store";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

export type AllRoomsObject = {
	publicRooms: Room[];
	friendsRooms: Room[];
	invitedRooms: Room[];
};
export const useGetUserRooms = () => {
	async function getUserRooms() {
		const response = await api.get("/room/userrooms"); 
		return response.data;
	}
	return useQuery<AllRoomsObject>({
		queryKey: ["rooms"],
		queryFn: getUserRooms,
		staleTime: 60 * 1000 * 5, // 5 minutes
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
	const { setUrl, setDuration, setPlaying } = usePlayerStore((s) => ({
		setUrl: s.setUrl,
		setDuration: s.setDuration,
		setPlaying: s.setPlaying,
	}));
	const navigate = useNavigate();
	const makeRoom = async ({
		url,
		duration,
	}: { url: string; duration: number }) => {
		const response = await api.post<Room>("/room/makeRoom", { url, duration });
		return response.data;
	};

	return useMutation({
		mutationFn: makeRoom,
		onSuccess: (data) => {
			if (data) {
				// const [duration, progress, lastChanged, status, type] =
				// 	data.playerStats;
				const mics = data.activeMembersList?.pop();
				setMics(mics!);
				setRoomData(data);
				setUrl(data.videoUrl);
				setDuration(data.playerStats[0]);
				setLoading(true);
				navigate("/room/" + data?.entityId!);
			}
		},
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
