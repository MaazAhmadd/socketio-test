import { useGlobalStore, useRoomStore } from "@/state/store";
import ConnectionStatus from "@/components/ConnectionStatus";
import { useEffect } from "react";
import { socket } from "@/socket";
import { Message, Room } from "server/src/types";
import { Button } from "@/components/ui/button";
import { useWindowSize } from "@/hooks/utilHooks";
import toast from "react-hot-toast";
import { RoomSettingsDrawer } from "@/components/RoomSettingsDrawer";
import { TextGradient } from "@/components/auth-page";
import { RoomPinDialog } from "@/components/RoomPinDialog";
import { RoomMembersDrawer } from "@/components/RoomMembersDrawer";
import { useNavigate, useParams } from "react-router-dom";
import { useGetRoom } from "@/hooks/roomHooks";
import { CardsChat } from "@/components/chatbox";
import { Chat } from "./chat";

const RoomPage = () => {
  console.log("[Room] render");
  const navigate = useNavigate();
  const { id } = useParams();
  console.log("[Room] id: ", id);
  const { data: room, isLoading, refetch: refetchRoom } = useGetRoom(id!);
  console.log("[Room] room: ", room, isLoading);

  const { width, height } = useWindowSize();

  const { setConnected, connected } = useGlobalStore((s) => ({
    setConnected: s.setConnected,
    connected: s.connected,
  }));

  const {
    roomData,
    setRoomData,
    updateActiveMembersList,
    addMessage,
    setMessages,
  } = useRoomStore((s) => ({
    roomData: s.roomData,
    setRoomData: s.setRoomData,
    updateActiveMembersList: s.updateActiveMembersList,
    addMessage: s.addMessage,
    setMessages: s.setMessages,
  }));

  console.log("[Room] roomData: ", roomData);

  useEffect(() => {
    console.log("[Room] loading effect");
    async function fetchRoom() {
      if (roomData) {
        await refetchRoom();
      }
    }
    fetchRoom();
  }, [id]);

  useEffect(() => {
    console.log("[Room] once effect");
    socket.connect();
    // socket.io.opts.query = { token: localStorage.getItem("auth_token") };
    // if (connected) {
    // }

    function onConnect() {
      console.log("[socket connect] connected");
      socket.emit("joinRoom", { roomId: id! });
      setConnected(true);
    }

    function onDisconnect() {
      console.log("[socket disconnect] disconnected");
      setRoomData(null);
      setMessages([]);
      setConnected(false);
    }

    function onStateError(err: string) {
      console.log("[socket stateError] stateError: ", err);
      toast.error(err);
      setConnected(false);
      // navigate("/home");
    }

    function onRoomDesc(data: Room) {
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
      console.log("[socket memberJoin] memberJoin: ", data);
      updateActiveMembersList(data);
    }
    function onMessage(data: Message) {
      addMessage(data);
      console.log("[socket message] message: ", data);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("activeMemberListUpdate", onActiveMemberListUpdate);
    socket.on("roomDesc", onRoomDesc);
    socket.on("stateError", onStateError);
    socket.on("connect_error", onConnectError);
    socket.on("message", onMessage);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("activeMemberListUpdate", onActiveMemberListUpdate);
      socket.off("roomDesc", onRoomDesc);
      socket.off("stateError", onStateError);
      socket.off("connect_error", onConnectError);
      socket.off("message", onMessage);
    };
  }, []);

  function onLeaveRoom() {
    socket.emit("leaveRoom");
    setConnected(false);
    setRoomData(null);
    setMessages([]);
    navigate("/home");
  }
  function onGiveLeader(targetMember: string) {
    socket.emit("giveLeader", { targetMember, roomId: id! });
  }
  // mobile videoplayer height 33vh
  // desktop chat width 30vw
  // turn to svh if caused issue on mobile
  const mobileView = width < 768;
  return (
    <>
      <ConnectionStatus />
      {mobileView ? (
        <div>
          <div className="h-[5vh]">
            <RoomButtons onLeaveRoom={onLeaveRoom} />
          </div>
          <div className="h-[33vh] bg-red-800">videoplayer</div>
          <div className="h-[62vh] ">
            <Chat socket={socket} screen={"mobile"} />
          </div>
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
            <div className="h-[95vh]  ">
              <Chat socket={socket} screen={"desktop"} />
            </div>
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
