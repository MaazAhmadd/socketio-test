import { cn } from "@/lib/utils";
import { socket } from "@/socket";
import { useEffect, useRef, useState } from "react";
import { DecodedUser } from "../../server/types/types";
// import { useGetAllRooms } from "@/hooks";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TextGradient } from "./auth-page";
// type Message = {
//   msg: string;
//   userId: string;
// };
export enum Tabs {
  public = "public",
  invited = "invited",
  friends = "friends",
  createRoom = "createRoom",
}
type Props = {
  user: DecodedUser;
};
const Authenticated = ({ user }: Props) => {
  console.log("user: ", user);

  const [isConnected, setIsConnected] = useState(socket.connected);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const [showRoomTab, setShowRoomTab] = useState<Tabs>(Tabs.public);
  const [allRoom] = useState([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
    41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
  ]);
  // const { data: allRoom } = useGetAllRooms();

  console.log("showRoomTab: ", showRoomTab == Tabs.public);

  useEffect(() => {
    // socket.connect();
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);
  return (
    <>
      <ConnectionStatus isConnected={isConnected} />
      <div className="md:container md:my-12 h-[100vh]">
        <div className="flex flex-col md:flex-row h-[100vh] justify-between">
          <div className="md:mx-20 mx-10 self-center md:mb-20 flex flex-col md:gap-6 gap-2 text-center pt-3 md:pt-0">
            <TextGradient className="md:text-6xl xs:text-3xl text-2xl">
              Gather Groove{" "}
            </TextGradient>{" "}
            <h2 className="md:mt-1 scroll-m-20  pb-2 md:text-3xl text-xl font-semibold tracking-tight transition-colors first:mt-0 hidden md:block text-primary text-pretty">
              Join a room to start watching together
            </h2>
          </div>

          <div className=" md:px-4 md:pt-0 pt-2">
            <div className="px-5 mb-4">
              <Label className="sr-only" htmlFor="email">
                Search Rooms
              </Label>
              <Input
                id="handle"
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
                  setBg={showRoomTab == Tabs.public && "bg-muted"}
                  onClick={() => setShowRoomTab(Tabs.public)}
                >
                  Public
                </TabButton>
                <TabButton
                  setBg={showRoomTab == Tabs.invited && "bg-muted"}
                  onClick={() => setShowRoomTab(Tabs.invited)}
                >
                  Invited
                </TabButton>
                <TabButton
                  setBg={showRoomTab == Tabs.friends && "bg-muted"}
                  onClick={() => setShowRoomTab(Tabs.friends)}
                >
                  Friends
                </TabButton>
              </div>

              <TabButton
                setBg={showRoomTab == Tabs.createRoom && "bg-muted"}
                onClick={() => setShowRoomTab(Tabs.createRoom)}
              >
                Create Room
              </TabButton>
            </div>
            <ScrollArea viewportRef={scrollAreaRef} className="bg-muted  ">
              {/* <div className="bg-muted space-y-4 rounded-b-lg "> */}
              <div className="max-h-[80vh] md:max-h-[525px]">
                <ul>
                  {allRoom?.map((r) => {
                    return <li className={cn("py-2 my-2")}>{r}</li>;
                  })}
                  <br />
                </ul>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </>
  );
};

export default Authenticated;

const ConnectionStatus = ({ isConnected }: { isConnected: boolean }) => {
  return (
    <span
      className={cn(
        "size-1 fixed top-0 right-0 bg-red-500 z-10",
        isConnected ? "bg-green-500" : ""
      )}
    ></span>
  );
};

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
