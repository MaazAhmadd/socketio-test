import { Cross1Icon, PersonIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  // DrawerDescription,
  // DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
// import {useGlobalStore} from "@/state/store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FriendlistAccordian } from "./friendlistAccordian";

export function FriendsDrawer() {
  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className="fixed right-2 top-2 h-auto p-3 md:right-4 md:top-4 md:p-4 "
        >
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
        {/* horizontal */}
        {/* <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted " /> */}
        {/* vertical */}
        <div className="h-full w-[80vw] max-w-sm pr-5 md:max-w-md">
          {/* <div className="flex justify-between"> */}
          {/* <div></div> */}
          <DrawerHeader>
            <DrawerTitle className="my-2 pr-4 text-center text-xl md:text-2xl">
              Friends
            </DrawerTitle>
            {/* <DrawerDescription>Set your daily activity goal.</DrawerDescription> */}
            <div className="mb-4">
              <Label className="sr-only" htmlFor="searchPeople">
                Search Friends And Other People
              </Label>
              <Input
                id="searchPeople"
                placeholder="Search Friends And Other People"
                type="text"
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="off"
                className="bg-muted/80"
              />
            </div>
          </DrawerHeader>
          {/* </div> */}
          <div className=" flex flex-col items-center justify-center gap-2 py-4">
            <div className="flex w-full flex-col items-center justify-center rounded-md bg-primary-foreground/80 px-3">
              <FriendlistAccordian />
            </div>
            {/* <p className="text-md  text-center text-lg font-bold leading-none tracking-tight md:text-lg">
              Layout Settings
            </p> */}
          </div>
          {/* <DrawerFooter className="items-center">
            <DrawerClose asChild>
              <Button onClick={() => logout()}>Log Out</Button>
            </DrawerClose>
          </DrawerFooter> */}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
