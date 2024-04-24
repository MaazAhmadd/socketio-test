import api from "@/api/api";
import { produce } from "immer";
import toast from "react-hot-toast";
import {
  CurrentUser,
  Member,
  RoomCreationData,
  RoomJoinData,
} from "server/types/types";
import { create } from "zustand";

export type Tabs = "public" | "createRoom" | "invited" | "friends";
export type Routes = "authPage" | "homePage" | "roomPage";
export type RoomCreationRequestType = "join" | "create";

const token = localStorage.getItem("auth_token");

export const useGlobalStore = create<GlobalStore>((set) => ({
  globalLoading: false,
  setGlobalLoading: (loading: boolean) => set({ globalLoading: loading }),
  currentUser: null,
  setCurrentUser: (user: CurrentUser) =>
    set({
      currentUser: user,
    }),
  logout: () => {
    localStorage.removeItem("auth_token");
    window.location.reload();
  },
  showRoomTab: "public",
  setShowRoomTab: (tab: Tabs) => set({ showRoomTab: tab }),
  route: token ? "homePage" : "authPage",
  setRoute: async (route: Routes) => {
    if (route === "roomPage") {
      try {
        const response = await api.get("/room/checkActiveMember", {
          headers: {
            "x-auth-token": localStorage.getItem("auth_token"),
          },
        });
        if (String(response.data) === "true") {
          set({ globalLoading: false });
          toast.error("User already in a room");
          return;
        }
      } catch (error) {
        set({ globalLoading: false });
        console.error("Error checking active member:", error);
        return;
      }
    }
    set({ route });
  },
  connected: false,
  setConnected: (connected: boolean) => set({ connected }),
}));

export const useRoomStore = create<RoomStore>((set) => ({
  currentRoom_members: [],
  setCurrentRoom_members: (members: Member[]) =>
    set({
      currentRoom_members: members,
    }),
  roomCreationData: {
    videoUrl: "",
  },
  setRoomCreationData_VideoUrl: (videoUrl: string) =>
    set(
      produce((draft) => {
        draft.roomCreationData.videoUrl = videoUrl;
      }),
    ),

  roomCreationRequestType: "join",
  setRoomCreationRequestType: (type: RoomCreationRequestType) =>
    set({ roomCreationRequestType: type }),
  roomJoinData: {
    roomId: "",
  },
  setRoomJoinData_RoomId: (roomId: string) =>
    set(
      produce((draft) => {
        draft.roomJoinData.roomId = roomId;
      }),
    ),
}));

interface GlobalStore {
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
  currentUser: CurrentUser | null;
  setCurrentUser: (user: CurrentUser) => void;
  logout: () => void;
  showRoomTab: Tabs;
  setShowRoomTab: (tab: Tabs) => void;
  route: Routes;
  setRoute: (route: Routes) => void;
  connected: boolean;
  setConnected: (connected: boolean) => void;
}
interface RoomStore {
  currentRoom_members: Member[];
  setCurrentRoom_members: (members: Member[]) => void;
  roomCreationData: RoomCreationData;
  setRoomCreationData_VideoUrl: (videoUrl: string) => void;
  roomCreationRequestType: RoomCreationRequestType;
  setRoomCreationRequestType: (type: RoomCreationRequestType) => void;
  roomJoinData: RoomJoinData;
  setRoomJoinData_RoomId: (data: string) => void;
}
