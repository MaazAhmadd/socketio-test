import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { isValidJwt } from "@/utils";
import { CurrentUser, DecodedUser } from "server/types/types";

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
export const useGetUser = (handle: string) => {
  const getUser = async () => {
    const response = await api.get("/user/getuser/" + handle);
    return response.data;
  };
  return useQuery<DecodedUser>({
    queryKey: ["user", handle],
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

export const useFetchFriendlist = () => {
  const fetchFriendlist = async () => {
    try {
      const response = await api.get("/user/fetchFriendlist");
      return response.data.friends;
    } catch (error) {
      console.error("|| error in useFetchFriendlist", error);
      throw error;
    }
  };
  return useQuery<string[]>({
    queryKey: ["friends"],
    queryFn: fetchFriendlist,
  });
};
export const useFetchFriendRequestsSent = () => {
  const fetchFriendRequestsSent = async () => {
    try {
      const response = await api.get("/user/fetchFriendRequestsSent");
      return response.data.friendRequestsSent;
    } catch (error) {
      console.error("|| error in useFetchFriendRequestsSent", error);
      throw error;
    }
  };
  return useQuery<string[]>({
    queryKey: ["friendRequestsSent"],
    queryFn: fetchFriendRequestsSent,
  });
};
export const useFetchFriendRequestsReceived = () => {
  const fetchFriendRequestsReceived = async () => {
    try {
      const response = await api.get("/user/fetchFriendRequestsReceived");
      return response.data.friendRequestsReceived;
    } catch (error) {
      console.error("|| error in useFetchFriendRequestsReceived", error);
      throw error;
    }
  };
  return useQuery<string[]>({
    queryKey: ["friendRequestsReceived"],
    queryFn: fetchFriendRequestsReceived,
  });
};
