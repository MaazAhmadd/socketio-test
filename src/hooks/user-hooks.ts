import api from "@/api";
import { isValidJwt } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import { CurrentUser, NormalUser } from "server/src/types";

type ResError = AxiosError<{ error: string }>;
export const useLoginUser = () => {
	type FormData = Record<string, any>;
	const loginUser = async (formData: FormData) => {
		const response = await api.post<string>("/user/login/", formData);
		return response.data;
	};

	return useMutation<string, ResError, FormData>({
		mutationFn: loginUser,
		onSuccess: (data) => {
			if (data && isValidJwt(data)) {
				localStorage.setItem("auth_token", data);
				window.location.reload();
			}
		},
		onError: (error) => toast.error(error.response?.data?.error!),
	});
};
export const useCheckUser = (
	handle: string,
	debouncedValue: string,
	isStateError: boolean,
) => {
	const checkUser = async () => {
		const response = await api.get<string>("/user/check", {
			params: { q: handle },
		});
		return Boolean(Number.parseInt(response.data));
	};
	return useQuery<boolean, ResError>({
		queryKey: ["checkuser", debouncedValue],
		queryFn: checkUser,
		enabled: !isStateError,
	});
};
export const useRegisterUser = () => {
	type FormData = Record<string, any>;
	const registerUser = async (formData: FormData) => {
		try {
			const response = await api.post<string>("/user/register/", formData);
			return response.data;
		} catch (error) {
			console.error("|| error in useRegisterUser", error);
			throw error;
		}
	};

	return useMutation<string, ResError, FormData>({
		mutationFn: registerUser,
		onSuccess: (data) => {
			if (data && isValidJwt(data)) {
				localStorage.setItem("auth_token", data);
				window.location.reload();
			}
		},
		onError: (error) => toast.error(error.response?.data.error!),
	});
};
export const useUpdateUserName = () => {
	const queryClient = useQueryClient();
	const updateUsername = async (newName: string) => {
		const response = await api.put<string>("/user/updateusername", {
			name: newName,
		});
		return response.data;
	};
	return useMutation<string, ResError, string>({
		mutationFn: updateUsername,
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["currentUser"] }),
		onError: (error) => toast.error(error.response?.data.error!),
	});
};
export const useUpdateUserHandle = () => {
	const queryClient = useQueryClient();
	const updateUserHandle = async (newHandle: string) => {
		const response = await api.put<CurrentUser>("/user/updateuserhandle", {
			handle: newHandle,
		});
		return response.data;
	};
	return useMutation<CurrentUser, ResError, string>({
		mutationFn: updateUserHandle,
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["currentUser"] }),
		onError: (error) => toast.error(error.response?.data.error!),
	});
};
export const useUpdateUserPassword = () => {
	const queryClient = useQueryClient();
	const updateUserPassword = async (newPassword: string) => {
		const response = await api.put<CurrentUser>("/user/updateuserpassword", {
			password: newPassword,
		});
		return response.data;
	};
	return useMutation<CurrentUser, ResError, string>({
		mutationFn: updateUserPassword,
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["currentUser"] }),
		onError: (error) => toast.error(error.response?.data.error!),
	});
};
export const useGetNormalUser = (idOrHandle: string) => {
	const getUser = async () => {
		const response = await api.get("/user/getuser/" + idOrHandle);
		return response.data;
	};
	return useQuery<NormalUser, ResError>({
		queryKey: ["user", idOrHandle],
		queryFn: getUser,
		staleTime: 1000 * 60 * 60, // 1 hour
	});
};
export const useGetCurrentUser = () => {
	const getCurrentUser = async () => {
		const response = await api.get("/user/getCurrentUser");
		return response.data;
	};
	return useQuery<CurrentUser, ResError>({
		queryKey: ["currentUser"],
		queryFn: getCurrentUser,
		staleTime: 1000 * 60 * 60, // 1 hour
		// gcTime: 0,
	});
};

// const friendRoutes = {
// "/user/sendFriendRequest/:receiverHandle": true,
// "/user/cancelFriendRequest/:receiverHandle": true,
// "/user/acceptFriendRequest/:senderHandle": true,
// "/user/rejectFriendRequest/:senderHandle": true,
// "/user/removeFriend/:friendHandle": true,
// "/user/fetchFriendlist": true,
// "/user/fetchFriendRequestsReceived": true,
// "/user/fetchFriendRequestsSent": true,
// };
export const useSendFriendRequest = () => {
	const queryClient = useQueryClient();
	const sendFriendRequest = async (receiverId: string): Promise<string> => {
		const response = await api.post<string>(
			"/user/sendFriendRequest/" + receiverId,
		);
		return response.data;
	};
	return useMutation<string, ResError, string>({
		mutationFn: sendFriendRequest,
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({ queryKey: ["currentUser"] });
			queryClient.invalidateQueries({ queryKey: ["user", variables] });
		},
		onError: (error) => toast.error(error.response?.data.error!),
	});
};

export const useCancelFriendRequest = () => {
	const queryClient = useQueryClient();
	const cancelFriendRequest = async (receiverId: string) => {
		const response = await api.post<string>(
			"/user/cancelFriendRequest/" + receiverId,
		);
		return response.data;
	};
	return useMutation<string, ResError, string>({
		mutationFn: cancelFriendRequest,
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({ queryKey: ["currentUser"] });
			queryClient.invalidateQueries({ queryKey: ["user", variables] });
		},
		onError: (error) => toast.error(error.response?.data.error!),
	});
};

export const useAcceptFriendRequest = () => {
	const queryClient = useQueryClient();
	const acceptFriendRequest = async (senderId: string) => {
		const response = await api.post<string>(
			"/user/acceptFriendRequest/" + senderId,
		);
		return response.data;
	};
	return useMutation<string, ResError, string>({
		mutationFn: acceptFriendRequest,
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({ queryKey: ["currentUser"] });
			queryClient.invalidateQueries({ queryKey: ["user", variables] });
		},
		onError: (error) => toast.error(error.response?.data.error!),
	});
};

export const useRejectFriendRequest = () => {
	const queryClient = useQueryClient();
	const rejectFriendRequest = async (senderId: string) => {
		const response = await api.post<string>(
			"/user/rejectFriendRequest/" + senderId,
		);
		return response.data;
	};
	return useMutation<string, ResError, string>({
		mutationFn: rejectFriendRequest,
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({ queryKey: ["currentUser"] });
			queryClient.invalidateQueries({ queryKey: ["user", variables] });
		},
		onError: (error) => toast.error(error.response?.data.error!),
	});
};

export const useRemoveFriend = () => {
	const queryClient = useQueryClient();
	const removeFriend = async (friendId: string) => {
		const response = await api.post<string>("/user/removeFriend/" + friendId);
		return response.data;
	};
	return useMutation<string, ResError, string>({
		mutationFn: removeFriend,
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({ queryKey: ["currentUser"] });
			queryClient.invalidateQueries({ queryKey: ["user", variables] });
		},
		onError: (error) => toast.error(error.response?.data.error!),
	});
};
