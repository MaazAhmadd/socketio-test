import api from "@/api";
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
import { Input } from "@/components/ui/input";
// import {useGlobalStore} from "@/state/store";
import { Label } from "@/components/ui/label";
import { Cross1Icon, PersonIcon } from "@radix-ui/react-icons";
import toast from "react-hot-toast";
import { FriendlistAccordian } from "./friendlist-accordian";

export function FriendsDrawer() {
	return (
		<Drawer direction="right">
			<DrawerTrigger asChild>
				<Button
					variant="outline"
					className="fixed top-2 right-2 rounded-lg p-[10px] md:top-4 md:right-4 md:px-[16px] md:py-[24px] "
				>
					<PersonIcon className="size-[18px] md:size-5" />
				</Button>
			</DrawerTrigger>
			<DrawerContent className="right-0 mr-0 ml-24 max-w-[80svw] bg-background/80">
				<div className="flex h-full flex-col items-center justify-between ">
					<DrawerClose asChild>
						<Cross1Icon className="mt-5 ml-5 h-6 w-6 cursor-pointer md:h-8 md:w-8" />
					</DrawerClose>
					<div className="mx-auto mr-6 ml-4 h-[100px] w-2 rounded-full bg-muted" />
					{process.env.NODE_ENV === "development" && (
						<div
							onClick={() => {
								api.get("/user/clearCache").then((res) => {
									toast.success(res.data);
								});
							}}
							className="mb-4 cursor-pointer"
						>
							x
						</div>
					)}
				</div>
				{/* horizontal */}
				{/* <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted " /> */}
				{/* vertical */}
				<div className="h-full w-[80svw] max-w-sm pr-5 md:max-w-md">
					{/* <div className="flex justify-between"> */}
					{/* <div></div> */}
					<DrawerHeader>
						<DrawerTitle className="my-2 pr-4 text-center text-xl md:text-2xl">
							Friends
						</DrawerTitle>
						{/* <DrawerDescription>Set your daily activity goal.</DrawerDescription> */}
						<div className="mb-4">
							{/* // TODO: add search functionality */}
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
					<div className="flex flex-col items-center justify-center gap-2 py-4">
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
