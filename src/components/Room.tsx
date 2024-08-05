import { useGlobalStore, useRoomStore } from "@/state/store";
import ConnectionStatus from "./ConnectionStatus";
import { useEffect } from "react";
import { socket } from "@/socket";
import { Member, Room } from "server/src/types";
import { Button } from "./ui/button";
import { useWindowSize } from "@/hooks/utilHooks";
import toast from "react-hot-toast";
import { RoomSettingsDrawer } from "./RoomSettingsDrawer";
import { TextGradient } from "./auth-page";
import { RoomPinDialog } from "./RoomPinDialog";
import { RoomMembersDrawer } from "./RoomMembersDrawer";

const RoomPage = () => {
  const { width, height } = useWindowSize();

  const {
    // globalLoading,
    setGlobalLoading,
    setConnected,

    connected,
    setRoute,
  } = useGlobalStore((s) => ({
    globalLoading: s.globalLoading,
    setGlobalLoading: s.setGlobalLoading,
    setConnected: s.setConnected,

    connected: s.connected,
    setRoute: s.setRoute,
  }));
  const {
    roomCreationData,
    roomCreationRequestType,
    roomJoinData,
    setCurrentRoom_members,
  } = useRoomStore((s) => ({
    roomCreationData: s.roomCreationData,
    roomCreationRequestType: s.roomCreationRequestType,
    roomJoinData: s.roomJoinData,
    currentRoom_members: s.currentRoom_members,
    setCurrentRoom_members: s.setCurrentRoom_members,
  }));

  useEffect(() => {
    console.log("[Room] Render, w-h", width, height);
    // socket.io.opts.query = { token: encodedAuthToken };
    socket.connect();
    if (!connected) {
      // to avoid joining room on component rerender during development
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
      setGlobalLoading(false);
      console.log("[socket stateError] stateError: ", err);
      toast.error(err); 
      setConnected(false);
      setRoute("homePage");
    }

    function onRoomDesc(data: Room) {
      setGlobalLoading(false);
      console.log("[socket roomDesc] roomDesc: ", data);
    }

    function onConnectError(err: Error) {
      console.log("[socket connect_error] connect_error: ", err);
      toast.error(err.message); 
      setConnected(false);
      setRoute("homePage");
    }
    function onMemberList(data: Member[]) {
      setGlobalLoading(false);
      toast.success("room members received");
      console.log("[socket memberList] memberList: ", data);
      setCurrentRoom_members(data);
    }
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("memberList", onMemberList);
    socket.on("roomDesc", onRoomDesc);
    socket.on("stateError", onStateError);
    socket.on("connect_error", onConnectError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("memberList", onMemberList);
      socket.off("roomDesc", onRoomDesc);
      socket.off("stateError", onStateError);
      socket.off("connect_error", onConnectError);
    };
  }, []);
  function onLeaveRoom() {
    socket.emit("leaveRoom"); 
    setConnected(false);
    setRoute("homePage");
  }
  // mobile videoplayer height 33vh
  // desktop chat width 30vw
  // turn to svh if caused issue on mobile
  return (
    <>
      <ConnectionStatus />
      {width < 768 ? (
        <div>
          <div className="h-[5vh]">
            <RoomButtons onLeaveRoom={onLeaveRoom} />
          </div>
          <div className="h-[33vh] bg-red-800">videoplayer</div>
          <div className="h-[62vh] bg-green-800">chat</div>
        </div>
      ) : (
        <div className="flex">
          <div className="w-[70vw]">
            <div className="h-[80vh] bg-red-800">videoplayer</div>
          </div>
          <div className="w-[30vw]">
            <div className=" h-[5vh]">
              <RoomButtons onLeaveRoom={onLeaveRoom} />
            </div>
            <div className="h-[95vh] bg-green-800 ">chat</div>
          </div>
        </div>
      )}
    </>
  );
};
const RoomButtons = ({ onLeaveRoom }: { onLeaveRoom: () => void }) => {
  return (
    <div className="flex h-[5vh] items-center justify-between px-2">
      <Button variant={"destructive"} onClick={() => onLeaveRoom()}>
        Leave
      </Button>
      <RoomSettingsDrawer />
      <TextGradient className="text-2xl md:text-xl">Gather Groove</TextGradient>
      <RoomPinDialog />
      <RoomMembersDrawer />
    </div>
  );
};
export default RoomPage;
