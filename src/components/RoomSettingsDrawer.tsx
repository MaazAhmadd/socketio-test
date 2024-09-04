import { GearIcon, Cross1Icon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerOverlay,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "./ui/slider";
import { cn } from "@/lib/utils";
import { useGlobalStore } from "@/state/store";

export function RoomSettingsDrawer() {
  const { roomSettingsDrawer, setRoomSettingsDrawer } = useGlobalStore((s) => ({
    roomSettingsDrawer: s.roomSettingsDrawer,
    setRoomSettingsDrawer: s.setRoomSettingsDrawer,
  }));
  return (
    <Drawer
      direction="top"
      open={roomSettingsDrawer}
      onClose={() => setRoomSettingsDrawer(false)}
    >
      <DrawerOverlay
        className="bg-black/0"
        onClick={() => setRoomSettingsDrawer(false)}
      />
      <DrawerTrigger asChild>
        <Button variant="outline" onClick={() => setRoomSettingsDrawer(true)}>
          <GearIcon className="h-4 w-4 md:h-6 md:w-6" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="right-0 mb-24 mt-0 flex h-min max-h-[50vh] w-[100vw] flex-col bg-background/80 md:w-[30vw]">
        {/* horizontal */}
        {/* <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted " /> */}
        {/* vertical */}
        <div className="">
          <DrawerHeader className="h-[7vh] py-0">
            <DrawerTitle className="my-2 text-center text-xl md:text-2xl">
              Settings
            </DrawerTitle>
          </DrawerHeader>
          <div className="flex w-[85vw] flex-col gap-2 rounded-md bg-muted/40 px-8 py-4 md:w-[28vw]">
            <div className="flex items-center justify-between">
              <DrawerDescription>Room Privacy:</DrawerDescription>
              <SelectRoomPrivacy />
            </div>
            <div className="flex items-center justify-between">
              <DrawerDescription>Playback:</DrawerDescription>
              <SelectPlayback />
            </div>
            <div className="flex items-center justify-between">
              <DrawerDescription>Microphone:</DrawerDescription>
              <SelectMicrophone />
            </div>
            <div className="flex items-center justify-between">
              <DrawerDescription>Video Volume:</DrawerDescription>
              <Slider
                defaultValue={[100]}
                max={100}
                step={1}
                className={cn("w-[60%]")}
              />
            </div>
            <div className="flex items-center justify-between">
              <DrawerDescription>Speaker Volume:</DrawerDescription>
              <Slider
                defaultValue={[100]}
                max={100}
                step={1}
                className={cn("w-[60%]")}
              />
            </div>
          </div>
        </div>
        <div className="flex w-full items-center justify-between ">
          <div></div>
          <div className="mx-auto mb-2 mt-4 h-2 w-[100px] rounded-full bg-muted" />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

const SelectRoomPrivacy = () => {
  return (
    <Select defaultValue="public">
      <SelectTrigger className="w-min">
        <SelectValue placeholder="Select privacy" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="public">Public</SelectItem>
          <SelectItem value="private">Private</SelectItem>
          <SelectItem value="friends">Friends</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

const SelectPlayback = () => {
  return (
    <Select defaultValue="voting">
      <SelectTrigger className="w-min">
        <SelectValue placeholder="Select Playback" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="voting">Voting</SelectItem>
          <SelectItem value="autoplay">Autoplay</SelectItem>
          <SelectItem value="justplay">Just Play</SelectItem>
          <SelectItem value="leaderschoice">Leader's choice</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

const SelectMicrophone = () => {
  return (
    <Select defaultValue="enabled">
      <SelectTrigger className="w-min">
        <SelectValue placeholder="Select mic" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="enabled">Enable</SelectItem>
          <SelectItem value="disabled">Disable</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
