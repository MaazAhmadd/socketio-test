import { SettingsDrawer } from "@/components/SettingsDawer";
import { TextGradient } from "@/components/auth-page";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetPublicRooms } from "@/hooks";
import { cn } from "@/lib/utils";
import useGlobalStore from "@/state/store";
import { useEffect, useRef, useState } from "react";

export type Tabs = "public" | "invited" | "friends" | "createRoom";

const Authenticated = () => {
  const { showRoomTab, setShowRoomTab } = useGlobalStore((state) => ({
    showRoomTab: state.showRoomTab,
    setShowRoomTab: state.setShowRoomTab,
  }));
  return (
    <>
      <SettingsDrawer />
      <div className="md:container md:py-12  h-[100vh]">
        <div className="flex flex-col md:flex-row h-[100vh] justify-between">
          <LeftText />
          <div className=" md:px-4 md:pt-0 pt-2">
            <div className="px-5 mb-4">
              <Label className="sr-only" htmlFor="searchrooms">
                Search Rooms
              </Label>
              <Input
                id="searchrooms"
                placeholder="Search Rooms"
                type="text"
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="off"
              />
            </div>
            <div className="flex md:gap-24 justify-between md:justify-normal">
              <div className="flex gap-1">
                <TabButton
                  setBg={showRoomTab == "public" && "bg-muted"}
                  onClick={() => setShowRoomTab("public")}
                >
                  Public
                </TabButton>
                <TabButton
                  setBg={showRoomTab == "invited" && "bg-muted"}
                  onClick={() => setShowRoomTab("invited")}
                >
                  Invited
                </TabButton>
                <TabButton
                  setBg={showRoomTab == "friends" && "bg-muted"}
                  onClick={() => setShowRoomTab("friends")}
                >
                  Friends
                </TabButton>
              </div>

              <TabButton
                setBg={showRoomTab == "createRoom" && "bg-muted"}
                onClick={() => setShowRoomTab("createRoom")}
              >
                Create Room
              </TabButton>
            </div>
            <div>
              {showRoomTab == "public" && <Public />}
              {showRoomTab == "invited" && <Invited />}
              {showRoomTab == "friends" && <Friends />}
              {showRoomTab == "createRoom" && <CreateRoom />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Authenticated;

const TabButton = ({ className, setBg, ...props }: any) => {
  return (
    <button
      className={cn(
        "py-1 md:px-4 px-2 rounded-t-lg bg-primary-foreground scroll-m-20 text-md font-extrabold tracking-tight lg:text-xl text-muted-foreground border-muted border-2 ",
        setBg,
        className
      )}
      {...props}
    ></button>
  );
};

const LeftText = () => {
  return (
    <div className="md:mx-20 mx-10 self-center md:mb-20 flex flex-col md:gap-6 gap-2 text-center pt-3 md:pt-0">
      <TextGradient className="md:text-6xl xs:text-3xl text-2xl">
        Gather Groove{" "}
      </TextGradient>{" "}
      <h2 className="md:mt-1 scroll-m-20 mx-4 pb-2 md:text-3xl xs:text-xl text-lg  font-semibold tracking-tight transition-colors first:mt-0 text-primary md:text-pretty">
        Join a room and start watching together
      </h2>
    </div>
  );
};

const Public = () => {
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  // const [publicRooms] = useState([
  //   1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
  //   22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
  //   41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
  // ]);
  const { data: publicRooms } = useGetPublicRooms();
  console.log("[useGetPublicRooms] publicRooms: ", publicRooms);

  return (
    <ScrollArea viewportRef={scrollAreaRef} className="bg-muted  ">
      {/* <div className="bg-muted space-y-4 rounded-b-lg "> */}
      <div className="h-[75vh]">
        <ul>
          {!publicRooms && (
            <p className="p-4 text-center md:mt-1 scroll-m-20 mx-4 pb-2 md:text-2xl xs:text-xl text-lg  font-semibold tracking-tight transition-colors first:mt-0 text-primary md:text-pretty">
              No public rooms
            </p>
          )}
          {publicRooms && publicRooms.length < 1 && (
            <p className="p-4 text-center md:mt-1 scroll-m-20 mx-4 pb-2 md:text-2xl xs:text-xl text-lg  font-semibold tracking-tight transition-colors first:mt-0 text-primary md:text-pretty">
              No public rooms
            </p>
          )}
          {publicRooms?.map((r, i) => {
            return (
              <li
                key={i}
                className={cn(
                  "p-2 my-2 ",
                  i == publicRooms.length - 1 && "mb-[40vh]"
                )}
              >
                {r.status} | {r.members.length} | {r.members[0].handle}
              </li>
            );
          })}
          <br />
        </ul>
      </div>
    </ScrollArea>
  );
};

const Invited = () => {
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const [invitedRooms] = useState([]);
  // const { data: publicRooms } = useGetPublicRooms();
  return (
    <ScrollArea viewportRef={scrollAreaRef} className="bg-muted  ">
      {/* <div className="bg-muted space-y-4 rounded-b-lg "> */}
      <div className="h-[75vh]">
        <ul>
          {invitedRooms && invitedRooms.length < 1 && (
            <p className="p-4 text-center md:mt-1 scroll-m-20 mx-4 pb-2 md:text-2xl xs:text-xl text-lg  font-semibold tracking-tight transition-colors first:mt-0 text-primary md:text-pretty">
              No Invited rooms
            </p>
          )}
          {invitedRooms?.map((r, i) => {
            return (
              <li
                className={cn(
                  "p-2 my-2 ",
                  i == invitedRooms.length - 1 && "mb-[40vh]"
                )}
              >
                {r}
              </li>
            );
          })}
          <br />
        </ul>
      </div>
    </ScrollArea>
  );
};

const Friends = () => {
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const [friendsRooms] = useState([]);
  // const { data: publicRooms } = useGetPublicRooms();
  return (
    <ScrollArea viewportRef={scrollAreaRef} className="bg-muted  ">
      <div className="h-[75vh]">
        <ul>
          {friendsRooms && friendsRooms.length < 1 && (
            <p className="p-4 text-center md:mt-1 scroll-m-20 mx-4 pb-2 md:text-2xl xs:text-xl text-lg  font-semibold tracking-tight transition-colors first:mt-0 text-primary md:text-pretty">
              No Friends rooms
            </p>
          )}
          {friendsRooms?.map((r, i) => {
            return (
              <li
                className={cn(
                  "p-2 my-2 ",
                  i == friendsRooms.length - 1 && "mb-[40vh]"
                )}
              >
                {r}
              </li>
            );
          })}
          <br />
        </ul>
      </div>
    </ScrollArea>
  );
};

const CreateRoom = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [disableBtn, setDisableBtn] = useState(false);
  const { setRoute, setRoomCreationVideoUrl, setRoomCreationRequestType } =
    useGlobalStore((s) => ({
      setRoute: s.setRoute,
      setRoomCreationVideoUrl: s.setRoomCreationVideoUrl,
      setRoomCreationRequestType: s.setRoomCreationRequestType,
    }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDisableBtn(true);
    if (videoUrl) {
      console.log(
        "[createRoom onsubmit] about to createRoom videoUrl: ",
        videoUrl
      );
      setRoomCreationVideoUrl(videoUrl);
      setRoomCreationRequestType("create");
      setRoute("roomPage");
    }
  };
  useEffect(() => {
    setTimeout(() => {
      setDisableBtn(false);
    }, 2000);
  }, [disableBtn]);
  return (
    <div className="h-[75vh] bg-muted">
      <p className="p-4 text-center md:mt-1 scroll-m-20 mx-4 pb-2 md:text-2xl xs:text-xl text-lg  font-semibold tracking-tight transition-colors first:mt-0 text-primary md:text-pretty">
        Create Room
      </p>
      <form
        onSubmit={onSubmit}
        className="mx-4 md:mx-10 mt-[10vh] flex flex-col gap-4 items-end"
      >
        <Label className="sr-only" htmlFor="handle">
          Enter Url to play from
        </Label>
        <Input
          onChange={(e) => {
            setVideoUrl(e.target.value);
          }}
          value={videoUrl}
          id="handle"
          className="border-muted-foreground/50"
          placeholder="Enter Url to play from"
          type="text"
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="off"
          disabled={disableBtn}
        />
        <Button disabled={disableBtn} type="submit" className="">
          {disableBtn && (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          )}
          Create Room
        </Button>
      </form>
    </div>
  );
};
