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
      <Button variant={"destructive"} onClick={onLeaveRoom}>
        Leave Room
      </Button>
    </>
  );
};

export default RoomPage;
