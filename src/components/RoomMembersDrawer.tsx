import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerOverlay,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useAcceptFriendRequest,
  useCancelFriendRequest,
  useGetCurrentUser,
  useGetNormalUser,
  useRejectFriendRequest,
  useSendFriendRequest,
} from "@/hooks/userHooks";
import { cn, getHexColorFromString } from "@/lib/utils";
import { useGlobalStore, useRoomStore } from "@/state/store";
import { Cross1Icon, PersonIcon } from "@radix-ui/react-icons";
import { ScrollArea } from "./ui/scroll-area";
import { useEffect, useRef, useState } from "react";
import { CgCrown } from "react-icons/cg";
import { GoPersonAdd } from "react-icons/go";
import { FaRegHourglass } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";
import api from "@/api";
import { toast } from "react-hot-toast";
export function RoomMembersDrawer() {
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const { activeMembersList } = useRoomStore((s) => ({
    activeMembersList: s.roomData?.activeMembersList,
  }));
  const { roomMembersDrawer, setRoomMembersDrawer } = useGlobalStore((s) => ({
    roomMembersDrawer: s.roomMembersDrawer,
    setRoomMembersDrawer: s.setRoomMembersDrawer,
  }));

  console.log("[RoomMembersDrawer] activeMembersList: ", activeMembersList);

  return (
    <>
      <Drawer
        direction="right"
        open={roomMembersDrawer}
        onClose={() => setRoomMembersDrawer(false)}
      >
        <DrawerOverlay
          className="bg-black/0"
          onClick={() => setRoomMembersDrawer(false)}
        />
        <DrawerTrigger asChild>
          <Button variant="outline" onClick={() => setRoomMembersDrawer(true)}>
            <PersonIcon className="h-4 w-4 md:h-6 md:w-6" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="right-0 ml-24 mr-0 max-w-[80vw] bg-background/80">
          <div className="flex h-full flex-col items-center justify-between ">
            <div></div>
            <DrawerClose asChild>
              {/* <Cross1Icon className="mt-3 h-6 w-6 cursor-pointer md:h-8 md:w-8" /> */}
              <div
                onClick={() => setRoomMembersDrawer(false)}
                className="mx-auto ml-4 mr-4 h-[100px] w-2 rounded-full bg-muted"
              />
            </DrawerClose>
            <div></div>
          </div>
          <div className="h-full w-[80vw] max-w-sm pr-1 md:max-w-[27vw]">
            {/* <DrawerHeader>
            <DrawerTitle className="my-2 pr-4 text-center text-xl md:text-2xl">
              Members
            </DrawerTitle>
          </DrawerHeader> */}
            <ScrollArea viewportRef={scrollAreaRef} className="">
              <div className="mt-6 h-[95vh]">
                {activeMembersList?.map((m) => {
                  return <RoomMember _id={m} key={m} />;
                })}
              </div>
            </ScrollArea>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

const RoomMember = ({ _id }: { _id: string }) => {
  const { data: currentUser } = useGetCurrentUser();
  const { data: m } = useGetNormalUser(_id);
  const { activeMembersList } = useRoomStore((s) => ({
    activeMembersList: s.roomData?.activeMembersList,
  }));
  return (
    currentUser &&
    m && (
      <div className="relative mb-6 flex items-center justify-between gap-4">
        {activeMembersList && activeMembersList[0] === _id && (
          <CgCrown className="absolute left-[2px] top-[-18px] size-6 rotate-[-18deg]" />
        )}
        <div className="flex items-center gap-4">
          <RoomMembersDrawerPfpIcon _id={m._id} />
          <div className="flex flex-col items-start">
            <div className="text-gray-200">{m.name || "name"}</div>
            <div className="mb-2">
              <span>()</span>
              <span className="ml-1 text-gray-400">@{m.handle}</span>
            </div>
          </div>
        </div>
        {currentUser._id === m._id && (
          <Button
            size={"sm"}
            variant={"destructive"}
            onClick={() => {
              api
                .get("/user/unfriendAll")
                .then((res) => toast.success(res.data));
            }}
          >
            rm all frs
          </Button>
        )}
        <div>
          <FriendshipButton _id={m._id} />
        </div>
      </div>
    )
  );
};

const RoomMembersDrawerPfpIcon = ({
  _id,
  className,
}: {
  _id: string;
  className?: string;
}) => {
  const randomColor = getHexColorFromString(_id);
  const { data: user } = useGetNormalUser(_id);
  const { data: currentUser } = useGetCurrentUser();
  const isFriend =
    currentUser?._id === _id || currentUser?.friends.includes(_id);
  return (
    user &&
    (user.pfp ? (
      <img
        src={user.pfp}
        alt=""
        className={cn(
          "size-[52px] rounded-full object-cover p-[2px]",
          isFriend ? "size-[56px] border border-primary" : "", // if friend
          className,
        )}
      />
    ) : (
      <div
        key={_id}
        style={{
          backgroundImage: `linear-gradient(to bottom, ${randomColor} 0%, ${randomColor} 100%), linear-gradient(to bottom, hsl(var(--muted)) 0%, hsl(var(--muted)) 100%)`,
          backgroundClip: isFriend ? "content-box, padding-box" : "",
        }}
        className={cn(
          "size-[52px] rounded-full p-[2px]",
          isFriend ? "size-[56px] border border-primary" : "", // if friend
          className,
        )}
      ></div>
    ))
  );
};

const FriendshipButton = ({
  _id,
  className,
}: {
  _id: string;
  className?: string;
}) => {
  className = cn("mr-6 size-6 cursor-pointer", className);
  const [status, setStatus] = useState<
    "stranger" | "friend" | "reqSend" | "reqRec"
  >("stranger");
  // console.log("[FriendshipButton] status", status);

  const { data: currentUser, isLoading: currentUserLoading } =
    useGetCurrentUser();
  // console.log("[FriendshipButton] currentUser", currentUser);

  const { mutate: sendReq, isPending: sendReqPending } = useSendFriendRequest();
  const { mutate: cancelReq, isPending: cancelReqPending } =
    useCancelFriendRequest();
  const { mutate: acceptReq, isPending: acceptReqPending } =
    useAcceptFriendRequest();
  const { mutate: rejectReq, isPending: rejectReqPending } =
    useRejectFriendRequest();

  const loading =
    sendReqPending ||
    cancelReqPending ||
    acceptReqPending ||
    rejectReqPending ||
    currentUserLoading;

  if (loading) {
    return <Icons.spinner className={cn("animate-spin", className)} />;
  }

  if (
    !currentUser ||
    currentUser?._id === _id ||
    currentUser?.friends.includes(_id)
  ) {
    return <></>;
  }
  if (currentUser?.friendReqsSent.includes(_id)) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger>
          <FaRegHourglass className={cn(className)} title="cancel request" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => {
              setStatus("stranger");
              cancelReq(_id);
            }}
          >
            Cancel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  if (currentUser?.friendReqsReceived.includes(_id)) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger>
          <BsThreeDots className={cn(className)} title="accept request" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => {
              setStatus("friend");
              acceptReq(_id);
            }}
          >
            Accept
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setStatus("stranger");
              rejectReq(_id);
            }}
          >
            Reject
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <GoPersonAdd className={cn(className)} title="add friend" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() => {
            setStatus("reqSend");
            sendReq(_id);
          }}
        >
          Add Friend
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
