import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
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
import { useRoomStore } from "@/state/store";
import { Cross1Icon, PersonIcon } from "@radix-ui/react-icons";
import { ScrollArea } from "./ui/scroll-area";
import { useEffect, useRef, useState } from "react";
import { CgCrown } from "react-icons/cg";
import { GoPersonAdd } from "react-icons/go";
import { FaRegHourglass } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";

export function RoomMembersDrawer() {
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const { activeMembersList } = useRoomStore((s) => ({
    activeMembersList: s.roomData?.activeMembersList,
  }));

  console.log("[RoomMembersDrawer] currentRoom_members: ", activeMembersList);

  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button variant="outline">
          <PersonIcon className="h-4 w-4 md:h-6 md:w-6" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="right-0 ml-24 mr-0 max-w-[80vw] bg-background/80">
        <div className="flex h-full flex-col items-center justify-between ">
          <div></div>

          <DrawerClose asChild>
            {/* <Cross1Icon className="mt-3 h-6 w-6 cursor-pointer md:h-8 md:w-8" /> */}
            <div className="mx-auto ml-4 mr-4 h-[100px] w-2 rounded-full bg-muted" />
          </DrawerClose>
          <div></div>
        </div>
        <div className="h-full w-[80vw] max-w-sm pr-1 md:max-w-md">
          {/* <DrawerHeader>
            <DrawerTitle className="my-2 pr-4 text-center text-xl md:text-2xl">
              Members
            </DrawerTitle>
          </DrawerHeader> */}
          <ScrollArea viewportRef={scrollAreaRef} className="">
            <div className="mt-6 h-[95vh]">
              {activeMembersList &&
                [
                  ...activeMembersList!,
                  // ...activeMembersList!,
                  // ...activeMembersList!,
                  // ...activeMembersList!,
                  // ...activeMembersList!,
                  // ...activeMembersList!,
                  // ...activeMembersList!,
                ].map((m) => {
                  return <RoomMember _id={m} />;
                })}
            </div>
          </ScrollArea>
        </div>
      </DrawerContent>
    </Drawer>
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

        <div>
          <FriendshipButton
            _id={m._id}
            className="mr-6 size-6 cursor-pointer"
          />
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
  const [status, setStatus] = useState<
    "stranger" | "friend" | "reqSend" | "reqRec"
  >("stranger");
  console.log("[FriendshipButton] status", status);

  // const { data: user } = useGetNormalUser(_id);
  const { data: currentUser, isLoading: currentUserLoading } =
    useGetCurrentUser();
  console.log("[FriendshipButton] currentUser", currentUser);

  const {
    mutate: sendReq,
    data: sendReqData,
    isPending: sendReqPending,
  } = useSendFriendRequest();
  const {
    mutate: cancelReq,
    data: cancelReqData,
    isPending: cancelReqPending,
  } = useCancelFriendRequest();
  const {
    mutate: acceptReq,
    data: acceptReqData,
    isPending: acceptReqPending,
  } = useAcceptFriendRequest();
  const {
    mutate: rejectReq,
    data: rejectReqData,
    isPending: rejectReqPending,
  } = useRejectFriendRequest();

  const loading =
    sendReqPending || cancelReqPending || acceptReqPending || rejectReqPending;

  useEffect(() => {
    console.log(
      "[FriendshipButton useeffect] currentUserLoading",
      currentUserLoading,
    );
    if (!currentUser) return;
    if (currentUser?._id === _id || currentUser?.friends.includes(_id)) {
      setStatus("friend");
    } else if (currentUser?.friendReqsSent.includes(_id)) {
      setStatus("reqSend");
    } else if (currentUser?.friendReqsReceived.includes(_id)) {
      setStatus("reqRec");
    } else {
      setStatus("stranger");
    }
  }, [currentUserLoading]);

  useEffect(() => {
    console.log(
      "[FriendshipButton useeffect] ispendings:",
      sendReqPending,
      cancelReqPending,
      acceptReqPending,
      rejectReqPending,
    );
    if (sendReqData && !sendReqData?.startsWith("done")) {
      setStatus("stranger");
    }
    if (cancelReqData && !cancelReqData?.startsWith("done")) {
      setStatus("reqSend");
    }
    if (acceptReqData && !acceptReqData?.startsWith("done")) {
      setStatus("reqRec");
    }
    if (rejectReqData && !rejectReqData?.startsWith("done")) {
      setStatus("reqRec");
    }
  }, [sendReqData, cancelReqData, acceptReqData, rejectReqData]);

  if (loading) {
    return <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />;
  }
  if (status === "friend") {
    return <></>;
  }
  if (status === "reqSend") {
    return (
      <FaRegHourglass
        className={cn(className)}
        title="cancel request"
        onClick={() => {
          setStatus("stranger");
          cancelReq(_id);
        }}
      />
    );
  }
  if (status === "reqRec") {
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
  if (status === "stranger") {
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
  }
};
