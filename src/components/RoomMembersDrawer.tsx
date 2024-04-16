import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useGlobalStore, useRoomStore } from "@/state/store";
import { Cross1Icon, PersonIcon } from "@radix-ui/react-icons";

export function RoomMembersDrawer() {
  const { currentRoom_members } = useRoomStore((s) => ({
    currentRoom_members: s.currentRoom_members,
  }));
  const { decodedAuthToken } = useGlobalStore((s) => ({
    decodedAuthToken: s.decodedAuthToken,
  }));
  console.log("[RoomMembersDrawer] currentRoom_members: ", currentRoom_members);

  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button variant="outline">
          <PersonIcon className="h-4 w-4 md:h-6 md:w-6" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="right-0 ml-24 mr-0 max-w-[80vw] bg-background/80">
        <div className="flex h-full flex-col items-center justify-between ">
          <DrawerClose asChild>
            <Cross1Icon className="ml-5 mt-5 h-6 w-6 cursor-pointer   md:h-8 md:w-8" />
          </DrawerClose>
          <div className="mx-auto ml-4 mr-6 h-[100px] w-2 rounded-full bg-muted" />
          <div></div>
        </div>
        <div className="h-full w-[80vw] max-w-sm pr-5 md:max-w-md">
          <DrawerHeader>
            <DrawerTitle className="my-2 pr-4 text-center text-xl md:text-2xl">
              Members
            </DrawerTitle>
          </DrawerHeader>
          <div>
            {currentRoom_members.map((m) => {
              return (
                <div>
                  member:
                  {m.name || "name"}|{m.handle}|
                  {m.isLeader ? "(leader)" : "(member)"}|
                  {decodedAuthToken?.handle == m.handle ? "(me)" : ""}
                </div>
              );
            })}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
