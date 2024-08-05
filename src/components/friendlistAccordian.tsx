import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  useAcceptFriendRequest,
  useCancelFriendRequest,
  useGetCurrentUser,
  useGetUser,
  useRejectFriendRequest,
  useRemoveFriend,
  useSendFriendRequest,
} from "@/hooks/userHooks";
import { Icons } from "@/components/icons";
import { MemberPfpIcon } from "./RoomCard";
import { Button } from "./ui/button";
import { Spinner } from "./Authenticated";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { CurrentUser } from "server/src/types";

export function FriendlistAccordian() {
  let recents = [
    "6627f8fe91f2c742c09e01e8",
    "6627fc2791f2c742c09e01f9",
    "6627fc3f91f2c742c09e0201",
  ];
  // const currentUser = useGlobalStore((state) => state.currentUser);
  const { data: currentUser, isFetching: isCurrentUserFetching } =
    useGetCurrentUser();

  return (
    <Accordion type="single" collapsible className="w-full">
      {/* <Accordion type="multiple"  className="w-full pr-4"> */}
      <AccordionItem value="item-1">
        <AccordionTrigger>Friends</AccordionTrigger>
        {isCurrentUserFetching && (
          <AccordionContent>
            <Spinner className="h-[200px]" />
          </AccordionContent>
        )}
        {!isCurrentUserFetching && (
          <AccordionContent
            className={cn(
              "grid grid-cols-2 justify-center justify-items-center gap-2 md:grid-cols-3",
            )}
          >
            {(!currentUser?.friends || currentUser?.friends.length < 1) &&
              "Friend List..."}
            {currentUser?.friends?.map((f, i) => (
              <Friend _id={f} key={i} currentUser={currentUser} />
            ))}
          </AccordionContent>
        )}
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Friend Requests</AccordionTrigger>
        {isCurrentUserFetching && (
          <AccordionContent>
            <Spinner className="h-[200px]" />
          </AccordionContent>
        )}
        {!isCurrentUserFetching && (
          <AccordionContent
            className={cn(
              "grid grid-cols-2 justify-center justify-items-center gap-2 md:grid-cols-3",
            )}
          >
            {(!currentUser?.friendReqsReceived ||
              currentUser?.friendReqsReceived.length < 1) &&
              "Friend Requests..."}
            {currentUser?.friendReqsReceived.map((f, i) => (
              <FriendRequest _id={f} key={i} currentUser={currentUser} />
            ))}
          </AccordionContent>
        )}
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Recents</AccordionTrigger>
        {/* <AccordionContent>Recents coming soon...</AccordionContent> */}
        <AccordionContent className="grid grid-cols-2 justify-center justify-items-center gap-2 md:grid-cols-3">
          {recents.map((r, i) => {
            if (r == currentUser?._id) {
              return;
            } else {
              return <Recent key={i} _id={r} currentUser={currentUser} />;
            }
          })}
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-4">
        <AccordionTrigger>Blocked</AccordionTrigger>
        <AccordionContent>Blocked coming soon...</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

const Friend = ({
  _id,
  currentUser,
}: {
  _id: string;
  currentUser: CurrentUser;
}) => {
  const { data: targetUser } = useGetUser(_id);
  const { mutate: removeFriend, isPending } = useRemoveFriend();

  useEffect(() => {
    console.log("Friend render");
  });
  if (!targetUser) return;
  return (
    <div className=" relative flex w-[120px] flex-col justify-center gap-1 rounded border border-muted bg-muted/50 p-2 text-center transition-all duration-150 hover:border-muted-foreground/40">
      <MemberPfpIcon
        isFriend={currentUser?.friends.includes(targetUser._id)}
        _id={targetUser._id}
        pfp={targetUser.pfp}
        className="mx-auto size-[60px] md:size-[75px]"
      />
      <p
        className="text-primary"
        style={{
          overflowWrap: "break-word",
        }}
      >
        {targetUser.name || "name"}
      </p>
      <p
        className="text-sm text-muted-foreground"
        style={{
          overflowWrap: "break-word",
        }}
      >
        @{targetUser.handle}
      </p>
      <div className=" flex justify-center ">
        <Button
          variant="ghost"
          size={"sm"}
          className="h-6 border border-red-700 px-[6px] text-[12px]"
          onClick={() => {
            removeFriend(targetUser._id);
          }}
          disabled={isPending}
        >
          {isPending ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Remove"
          )}
        </Button>
      </div>
    </div>
  );
};

const FriendRequest = ({
  _id,
  currentUser,
}: {
  _id: string;
  currentUser: CurrentUser;
}) => {
  const { data: targetUser } = useGetUser(_id);
  const { mutate: acceptFriendRequest, isPending: isPendingAccept } =
    useAcceptFriendRequest();
  const { mutate: rejectFriendRequest, isPending: isPendingReject } =
    useRejectFriendRequest();

  // useEffect(() => {});
  if (!targetUser) return;
  return (
    <div className="group/friend relative flex w-[120px] flex-col justify-center gap-1 rounded border border-muted bg-muted/50 p-2 text-center transition-all duration-150 hover:border-muted-foreground/40">
      <MemberPfpIcon
        isFriend={currentUser?.friends.includes(targetUser._id)}
        _id={targetUser._id}
        pfp={targetUser.pfp}
        className="mx-auto size-[60px] md:size-[75px]"
      />
      <p
        className="text-primary"
        style={{
          overflowWrap: "break-word",
        }}
      >
        {targetUser?.name || "name"}
      </p>
      <p
        className="text-sm text-muted-foreground"
        style={{
          overflowWrap: "break-word",
        }}
      >
        @{targetUser?.handle}
      </p>
      <div className=" flex gap-[2px]">
        <Button
          variant="ghost"
          size={"sm"}
          className="h-6 border border-red-700 px-[6px] text-[12px]"
          onClick={() => {
            rejectFriendRequest(targetUser._id);
          }}
          disabled={isPendingReject}
        >
          {isPendingReject ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Reject"
          )}
        </Button>
        <Button
          variant="ghost"
          size={"sm"}
          className="h-6 border border-green-700 px-[6px] text-[12px]"
          onClick={() => {
            acceptFriendRequest(targetUser._id);
          }}
          disabled={isPendingAccept}
        >
          {isPendingAccept ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Accept"
          )}
        </Button>
      </div>
    </div>
  );
};
const Recent = ({
  _id,
  currentUser,
}: {
  _id: string;
  currentUser?: CurrentUser | null;
}) => {
  const { data: targetUser } = useGetUser(_id);
  const { mutate: addFriend, isPending: isPendingAdd } = useSendFriendRequest();
  const { mutate: cancelFriendRequest, isPending: isPendingCancel } =
    useCancelFriendRequest();
  const { mutate: rejectFriendRequest, isPending: isPendingReject } =
    useRejectFriendRequest();
  const { mutate: acceptFriendRequest, isPending: isPendingAccept } =
    useAcceptFriendRequest();

  if (currentUser?._id == _id) return;
  if (!targetUser) return;
  if (currentUser?.friends.includes(_id)) return;
  return (
    <div className=" relative flex w-[120px] flex-col justify-center gap-1 rounded border border-muted bg-muted/50 p-2 text-center transition-all duration-150 hover:border-muted-foreground/40">
      {targetUser && (
        <MemberPfpIcon
          isFriend={currentUser?.friends.includes(targetUser._id) || false}
          _id={targetUser._id}
          pfp={targetUser.pfp}
          className="mx-auto size-[60px] md:size-[75px]"
        />
      )}
      <p
        className="text-primary"
        style={{
          overflowWrap: "break-word",
        }}
      >
        {targetUser.name || "name"}
      </p>
      <p
        className="text-sm text-muted-foreground"
        style={{
          overflowWrap: "break-word",
        }}
      >
        @{targetUser.handle}
      </p>
      <div className=" flex justify-center ">
        {currentUser?.friendReqsReceived.includes(_id) ? (
          <div className=" flex gap-[2px]">
            <Button
              variant="ghost"
              size={"sm"}
              className="h-6 border border-red-700 px-[6px] text-[12px]"
              onClick={() => {
                rejectFriendRequest(_id);
              }}
              disabled={isPendingReject}
            >
              {isPendingReject ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Reject"
              )}
            </Button>
            <Button
              variant="ghost"
              size={"sm"}
              className="h-6 border border-green-700 px-[6px] text-[12px]"
              onClick={() => {
                acceptFriendRequest(_id);
              }}
              disabled={isPendingAccept}
            >
              {isPendingAccept ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Accept"
              )}
            </Button>
          </div>
        ) : currentUser?.friendReqsSent.includes(_id) ? (
          <Button
            variant="ghost"
            size={"sm"}
            className="h-6 border border-red-700 px-[6px] text-[12px]"
            onClick={() => {
              cancelFriendRequest(_id);
            }}
            disabled={isPendingCancel}
          >
            {isPendingCancel ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Cancel Request"
            )}
          </Button>
        ) : (
          <Button
            variant="ghost"
            size={"sm"}
            className="h-6 border border-green-700 px-[6px] text-[12px]"
            onClick={() => {
              addFriend(_id);
            }}
            disabled={isPendingAdd}
          >
            {isPendingAdd ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Add Friend"
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
