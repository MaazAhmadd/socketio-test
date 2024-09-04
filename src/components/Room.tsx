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
import { useNavigate, useParams } from "react-router-dom";
import { useGetRoom } from "@/hooks/roomHooks";

const RoomPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: room, isLoading } = useGetRoom(id!);
  console.log("[Room] id: ", id);

  const { width, height } = useWindowSize();

  const { setConnected, connected } = useGlobalStore((s) => ({
    setConnected: s.setConnected,
    connected: s.connected,
  }));

  const { roomData, setRoomData, updateActiveMembersList, setMessages } =
    useRoomStore((s) => ({
      roomData: s.roomData,
      setRoomData: s.setRoomData,
      updateActiveMembersList: s.updateActiveMembersList,
      setMessages: s.setMessages,
    }));
  console.log("[Room] roomData: ", roomData);

  useEffect(() => {
    if (room) {
      setRoomData(room);
    }
  }, [isLoading]);

  useEffect(() => {
    console.log("[Room] Render, w-h", width, height);
    // socket.io.opts.query = { token: localStorage.getItem("auth_token") };
    // socket.connect();
    // if (connected) {
    socket.emit("joinRoom", { roomId: id! });
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
      setConnected(false);
      // navigate("/home");
    }

    function onRoomDesc(data: Room) {
      toast.success("room description received");
      console.log("[socket roomDesc] roomDesc: ", data);
      setRoomData(data);
    }

    function onConnectError(err: Error) {
      console.log("[socket connect_error] connect_error: ", err);
      toast.error(err.message);
      setConnected(false);
      // navigate("/home");
    }
    function onActiveMemberListUpdate(data: string[]) {
      toast.success("room memberJoin received");
      console.log("[socket memberJoin] memberJoin: ", data);
      updateActiveMembersList(data);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("activeMemberListUpdate", onActiveMemberListUpdate);
    socket.on("roomDesc", onRoomDesc);
    socket.on("stateError", onStateError);
    socket.on("connect_error", onConnectError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("activeMemberListUpdate", onActiveMemberListUpdate);
      socket.off("roomDesc", onRoomDesc);
      socket.off("stateError", onStateError);
      socket.off("connect_error", onConnectError);
    };
  }, []);
  function onLeaveRoom() {
    setConnected(false);
    setMessages([]);
    socket.emit("leaveRoom");
    navigate("/home");
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
