import { produce } from "immer";
import { Message, Room } from "server/src/types";
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
  messages: [],
  mutedMembers: [],
  mics: [],
  setMics: (data: string) => set({ mics: data.split("") }),
  setMutedMembers: (data: string[]) => set({ mutedMembers: data }),
  mutedMembersPush: (data: string) =>
    set(
      produce((state: RoomStore) => {
        state.mutedMembers.push(data);
      }),
    ),
  mutedMembersPull: (data: string) =>
    set(
      produce((state: RoomStore) => {
        state.mutedMembers = state.mutedMembers.filter((d) => d !== data);
      }),
    ),
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
}
interface RoomStore {
  roomData: Room | null;
  messages: Message[];
  mutedMembers: string[];
  mics: string[];
  setMics: (data: string) => void;
  setMutedMembers: (data: string[]) => void;
  mutedMembersPush: (id: string) => void;
  mutedMembersPull: (id: string) => void;
  setMessages: (data: Message[]) => void;
  addMessage: (data: Message) => void;
  setRoomData: (data: Room | null) => void;
  updateActiveMembersList: (members: string[]) => void;
}
