import { Repository } from "redis-om";

interface ServerToClientEvents {
  roomDesc: (data: Room) => void;
  memberList: (data: Member[]) => void;
  message: (data: Message) => void;
  stateError: (data: string) => void;
  activeMemberListUpdate: (data: string[]) => void;

  // noArg: () => void;
  // sendMessage: (value: string) => void;
  // basicEmit: (a: number, b: string, c: Buffer) => void;
  // withAck: (d: string, callback: (e: number) => void) => void;
  // joinRoom: (data: { roomId: string }) => void;
  // leaveRoom: () => void;
  // hello: (d: String, callback: (a: String) => void) => void;
  // getRooms: () => void;
  // getRoomsResponse: (data: string[]) => void;
  // giveLeader: (targetMember: string) => void;
  // roomCreated: (data: Room) => void;
  // roomJoined: (data: Room) => void;
}

interface ClientToServerEvents {
  // createRoom: (data: { videoUrl: string; roomId: string }) => void;
  joinRoom: (data: { roomId: string }) => void;
  giveLeader: (data: { targetMember: string; roomId: string }) => void;
  // sendMessage: (data: { msg: string; roomId: string }) => void;
  sendMessage: (msg: string) => void;
  leaveRoom: () => void;
  // memberJoin: (data: Member) => void;
  // memberLeave: (data: string) => void;

  // message: (data: string, userId: string) => void;
  // getRooms: () => void;
  // roomJoined: (data: Room) => void;
  // roomDesc: (data: Room) => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  name: string;
  age: number;
}

// type Rooms = Record<string, Room>;
type Rooms = {
  [key: string]: Room;
};
type RoomCreationData = {
  videoUrl: string;
};
type RoomJoinData = {
  roomId: string;
};
// Define Member interface
interface Member {
  mongoId: string;
  // isConnected: boolean;
  name?: string;
  handle: string;
  pfp?: string;
  mic: boolean;
  country?: string;
  // roomId?: string;
  // isLeader: boolean;
  // leaderPC: number;
  [key: string]: any;
}

// Define Room interface
interface Room {
  privacy: number;
  playback: number;
  roomMic: boolean;
  membersJoinedList?: string[];
  activeMembersList?: string[];
  activeMembersCount?: number;
  countries: string[];
  kicked: string[];
  createdByMongoId: string[];
  createdAt: number;
  // searchKeywords: string;
  v_isPlaying: boolean;
  v_sourceUrl: string;
  v_thumbnailUrl: string;
  v_title: string;
  v_totalDuration: number;
  v_playedTill: number;
  entityId?: string;
  // members?: Member[];
  [key: string]: any;
}

type Message = {
  id: number;
  msg: string;
  sender: string;
  time: number;
  system?: boolean;
};

type CurrentUser = {
  _id: string;
  name: string;
  handle: string;
  pfp: string;
  country: string;
  friends: string[];
  friendReqsSent: string[];
  friendReqsReceived: string[];
  recentsUsers: string[];
  recentsVideos: string[];
};

interface NormalUser {
  _id: string;
  name: string;
  handle: string;
  pfp: string;
  country: string;
}

type VideoInfo = {
  title: string;
  thumbnail: string;
  ytId: string;
  duration: string;
};

type SupportedPlatforms = "youtube" | "netflix" | "prime";

type RedisSchemas = {
  member: Repository<Member>;
  room: Repository<Room>;
};
export type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
  Rooms,
  Message,
  Member,
  Room,
  NormalUser,
  RoomCreationData,
  RoomJoinData,
  VideoInfo,
  SupportedPlatforms,
  CurrentUser,
  RedisSchemas,
};