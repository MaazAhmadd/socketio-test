import useGlobalStore from "@/state/store";
import ConnectionStatus from "./ConnectionStatus";
import { useEffect } from "react";
import { socket } from "@/socket";

const Room = () => {
  const {
    encodedAuthToken,
    setConnected,
    roomCreationData,
    roomCreationRequestType,
    roomJoinData,
  } = useGlobalStore((s) => ({
    encodedAuthToken: s.encodedAuthToken,
    setConnected: s.setConnected,
    roomCreationData: s.roomCreationData,
    roomCreationRequestType: s.roomCreationRequestType,
    roomJoinData: s.roomJoinData,
  }));

  useEffect(() => {
    console.log("[Room] Render");
    socket.io.opts.query = { token: encodedAuthToken };
    socket.connect();
    if (roomCreationRequestType == "create") {
      socket.emit("createRoom", roomCreationData);
    } else if (roomCreationRequestType == "join") {
      socket.emit("joinRoom", roomJoinData);
    }
    function onConnect() {
      console.log("[socket connect] connected");
      setConnected(true);
    }

    function onDisconnect() {
      setConnected(false);
    }

    function onStateError(err: string) {
      console.log("[socket stateError] stateError: ", err);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("stateError", onStateError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("stateError", onStateError);
    };
  }, []);
  return (
    <>
      <ConnectionStatus />

      <div>Room</div>
    </>
  );
};

export default Room;
