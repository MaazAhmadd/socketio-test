interface ServerToClientEvents {
  roomDesc: (data: Room) => void;
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
export type RoomCreationData = {
  videoUrl: string;
};
export type RoomJoinData = {
  roomId: string; 
}
interface Room {
  members: Member[];
  videoPlayer: VideoPlayer | null;
  status: string;
}

interface Member {
  handle: string;
  profilePicture: string | null;
  name: string | null;
  isConnected: boolean;
  isLeader: boolean;
  micEnabled: boolean;
  leaderPriorityCounter: number;
}

interface VideoPlayer {
  isPlaying: boolean;
  source: string;
  totalDuration: number;
  playedTill: number;
}

interface DecodedUser {
  _id: string;
  name?: string;
  profilePicture?: string;
  handle: string;
}

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
};
