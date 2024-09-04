import api from "@/api";
import { isValidJwt } from "@/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { CurrentUser, NormalUser } from "server/src/types";

export const useLoginUser = () => {
  const loginUser = async (formData: Record<string, any>) => {
    try {
      const response = await api.post<string>("/user/login/", formData);
      // if (response.data && isValidJwt(response.data)) {
      //   localStorage.setItem("auth_token", response.data);
      //   window.location.reload();
      // }
      return response.data;
    } catch (error) {
      console.error("|| error in useLoginUser", error);
      throw error;
    }
  };

  return useMutation<string, Error, Record<string, any>>({
    mutationFn: loginUser,
    onSuccess: (data) => {
      if (data && isValidJwt(data)) {
        localStorage.setItem("auth_token", data);
        window.location.reload();
      }
    },
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
    return Boolean(parseInt(response.data));
  };
  return useQuery<boolean, Error>({
    queryKey: ["checkuser", debouncedValue],
    queryFn: checkUser,
    enabled: !isStateError,
  });
};
export const useRegisterUser = () => {
  const registerUser = async (formData: Record<string, any>) => {
    try {
      const response = await api.post("/user/register/", formData);
      // if (response.data && isValidJwt(response.data)) {
      //   localStorage.setItem("auth_token", response.data);
      //   window.location.reload();
      //   // navigate("/home");
      // }
      return response.data;
    } catch (error) {
      console.error("|| error in useRegisterUser", error);
      throw error;
    }
  };

  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      if (data && isValidJwt(data)) {
        localStorage.setItem("auth_token", data);
        window.location.reload();
      }
    },
    onError: (error) => toast.error(error.message),
  });
};
export const useUpdateUserName = () => {
  const queryClient = useQueryClient();
  const updateUsername = async (newName: string) => {
    const response = await api.put("/user/updateusername", { name: newName });
    return response.data;
  };
  return useMutation({
    mutationFn: updateUsername,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["currentUser"] }),
    onError: (error) => toast.error(error.message),
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
  return useMutation<CurrentUser, Error, string>({
    mutationFn: updateUserHandle,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["currentUser"] }),
    onError: (error) => toast.error(error.message),
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
  return useMutation<CurrentUser, Error, string>({
    mutationFn: updateUserPassword,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["currentUser"] }),
    onError: (error) => toast.error(error.message),
  });
};
export const useGetNormalUser = (idOrHandle: string) => {
  const getUser = async () => {
    const response = await api.get("/user/getuser/" + idOrHandle);
    return response.data;
  };
  return useQuery<NormalUser>({
    queryKey: ["user", idOrHandle],
    queryFn: getUser,
  });
};
export const useGetCurrentUser = () => {
  const getCurrentUser = async () => {
    const response = await api.get("/user/getCurrentUser");
    return response.data;
  };
  return useQuery<CurrentUser>({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    gcTime: 0,
    staleTime: 0,
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
  return useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["user", variables] });
    },
  });
};

export const useCancelFriendRequest = () => {
  const queryClient = useQueryClient();
  const cancelFriendRequest = async (receiverId: string) => {
    const response = await api.post("/user/cancelFriendRequest/" + receiverId);

    return response.data;
  };
  return useMutation({
    mutationFn: cancelFriendRequest,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["user", variables] });
    },
  });
};

export const useAcceptFriendRequest = () => {
  const queryClient = useQueryClient();
  const acceptFriendRequest = async (senderId: string) => {
    const response = await api.post("/user/acceptFriendRequest/" + senderId);
    return response.data;
  };
  return useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["user", variables] });
    },
  });
};

export const useRejectFriendRequest = () => {
  const queryClient = useQueryClient();
  const rejectFriendRequest = async (senderId: string) => {
    const response = await api.post("/user/rejectFriendRequest/" + senderId);

    return response.data;
  };
  return useMutation({
    mutationFn: rejectFriendRequest,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["user", variables] });
    },
  });
};

export const useRemoveFriend = () => {
  const queryClient = useQueryClient();
  const removeFriend = async (friendId: string) => {
    const response = await api.post("/user/removeFriend/" + friendId);
    return response.data;
  };

  return useMutation({
    mutationFn: removeFriend,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["user", variables] });
    },
  });
};
