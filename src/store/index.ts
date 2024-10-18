import { produce } from "immer";
import { Message, Room } from "server/src/types";
import { create } from "zustand";

export type Tabs = "public" | "createRoom" | "invited" | "friends";
export type RoomCreationRequestType = "join" | "create";

const initialGlobalState: GlobalStoreInitialState = {
	showRoomTab: "public",
	connected: false,
	roomJoinDialogShown: true,
	isFullscreen: false,
	keyboardHeight: 0,
};
export const useGlobalStore = create<GlobalStore>((set) => ({
	...initialGlobalState,
	setShowRoomTab: (tab: Tabs) => set({ showRoomTab: tab }),
	setConnected: (connected: boolean) => set({ connected }),
	logout: () => {
		localStorage.removeItem("auth_token");
		window.location.reload();
	},
	setRoomJoinDialogShown: (roomJoinDialogShown: boolean) =>
		set({ roomJoinDialogShown }),
	setIsFullscreen: (isFullscreen: boolean) => set({ isFullscreen }),
	setKeyboardHeight: (keyboardHeight) => set({ keyboardHeight }),
	resetGlobalState: () => set({ ...initialGlobalState }),
}));
const initialRoomState: RoomStoreInitialState = {
	loading: true,
	roomData: null,
	messages: [],
	mutedMembers: [],
	mics: [],
};
export const useRoomStore = create<RoomStore>((set) => ({
	...initialRoomState,
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
	setPlayerStats: (stats: number[]) =>
		set(
			produce((state: RoomStore) => {
				if (state.roomData) {
					state.roomData.playerStats = stats;
				}
			}),
		),
	setRoomSettings: (data: [number, number, number]) => {
		// privacy, playback, roomMic
		set(
			produce((state: RoomStore) => {
				if (state.roomData) {
					state.roomData.privacy = data[0];
					state.roomData.playback = data[1];
					state.roomData.roomMic = data[2];
				}
			}),
		);
	},
	resetRoomState: () => set({ ...initialRoomState }),
}));

const initialPlayerState: PlayerStoreInitialState = {
	url: "",
	pip: false,
	controls: true,
	playing: false,
	loop: false,
	playbackRate: 1,
	volume: 0.8,
	muted: false,
	duration: 0,
	progress: 0,
	serverTimeOffset: 0,
	playerType: 0,
	initialSync: false,
	userIntervention: false,
	isSystemAction: false,
	autoSync: true,
	pauseDelayTimeout: null,
	playerModalOpen: true,
	controlsJustChanged: false,
	isPlayerFullscreen: false,
};

export const usePlayerStore = create<PlayerStore>((set) => ({
	...initialPlayerState,
	setUrl: (url: string | undefined) => set({ url }),
	setPip: (pip: boolean) => set({ pip }),
	setControls: (controls: boolean) => set({ controls }),
	setPlaying: (playing: boolean) => set({ playing }),
	setLoop: (loop: boolean) => set({ loop }),
	setPlaybackRate: (playbackRate: number) => set({ playbackRate }),
	setVolume: (volume: number) => set({ volume }),
	setMuted: (muted: boolean) => set({ muted }),
	setDuration: (duration: number) => set({ duration }),
	setProgress: (progress: number) => set({ progress }),
	setServerTimeOffset: (serverTimeOffset: number) => set({ serverTimeOffset }),
	setPlayerType: (playerType: number) => set({ playerType }),
	setInitialSync: (sync: boolean) => set({ initialSync: sync }),
	setUserIntervention: (userIntervention: boolean) => set({ userIntervention }),
	setIsSystemAction: (isSystemAction: boolean) => set({ isSystemAction }),
	setAutoSync: (autoSync: boolean) => set({ autoSync }),
	setPauseDelayTimeout: (pauseDelayTimeout: NodeJS.Timeout | null) =>
		set({ pauseDelayTimeout }),
	setPlayerModalOpen: (playerModalOpen: boolean) => set({ playerModalOpen }),
	setControlsJustChanged: (controlsJustChanged: boolean) =>
		set({ controlsJustChanged }),
	setIsPlayerFullscreen: (isPlayerFullscreen: boolean) =>
		set({ isPlayerFullscreen }),
	resetPlayerState: () => set({ ...initialPlayerState }),
}));

interface GlobalStoreInitialState {
	connected: boolean;
	showRoomTab: Tabs;
	roomJoinDialogShown: boolean;
	isFullscreen: boolean;
	keyboardHeight: number;
}
interface GlobalStore extends GlobalStoreInitialState {
	setConnected: (connected: boolean) => void;
	setShowRoomTab: (tab: Tabs) => void;
	logout: () => void;
	setRoomJoinDialogShown: (shown: boolean) => void;
	setIsFullscreen: (isFullscreen: boolean) => void;
	setKeyboardHeight: (keyboardHeight: number) => void;
	resetGlobalState: () => void;
}
interface RoomStoreInitialState {
	loading: boolean;
	roomData: Room | null;
	messages: Message[];
	mutedMembers: string[];
	mics: string[];
}
interface RoomStore extends RoomStoreInitialState {
	setMics: (data: string) => void;
	setMutedMembers: (data: string[]) => void;
	mutedMembersPush: (id: string) => void;
	mutedMembersPull: (id: string) => void;
	setMessages: (data: Message[]) => void;
	addMessage: (data: Message) => void;
	setRoomData: (data: Room | null) => void;
	updateActiveMembersList: (members: string[]) => void;
	setLoading: (loading: boolean) => void;
	setPlayerStats: (stats: number[]) => void;
	setRoomSettings: (data: [number, number, number]) => void;
	resetRoomState: () => void;
}
interface PlayerStoreInitialState {
	url: string | undefined;
	pip: boolean;
	controls: boolean;
	playing: boolean;
	loop: boolean;
	playbackRate: number;
	volume: number;
	muted: boolean;
	duration: number;
	progress: number;
	serverTimeOffset: number;
	playerType: number;
	initialSync: boolean;
	userIntervention: boolean;
	isSystemAction: boolean;
	autoSync: boolean;
	pauseDelayTimeout: NodeJS.Timeout | null;
	playerModalOpen: boolean;
	controlsJustChanged: boolean;
	isPlayerFullscreen: boolean;
}
interface PlayerStore extends PlayerStoreInitialState {
	setUrl: (url: string | undefined) => void;
	setPip: (pip: boolean) => void;
	setControls: (controls: boolean) => void;
	setPlaying: (playing: boolean) => void;
	setLoop: (loop: boolean) => void;
	setPlaybackRate: (rate: number) => void;
	setVolume: (volume: number) => void;
	setMuted: (muted: boolean) => void;
	setDuration: (duration: number) => void;
	setProgress: (progress: number) => void;
	setServerTimeOffset: (offset: number) => void;
	setPlayerType: (type: number) => void;
	setInitialSync: (sync: boolean) => void;
	setUserIntervention: (sync: boolean) => void;
	setIsSystemAction: (action: boolean) => void;
	setAutoSync: (autoSync: boolean) => void;
	setPauseDelayTimeout: (pauseDelayTimeout: NodeJS.Timeout | null) => void;
	setPlayerModalOpen: (playerModalOpen: boolean) => void;
	setControlsJustChanged: (controlsJustChanged: boolean) => void;
	setIsPlayerFullscreen: (isPlayerFullscreen: boolean) => void;
	resetPlayerState: () => void;
}
