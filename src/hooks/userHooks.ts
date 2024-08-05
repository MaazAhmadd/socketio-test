import api from "@/api/api";
import { isValidJwt } from "@/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CurrentUser, NormalUser } from "server/src/types";

export const useLoginUser = () => {
  const loginUser = async (formData: Record<string, any>) => {
    try {
      const response = await api.post("/user/login/", formData);
      if (response.data && isValidJwt(response.data)) {
        localStorage.setItem("auth_token", response.data);
        window.location.reload();
      }
      // await new Promise((resolve): any => setTimeout(() => resolve(""), 10));
      return response.data;
    } catch (error) {
      console.error("|| error in useLoginUser", error);
      throw error;
    }
  };

  return useMutation({ mutationFn: loginUser });
};
export const useCheckUser = (
  handle: string,
  debouncedValue: string,
  isStateError: any,
) => {
  const checkUser = async () => {
    if (!handle) return "empty user not checked";
    const response = await api.get("/user/check?q=" + handle);
    console.log("user checked: ", response.data);

    return response.data;
  };
  return useQuery<Boolean>({
    queryKey: ["checkuser", debouncedValue],
    queryFn: checkUser,
    enabled: !isStateError,
  });
};
export const useRegisterUser = () => {
  const registerUser = async (formData: Record<string, any>) => {
    try {
      const response = await api.post("/user/register/", formData);
      if (response.data && isValidJwt(response.data)) {
        localStorage.setItem("auth_token", response.data);
        window.location.reload();
      }
      return response.data;
    } catch (error) {
      console.error("|| error in useRegisterUser", error);
      throw error;
    }
  };

  return useMutation({ mutationFn: registerUser });
};

export const useUpdateUserName = () => {
  const queryClient = useQueryClient();
  const updateUsername = async (newName: string) => {
    const response = await api.put("/user/updateusername", { name: newName });
    queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    return response.data;
  };
  return useMutation({ mutationFn: updateUsername });
};
export const useUpdateUserHandle = () => {
  const queryClient = useQueryClient();
  const updateUserHandle = async (newHandle: string) => {
    const response = await api.put("/user/updateuserhandle", {
      handle: newHandle,
    });
    queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    return response.data;
  };
  return useMutation({ mutationFn: updateUserHandle });
};
export const useUpdateUserPassword = () => {
  const queryClient = useQueryClient();
  const updateUserPassword = async (newPassword: string) => {
    const response = await api.put("/user/updateuserpassword", {
      password: newPassword,
    });
    queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    return response.data;
  };
  return useMutation({ mutationFn: updateUserPassword });
};

export const useGetUser = (idOrHandle: string) => {
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
  const sendFriendRequest = async (receiverId: string) => {
    const response = await api.post("/user/sendFriendRequest/" + receiverId);
    queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    return response.data;
  };
  return useMutation({ mutationFn: sendFriendRequest });
};

export const useCancelFriendRequest = () => {
  const queryClient = useQueryClient();
  const cancelFriendRequest = async (receiverId: string) => {
    const response = await api.post("/user/cancelFriendRequest/" + receiverId);
    queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    return response.data;
  };
  return useMutation({ mutationFn: cancelFriendRequest });
};

export const useAcceptFriendRequest = () => {
  const queryClient = useQueryClient();
  const acceptFriendRequest = async (senderId: string) => {
    const response = await api.post("/user/acceptFriendRequest/" + senderId);
    queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    return response.data;
  };
  return useMutation({ mutationFn: acceptFriendRequest });
};

export const useRejectFriendRequest = () => {
  const queryClient = useQueryClient();
  const rejectFriendRequest = async (senderId: string) => {
    const response = await api.post("/user/rejectFriendRequest/" + senderId);
    queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    return response.data;
  };
  return useMutation({ mutationFn: rejectFriendRequest });
};

export const useRemoveFriend = () => {
  const queryClient = useQueryClient();
  const removeFriend = async (friendId: string) => {
    const response = await api.post("/user/removeFriend/" + friendId);
    queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    return response.data;
  };

  return useMutation({ mutationFn: removeFriend });
};

// export const useFetchFriendlist = () => {
//   const fetchFriendlist = async () => {
//     const response = await api.get("/user/fetchFriendlist");
//     return response.data;
//   };
//   return useQuery<string[]>({
//     queryKey: ["friendList"],
//     queryFn: fetchFriendlist,
//   });
// };
// export const useFetchFriendRequestsSent = () => {
//   const fetchFriendRequestsSent = async () => {
//     const response = await api.get("/user/fetchFriendRequestsSent");
//     return response.data;
//   };
//   return useQuery<string[]>({
//     queryKey: ["friendRequestsSent"],
//     queryFn: fetchFriendRequestsSent,
//   });
// };
// export const useFetchFriendRequestsReceived = () => {
//   const fetchFriendRequestsReceived = async () => {
//     const response = await api.get("/user/fetchFriendRequestsReceived");
//     return response.data;
//   };
//   return useQuery<string[]>({
//     queryKey: ["friendRequestsReceived"],
//     queryFn: fetchFriendRequestsReceived,
//   });
// };
