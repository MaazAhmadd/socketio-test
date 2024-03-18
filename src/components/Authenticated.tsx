import { useState, useEffect } from "react";
import { socket } from "../socket";
import { Room } from "../../server/types/types";

const Authenticated = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [messages, setMessages] = useState<
    {
      msg: string;
      userId: string;
    }[]
  >([]);
  const [rooms, _setRooms] = useState(["123", "234", "345", "456"]);
  const [userId, setUseriD] = useState<string>(new Date().getTime().toString());
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("render");
  });
  useEffect(() => {
    function onConnect() {
      console.log("Connected to the server");
      setIsConnected(true);
    }

    function onDisconnect() {
      console.log("Disconnected from the server");
      setIsConnected(false);
    }

    function onMessage(value: string, _userId: string) {
      // console.log("Received a 'message' event", value);

      setMessages((previous) => [...previous, { msg: value, userId: _userId }]);
    }

    function onRoomDesc(data: Room) {
      if (data) {
        console.log("room desc received: ", data);

        setCurrentRoom(data);
      }
    }
    socket.on("connect_error", (error) => {
      console.log("Connection Error:", error.message);
    });
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("message", onMessage);
    socket.on("roomDesc", onRoomDesc);
    socket.on("hello", (arg, callback) => {
      console.log(arg); // "world"
      callback("got it");
    });

    socket.on("getRoomsResponse", (rooms) => {
      console.log("rooms all: ", rooms); // Logs the rooms that the client's socket is in
    });
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("message", onMessage);
    };
  }, []);
  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    socket.timeout(100).emit("sendMessage", value, () => {
      setIsLoading(false);
    });

    setValue("");
  }
  return (
    <div className="p-4">
      <div className="mb-4">
        {isConnected ? (
          <p className="bg-green-400 fixed top-0 w-full">connected to server</p>
        ) : (
          <p className="bg-red-400 fixed top-0 w-full">
            not connected to server
          </p>
        )}
      </div>
      <ul className="bg-gray-300 p-4">
        {messages.map(({ msg, userId: _userId }, index) => (
          <li key={index}>
            {msg} - {_userId} ({_userId === userId ? "me" : "other"})
          </li>
        ))}
      </ul>
      <div className="m-4 flex gap-6">
        <button
          className="bg-green-300 p-2"
          onClick={() => {
            socket.connect();
          }}
        >
          Connect
        </button>
        <button
          className="bg-red-300 p-2"
          onClick={() => {
            socket.disconnect();
            setCurrentRoom({
              lastEmptyTime: "",
              members: [
                {
                  isConnected: false,
                  isLeader: false,
                  userId: null,
                },
              ],
              roomId: "",
            });
          }}
        >
          Disconnect
        </button>
      </div>
      <form onSubmit={onSubmit} className="mb-4">
        enter message:
        <input
          className="border-lime-300 border-4"
          onChange={(e) => setValue(e.target.value)}
        />
        <button
          className="border-gray-200 bg-gray-100 border-2 px-2 py-1 rounded-sm ml-2"
          type="submit"
          disabled={isLoading}
        >
          Submit
        </button>
      </form>
      <div>
        user:
        <input
          className="border-lime-300 border-4"
          type="text"
          value={userId}
          onChange={(e) => setUseriD(e.target.value)}
        />
        <button className="border-teal-200 bg-teal-100 border-2 px-2 py-1 rounded-sm ml-2">
          create room
        </button>
      </div>
      <div className="m-4">
        {rooms.map((_roomId: string, i) => {
          return (
            <div key={i}>
              room:
              <button
                className={
                  currentRoom &&
                  currentRoom.members.filter((m) => m.userId === userId)[0] &&
                  currentRoom.members.filter((m) => m.userId === userId)[0]
                    .isConnected
                    ? "border-gray-200 bg-gray-100 border-2 px-2 py-1 rounded-sm ml-2 text-gray-500"
                    : "border-gray-400 bg-gray-200 border-2 px-2 py-1 rounded-sm ml-2"
                }
                onClick={() => {
                  setCurrentRoom((p) => {
                    if (!p) return null;
                    return {
                      ...p,
                      roomId: _roomId,
                    };
                  });
                  socket.emit("joinRoom", { roomId: _roomId, userId });
                }}
                disabled={
                  currentRoom != null &&
                  currentRoom.members.filter((m) => m.userId === userId)[0] &&
                  currentRoom.members.filter((m) => m.userId === userId)[0]
                    .isConnected
                }
              >
                {_roomId}
              </button>
            </div>
          );
        })}
      </div>
      <div>room id : {currentRoom?.roomId}</div>
      <div className="m-4">
        room description:{" "}
        {currentRoom?.members.map((m, i) => {
          return (
            <div
              key={i}
              className={m.userId === userId ? "bg-gray-200 p-4" : "p-4"}
            >
              ID: {m.userId} |
              {m.isConnected ? (
                <span className="text-green-500">connected</span>
              ) : (
                <span className="text-red-500"> not connected</span>
              )}
              |
              {m.isLeader ? (
                <span className="text-yellow-500">Leader</span>
              ) : (
                <span className="text-neutral-500">Member</span>
              )}{" "}
              |
              {currentRoom.members.filter((m) => m.userId === userId)[0]
                .isLeader &&
                !m.isLeader && (
                  <span
                    className="text-cyan-500 cursor-pointer"
                    onClick={() => {
                      if (m.userId) socket.emit("giveLeader", m.userId);
                    }}
                  >
                    give leader
                  </span>
                )}
            </div>
          );
        })}
      </div>
      <button
        className="border-red-400 bg-red-300 border-2 px-2 py-1 rounded-sm ml-2"
        onClick={() => {
          setCurrentRoom(null);
          socket.emit("leaveRoom");
        }}
      >
        leave room
      </button>
      <button
        className="border-orange-400 bg-orange-300 border-2 px-2 py-1 rounded-sm ml-2"
        onClick={() => socket.emit("getRooms")}
      >
        log rooms
      </button>
    </div>
  );
};

export default Authenticated;
