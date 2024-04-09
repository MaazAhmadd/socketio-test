import { GearIcon, Cross1Icon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
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

export function RoomSettingsDrawer() {
  return (
    <Drawer direction="top">
      <DrawerTrigger asChild>
        <Button variant="outline" className="">
          <GearIcon className="h-4 w-4 md:h-6 md:w-6" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="mb-24 mt-0 flex  h-min max-h-[50vh] w-[100vw] flex-col bg-background/80">
        {/* horizontal */}
        {/* <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted " /> */}
        {/* vertical */}
        <div className="">
          <DrawerHeader className="h-[7vh] py-0">
            <DrawerTitle className="my-2 text-center text-xl md:text-2xl">
              Settings
            </DrawerTitle>
          </DrawerHeader>
          <div className="flex w-[500px] max-w-[80vw] flex-col gap-2 rounded-md bg-muted/70 px-8 py-4">
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
                defaultValue={[50]}
                max={100}
                step={1}
                className={cn("w-[60%]")}
              />
            </div>
            <div className="flex items-center justify-between">
              <DrawerDescription>Speaker Volume:</DrawerDescription>
              <Slider
                defaultValue={[50]}
                max={100}
                step={1}
                className={cn("w-[60%]")}
              />
            </div>
          </div>
        </div>
        <div className="flex w-full items-center justify-between ">
          <div></div>
          <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted " />
          <DrawerClose asChild>
            <Cross1Icon className="my-4 mr-5 h-6 w-6 cursor-pointer   md:h-8 md:w-8" />
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

const SelectRoomPrivacy = () => {
  return (
    <Select>
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
    <Select>
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
    <Select>
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
