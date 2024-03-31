import { isValidJwt } from "@/utils";
import { jwtDecode } from "jwt-decode";
import { DecodedUser } from "server/types/types";
import { create } from "zustand";

interface GlobalStore {
  decodedAuthToken: DecodedUser | null;
  setAuthToken: (token: string) => void;
  logout: () => void;
}
const token = localStorage.getItem("auth_token");

const useGlobalStore = create<GlobalStore>((set) => ({
  decodedAuthToken: token && isValidJwt(token) ? jwtDecode(token) : null,
  setAuthToken: (token: string) =>
    set({
      decodedAuthToken: token && isValidJwt(token) ? jwtDecode(token) : null,
    }),
  logout: () => {
    localStorage.removeItem("auth_token");
    set({ decodedAuthToken: null });
  },
}));

export default useGlobalStore;
