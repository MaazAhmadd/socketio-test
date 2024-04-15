import useGlobalStore from "@/state/store";
import ConnectionStatus from "./ConnectionStatus";
import { useEffect } from "react";
import { socket } from "@/socket";
import { Room } from "server/types/types";
import { Button } from "./ui/button";
import { useWindowSize } from "@/hooks/utilHooks";
import toast from "react-hot-toast";
import { RoomSettingsDrawer } from "./RoomSettingsDrawer";
import { TextGradient } from "./auth-page";
import { RoomPinDialog } from "./RoomPinDialog";

const RoomPage = () => {
  const { width, height } = useWindowSize();

  const {
    // encodedAuthToken,
    setConnected,
    roomCreationData,
    roomCreationRequestType,
    roomJoinData,
    // connected,
    setRoute,
  } = useGlobalStore((s) => ({
    // encodedAuthToken: s.encodedAuthToken,
    setConnected: s.setConnected,
    roomCreationData: s.roomCreationData,
    roomCreationRequestType: s.roomCreationRequestType,
    roomJoinData: s.roomJoinData,
    connected: s.connected,
    setRoute: s.setRoute,
  }));

  useEffect(() => {
    console.log("[Room] Render, w-h", width, height);
    // socket.io.opts.query = { token: encodedAuthToken };
    socket.connect();
    // if (connected) {
    if (roomCreationRequestType == "create") {
      socket.emit("createRoom", roomCreationData);
    } else if (roomCreationRequestType == "join") {
      socket.emit("joinRoom", roomJoinData);
    }
    // }

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
      toast.error(err);
      socket.disconnect();
      setConnected(false);
      setRoute("homePage");
    }

    function onRoomDesc(data: Room) {
      toast.success("room desc received");
      console.log("[socket roomDesc] roomDesc: ", data);
    }

    function onConnectError(err: Error) {
      console.log("[socket connect_error] connect_error: ", err);
      toast.error(err.message);
      socket.disconnect();
      setConnected(false);
      setRoute("homePage");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("roomDesc", onRoomDesc);
    socket.on("stateError", onStateError);
    socket.on("connect_error", onConnectError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("roomDesc", onRoomDesc);
      socket.off("stateError", onStateError);
      socket.off("connect_error", onConnectError);
    };
  }, []);
  function onLeaveRoom() {
    socket.emit("leaveRoom");
    socket.disconnect();
    setConnected(false);
    setRoute("homePage");
  }
  // mobile videoplayer height 33vh
  // desktop chat width 30vw
  // turn to svh if caused issue on mobile
  return (
    <>
      <ConnectionStatus />
      {width < 601 ? (
        <div>
          <div className="h-[7vh] bg-blue-800">
            <RoomButtons onLeaveRoom={onLeaveRoom} />
          </div>
          <div className="h-[33vh] bg-red-800">videoplayer</div>
          <div className="h-[60vh] bg-green-800">chat</div>
        </div>
      ) : (
        <div className="flex">
          <div className="w-[70vw]">
            <div className="h-[80vh] bg-red-800">videoplayer</div>
          </div>
          <div className="w-[30vw]">
            <div className=" h-[7vh] bg-blue-800">
              <RoomButtons onLeaveRoom={onLeaveRoom} />
            </div>
            <div className="h-[93vh] bg-green-800 ">chat</div>
          </div>
        </div>
      )}
    </>
  );
};
const RoomButtons = ({ onLeaveRoom }: { onLeaveRoom: () => void }) => {
  return (
    <div className="flex">
      <Button variant={"destructive"} onClick={() => onLeaveRoom()}>
        Leave
      </Button>
      <RoomSettingsDrawer />
      <TextGradient className="text-2xl md:text-xl">Gather Groove</TextGradient>
      <RoomPinDialog />
    </div>
  );
};
export default RoomPage;
