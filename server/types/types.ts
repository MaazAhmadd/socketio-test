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
  members: Member[];
  videoPlayer: VideoPlayer | null;
  status: string;
  id: string;
}
// random Music -> aesthetic,jazz,pop,rock,hip-hop,classical,electronic,rap,beatbox,bollywood
// music suggestion platform with categories. // comment: make sure to suggest the original video so your vote gets counted
interface Member {
  handle: string;
  profilePicture: string | null;
  name: string | null;
  isConnected: boolean;
  isLeader: boolean;
  micEnabled: boolean;
  leaderPriorityCounter: number;
  roomId: string | null;
  // rooms: Room[];
}

interface VideoPlayer {
  isPlaying: boolean;
  sourceUrl: string;
  totalDuration: number;
  playedTill: number;
  thumbnailUrl: string;
  title: string;
}

interface DecodedUser {
  _id: string;
  name?: string;
  profilePicture?: string;
  handle: string;
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
  DecodedUser,
  VideoPlayer,
  RoomCreationData,
  RoomJoinData,
  VideoInfo,
  SupportedPlatforms,
};
