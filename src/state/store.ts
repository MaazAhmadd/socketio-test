import { produce } from "immer";
import {
  CurrentUser,
  Member,
  Message,
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

  roomMembersDrawer: false,
  setRoomMembersDrawer: (open: boolean) => set({ roomMembersDrawer: open }),
  roomSettingsDrawer: false,
  setRoomSettingsDrawer: (open: boolean) => set({ roomSettingsDrawer: open }),
}));

export const useRoomStore = create<RoomStore>((set) => ({
  roomData: null,
  messages: [],
  addMessage: (data: Message) =>
    set(
      produce((state: RoomStore) => {
        state.messages.push(data);
      }),
    ),
  setMessages: (data: Message[]) =>
    set(
      produce((state: RoomStore) => {
        state.messages = data;
      }),
    ),
  setRoomData: (data: Room | null) =>
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
  roomMembersDrawer: boolean;
  setRoomMembersDrawer: (open: boolean) => void;
  roomSettingsDrawer: boolean;
  setRoomSettingsDrawer: (open: boolean) => void;
}
interface RoomStore {
  roomData: Room | null;
  messages: Message[];
  setMessages: (data: Message[]) => void;
  addMessage: (data: Message) => void;
  setRoomData: (data: Room | null) => void;
  updateActiveMembersList: (members: string[]) => void;
}
