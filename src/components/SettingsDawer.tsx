import { GearIcon, Cross1Icon, Pencil2Icon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  // DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,  
} from "@/components/ui/drawer";
import useGlobalStore from "@/state/store";

export function SettingsDrawer() {
  const { logout, decodedAuthToken } = useGlobalStore((state) => ({
    logout: state.logout,
    decodedAuthToken: state.decodedAuthToken,
  }));

  return (
    <Drawer direction="left">
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className="fixed left-2 top-2 h-auto p-3 md:left-4 md:top-4 md:p-4 "
        >
          <GearIcon className="h-4 w-4 md:h-6 md:w-6" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="ml-0 mr-24 bg-background/80 ">
        {/* horizontal */}
        {/* <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted " /> */}
        {/* vertical */}
        <div className="h-full w-[80vw] max-w-sm md:max-w-md pl-5">
          {/* <div className="flex justify-between"> */}
          {/* <div></div> */}
          <DrawerHeader>
            <DrawerTitle className="my-2 text-center text-xl md:text-2xl">
              Settings
            </DrawerTitle>
            {/* <DrawerDescription>Set your daily activity goal.</DrawerDescription> */}
          </DrawerHeader>
          {/* </div> */}
          <div className=" flex flex-col items-center justify-center gap-2  p-4">
            <div className="flex flex-col items-center justify-center rounded-md bg-primary-foreground/80 px-8 py-4 w-full">
              {decodedAuthToken?.profilePicture ? (
                <img
                  src={decodedAuthToken?.profilePicture}
                  className="mb-2 h-24 w-24 rounded-full"
                  alt=""
                />
              ) : (
                <div className="mb-2 h-24 w-24 rounded-full bg-muted-foreground"></div>
              )}
              <p className=" text-primary">
                {decodedAuthToken?.name || "Name"}
              </p>
              <p className="text-sm  text-muted-foreground">
                {" "}
                {decodedAuthToken?.handle || "Handle"}
              </p>
              <Button
                variant="ghost"
                className="mt-2 border border-primary/30"
                size="sm"
              >
                <Pencil2Icon />
                &nbsp;&nbsp; Edit
              </Button>
            </div>
            <div className="flex flex-col items-center justify-center rounded-md bg-primary-foreground/80 px-8 py-4 w-full h-[100px]">
            <p className="text-md  text-center text-lg font-bold leading-none tracking-tight md:text-lg">
              Layout Settings
            </p>
          </div>
          </div>
          <DrawerFooter className="items-center">
            <DrawerClose asChild>
              <Button onClick={() => logout()}>Log Out</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
        <div className="flex h-full flex-col items-center justify-between ">
          <DrawerClose asChild>
            <Cross1Icon className="mr-5 mt-5 h-6 w-6 cursor-pointer   md:h-8 md:w-8" />
          </DrawerClose>
          <div className="mx-auto ml-4 mr-6 h-[100px] w-2 rounded-full bg-muted" />
          <div></div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
