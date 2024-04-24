interface ServerToClientEvents {
  roomDesc: (data: Room) => void;
  memberList: (data: Member[]) => void;
  message: (data: { sender: string; msg: string }) => void;
  stateError: (data: string) => void;

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
  createRoom: (data: RoomCreationData) => void;
  joinRoom: (data: RoomJoinData) => void;
  giveLeader: (targetMember: string) => void;
  sendMessage: (msg: string) => void;
  leaveRoom: () => void;

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
interface Room {
  id: string;
  members: Member[];
  videoPlayer?: VideoPlayer | null;
  privacy: string;
  playback: string;
  roomMic: boolean;
  kicked: string[];
}

// random Music -> aesthetic,jazz,pop,rock,hip-hop,classical,electronic,rap,beatbox,bollywood
// music suggestion platform with categories. // comment: make sure to suggest the original video so your vote gets counted
interface Member {
  mongoId: string;
  name?: string | null;
  handle: string;
  pfp?: string | null;
  isConnected: boolean;
  isLeader: boolean;
  mic: boolean;
  leaderPC: number;
  roomId?: string | null;
}

interface VideoPlayer {
  isPlaying: boolean;
  sourceUrl: string;
  thumbnailUrl: string;
  title: string;
  totalDuration: number;
  playedTill: number;
  roomId: string;
}

type CurrentUser =
  | {
      _id: string;
      name: string;
      handle: string;
      pfp: string;
      friends: string[];
      friendReqsSent: string[];
      friendReqsReceived: string[];
    }
  | undefined;

interface NormalUser {
  _id: string;
  name: string;
  handle: string;
  pfp: string;
}

type VideoInfo = {
  title: string;
  thumbnail: string;
  ytId: string;
  duration: string;
};

type SupportedPlatforms = "youtube" | "netflix" | "prime";

export type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
  Rooms,
  Member,
  Room,
  NormalUser,
  VideoPlayer,
  RoomCreationData,
  RoomJoinData,
  VideoInfo,
  SupportedPlatforms,
  CurrentUser,
};
