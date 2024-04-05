import useGlobalStore from "@/state/store";
import ConnectionStatus from "./ConnectionStatus";
import { useEffect } from "react";
import { socket } from "@/socket";
import { Room } from "server/types/types";
import { Button } from "./ui/button";

const RoomPage = () => {
  const {
    encodedAuthToken,
    setConnected,
    roomCreationData,
    roomCreationRequestType,
    roomJoinData,
    connected,
    setRoute,
  } = useGlobalStore((s) => ({
    encodedAuthToken: s.encodedAuthToken,
    setConnected: s.setConnected,
    roomCreationData: s.roomCreationData,
    roomCreationRequestType: s.roomCreationRequestType,
    roomJoinData: s.roomJoinData,
    connected: s.connected,
    setRoute: s.setRoute,
  }));
  let roomobj = {
    id: "b289b4e0-53e4-4a19-82e2-86cc24a50c27",
    status: "Public",
    members: [
      {
        id: "e9c93253-6993-48af-a295-57edb96bb0b5",
        name: "user1name",
        handle: "user1handle",
        profilePicture:
          "https://images.unsplash.com/photo-1709593491239-dd571c4ebfb8?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTcxMTcwNDcyMA&ixlib=rb-4.0.3&q=80&w=400",
        isConnected: true,
        isLeader: true,
        micEnabled: false,
        leaderPriorityCounter: 0,
        roomId: "b289b4e0-53e4-4a19-82e2-86cc24a50c27",
      },
    ],
    videoPlayer: {
      id: "fa8f1f21-b9cb-48c5-840b-79fd28e980c1",
      isPlaying: false,
      sourceUrl: "https://youtube.com/watch?v=KVZ-P-ZI6W4",
      thumbnailUrl: "https://i.ytimg.com/vi/KVZ-P-ZI6W4/sddefault.jpg",
      title: "React.js Conf 2015 Keynote - Introducing React Native",
      totalDuration: 0,
      playedTill: 0,
      roomId: "b289b4e0-53e4-4a19-82e2-86cc24a50c27",
    },
  };

  useEffect(() => {
    console.log("[Room] Render");
    socket.io.opts.query = { token: encodedAuthToken };
    socket.connect();
    if (!connected) {
      if (roomCreationRequestType == "create") {
        socket.emit("createRoom", roomCreationData);
      } else if (roomCreationRequestType == "join") {
        socket.emit("joinRoom", roomJoinData);
      }
    }
    function onConnect() {
      console.log("[socket connect] connected");
      setConnected(true);
    }

    function onDisconnect() {
      console.log("[socket disconnect] disconnected");
      setConnected(false);
    }

    function onStateError(err: string) {
      console.log("[socket stateError] stateError: ", err);
    }

    function onRoomDesc(data: Room) {
      console.log("[socket roomDesc] roomDesc: ", data);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("roomDesc", onRoomDesc);
    socket.on("stateError", onStateError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("roomDesc", onRoomDesc);
      socket.off("stateError", onStateError);
    };
  }, []);
  function onLeaveRoom() {
    socket.emit("leaveRoom");
    socket.disconnect();
    setConnected(false);
    setRoute("homePage");
  }
  return (
    <>
      <ConnectionStatus />

      <div>Room</div>
      <Button variant={'destructive'} onClick={onLeaveRoom}>Leave Room</Button>
    </>
  );
};

export default RoomPage;
