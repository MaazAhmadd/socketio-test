import { useMutation, useQuery } from "@tanstack/react-query";

import api from "@/api/api";
import { isValidJwt } from "@/utils";

export const useLoginUser = () => {
  const loginUser = async (formData: Record<string, any>) => {
    try {
      const response = await api.post("/user/login/", formData);
      if (response.data && isValidJwt(response.data)) {
        localStorage.setItem("auth_token", response.data);
      }
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
  isStateError: any
) => {
  const checkUser = async () => {
    const response = await api.get("/user/check?q=" + handle);
    console.log("user checked: ", response.data);

    return response.data;
  };
  return useQuery({
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
      }
      return response.data;
    } catch (error) {
      console.error("|| error in useRegisterUser", error);
      throw error;
    }
  };

  return useMutation({ mutationFn: registerUser });
};
