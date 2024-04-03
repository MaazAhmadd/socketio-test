import { isValidJwt } from "@/utils";
import { jwtDecode } from "jwt-decode";
import {
  DecodedUser,
  RoomCreationData,
  RoomJoinData,
} from "server/types/types";
import { create } from "zustand";

export type Tabs = "public" | "createRoom" | "invited" | "friends";
export type Routes = "authPage" | "homePage" | "roomPage";
export type RoomCreationRequestType = "join" | "create";

const token = localStorage.getItem("auth_token");
interface GlobalStore {
  encodedAuthToken: string | null;
  decodedAuthToken: DecodedUser | null;
  setAuthToken: (token: string) => void;
  logout: () => void;
  showRoomTab: Tabs;
  setShowRoomTab: (tab: Tabs) => void;
  route: Routes;
  setRoute: (route: Routes) => void;
  connected: boolean;
  setConnected: (connected: boolean) => void;
  roomCreationData: RoomCreationData;
  setRoomCreationVideoUrl: (videoUrl: string) => void;
  roomCreationRequestType: RoomCreationRequestType;
  setRoomCreationRequestType: (type: RoomCreationRequestType) => void;
  roomJoinData: RoomJoinData;
  setRoomJoinRoomId: (data: string) => void;
}

const useGlobalStore = create<GlobalStore>((set) => ({
  encodedAuthToken: token || null,
  decodedAuthToken: token && isValidJwt(token) ? jwtDecode(token) : null,
  setAuthToken: (token: string) =>
    set({
      encodedAuthToken: token || null,
      decodedAuthToken: token && isValidJwt(token) ? jwtDecode(token) : null,
    }),
  logout: () => {
    localStorage.removeItem("auth_token");
    set({
      encodedAuthToken: null,
      decodedAuthToken: null,
      connected: false,
      route: "authPage",
    });
  },
  showRoomTab: "public",
  setShowRoomTab: (tab: Tabs) => set({ showRoomTab: tab }),
  route: token ? "homePage" : "authPage",
  setRoute: (route: Routes) => set({ route }),
  connected: false,
  setConnected: (connected: boolean) => set({ connected }),
  roomCreationData: {
    videoUrl: "",
  },
  setRoomCreationVideoUrl: (videoUrl: string) =>
    set(({ roomCreationData }) => ({
      roomCreationData: { ...roomCreationData, videoUrl },
    })),
  roomCreationRequestType: "create",
  setRoomCreationRequestType: (type: RoomCreationRequestType) =>
    set({ roomCreationRequestType: type }),
  roomJoinData: {
    roomId: "",
  },
  setRoomJoinRoomId: (roomId: string) =>
    set(({ roomJoinData }) => ({
      roomJoinData: { ...roomJoinData, roomId },
    })),
}));

export default useGlobalStore;
