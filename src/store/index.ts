import { produce } from "immer";
import { MutableRefObject } from "react";
import ReactPlayer from "react-player";
import { Message, Room } from "server/src/types";
import { create } from "zustand";

export type Tabs = "public" | "createRoom" | "invited" | "friends";
// export type Routes = "authPage" | "homePage" | "roomPage";
export type RoomCreationRequestType = "join" | "create";

// const token = localStorage.getItem("auth_token");

export const useGlobalStore = create<GlobalStore>((set) => ({
	showRoomTab: "public",
	connected: false,
	setShowRoomTab: (tab: Tabs) => set({ showRoomTab: tab }),
	setConnected: (connected: boolean) => set({ connected }),
	logout: () => {
		localStorage.removeItem("auth_token");
		window.location.reload();
	},
}));

export const useRoomStore = create<RoomStore>((set) => ({
	loading: true,
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
	setLoading: (loading: boolean) => set({ loading }),
}));

export const usePlayerStore = create<PlayerStore>((set) => ({
	url: "",
	pip: false,
	playing: false,
	loop: false,
	playbackRate: 1,
	volume: 0.8,
	muted: false,
	duration: 0,
	progress: 0,
	serverTimeOffset: 0,
	playerType: 0,
	playerRef: null,
	setUrl: (url: string) => set({ url }),
	setPip: (pip: boolean) => set({ pip }),
	setPlaying: (playing: boolean) => set({ playing }),
	setLoop: (loop: boolean) => set({ loop }),
	setPlaybackRate: (rate: number) => set({ playbackRate: rate }),
	setVolume: (volume: number) => set({ volume }),
	setMuted: (muted: boolean) => set({ muted }),
	setDuration: (duration: number) => set({ duration }),
	setProgress: (progress: number) => set({ progress }),
	setServerTimeOffset: (offset: number) => set({ serverTimeOffset: offset }),
	setPlayerType: (playerType: number) => set({ playerType }),
	setPlayerRef: (ref: MutableRefObject<ReactPlayer | null>) =>
		set({ playerRef: ref }),
}));

interface GlobalStore {
	logout: () => void;
	showRoomTab: Tabs;
	setShowRoomTab: (tab: Tabs) => void;
	connected: boolean;
	setConnected: (connected: boolean) => void;
}
interface RoomStore {
	loading: boolean;
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
	setLoading: (loading: boolean) => void;
}
interface PlayerStore {
	url: string;
	pip: boolean;
	playing: boolean;
	loop: boolean;
	playbackRate: number;
	volume: number;
	muted: boolean;
	duration: number;
	progress: number;
	serverTimeOffset: number;
	playerType: number;
	playerRef: MutableRefObject<ReactPlayer | null> | null;
	setUrl: (url: string) => void;
	setPip: (pip: boolean) => void;
	setPlaying: (playing: boolean) => void;
	setLoop: (loop: boolean) => void;
	setPlaybackRate: (rate: number) => void;
	setVolume: (volume: number) => void;
	setMuted: (muted: boolean) => void;
	setDuration: (duration: number) => void;
	setProgress: (progress: number) => void;
	setServerTimeOffset: (offset: number) => void;
	setPlayerType: (type: number) => void;
	setPlayerRef: (ref: MutableRefObject<ReactPlayer | null>) => void;
}
