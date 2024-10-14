interface ServerToClientEvents {
	roomDesc: (data: Room) => void;
	message: (data: Message) => void;
	stateError: (data: string) => void;
	activeMemberListUpdate: (data: string[]) => void;
	onKicked: (data: string) => void;
	syncTimer: (data: number) => void;
	syncPlayerStats: (data: number[]) => void;
	roomSettings: (data: [number, number, number]) => void;
}

interface ClientToServerEvents {
	joinRoom: (roomId: string) => void;
	giveLeader: (targetMember: string) => void;
	mic: (data: [string, number]) => void;
	sendMessage: (msg: string) => void;
	kickMember: (data: string) => void;
	leaveRoom: () => void;
	playPauseVideo: (data: number) => void;
	sendSyncTimer: () => void;
	sendSyncPlayerStats: () => void;
	seekVideo: (data: number) => void;
	updateRoomSettings: (data: [number, number]) => void;
	sendInvites: (invitees: string[]) => void;
}

interface InterServerEvents {
	ping: () => void;
}

// Define Room interface
interface Room {
	privacy: number; // public(0), private(1), friends(2)
	playback: number; // voting(0), justPlay(1), autoPlay(2), leaderChoice(3)
	roomMic: number; // on(1), off(0)
	membersJoinedList?: string[];
	activeMembersList?: string[]; // last item are mics string
	invitedMembersList?: string[];
	activeMembersCount?: number;
	countries: string[];
	kicked: string[];
	createdByMongoId: string[];
	createdAt: number;
	// searchKeywords: string;
	videoUrl: string;
	playerStats: number[]; // [duration,progress,lastChanged,status,type]
	skips?: number;
	pinQueue?: string[]; // ["url1","customUrlId1",01] -> ["customUrlId1","url1",10] last item player/url type 0->youtube 1->custom
	voteQueue?: string[]; // ["member1","member2"] -> ["member2,member3","member1"]
	entityId?: string;
	[key: string]: any;
}
/*
	player stats:
	[duration,progress,lastChanged,status,type]
	type:
		youtube------(0)
		custom-------(1)
*/

type Message = [number, string, number, string];
/*	
	message:
	[type,sender,time,msg]
	type: 
		chat------------------(0)
		join------------------(1)
		leave-----------------(2)
		kick------------------(3)
		leadership------------(4)
		micenable-------------(5)
		micdisable------------(6)
		roompublic------------(7)
		roomprivate-----------(8)
		roomfriends-----------(9)
		videovote------------(10)
		videojustplay--------(11)
		videoleaderschoice---(12) 
		playingvideochanged--(13)
		roommicenable--------(14)
		roommicdisable-------(15)
*/

interface CurrentUser {
	_id: string;
	name: string;
	handle: string;
	pfp: string;
	profilePicId: string;
	country: string;
	socketId?: string;
	password?: string;
	friends: string[];
	friendReqsSent: string[];
	friendReqsReceived: string[];
	recentUsers: string[];
	recentVideos: { yt: string[]; web: string[] };
	likedVideos: { yt: string[]; web: string[] };
}

type NormalUser = Pick<
	CurrentUser,
	"_id" | "name" | "handle" | "pfp" | "profilePicId" | "country"
>;

type VideoInfo = {
	title: string;
	thumbnail: string;
	ytId: string;
	duration: string;
	updatedAt: Date;
};
interface WebVideo {
	t: string;
	tn: string;
	url: string;
	by: string;
}

type SupportedPlatforms = "youtube" | "netflix" | "prime";

export type {
	ServerToClientEvents,
	ClientToServerEvents,
	InterServerEvents,
	Message,
	Room,
	NormalUser,
	VideoInfo,
	SupportedPlatforms,
	CurrentUser,
	WebVideo,
};
