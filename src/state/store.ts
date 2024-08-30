import { produce } from "immer";
import {
  CurrentUser,
  Member,
  NormalUser,
  Room,
  RoomJoinData,
} from "server/src/types";
import { create } from "zustand";

export type Tabs = "public" | "createRoom" | "invited" | "friends";
// export type Routes = "authPage" | "homePage" | "roomPage";
export type RoomCreationRequestType = "join" | "create";

// const token = localStorage.getItem("auth_token");

export const useGlobalStore = create<GlobalStore>((set) => ({
  logout: () => {
    localStorage.removeItem("auth_token");
    window.location.reload();
  },
  showRoomTab: "public",
  setShowRoomTab: (tab: Tabs) => set({ showRoomTab: tab }),

  connected: false,
  setConnected: (connected: boolean) => set({ connected }),
}));

export const useRoomStore = create<RoomStore>((set) => ({
  roomData: null,
  setRoomData: (data: Room) =>
    set(
      produce((state: RoomStore) => {
        state.roomData = data;
      }),
    ),
  updateActiveMembersList: (members: string[]) =>
    set(
      produce((state: RoomStore) => {
        if (state.roomData) {
          state.roomData.activeMembersList = members || [];
          state.roomData.activeMembersCount = members?.length || 0;
        }
      }),
    ),
}));

interface GlobalStore {
  logout: () => void;
  showRoomTab: Tabs;
  setShowRoomTab: (tab: Tabs) => void;
  connected: boolean;
  setConnected: (connected: boolean) => void;
}
interface RoomStore {
  roomData: Room | null;
  setRoomData: (data: Room) => void;
  updateActiveMembersList: (members: string[]) => void;
}
