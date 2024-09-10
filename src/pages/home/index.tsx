import { SettingsDrawer } from "@/components/SettingsDrawer";
import { TextGradient } from "@/components/auth-page";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	useGetUserRooms,
	useGetSearchResults,
	useMakeRoom,
} from "@/hooks/roomHooks";
import { cn } from "@/lib/utils";
import { useGlobalStore, useRoomStore } from "@/store";
import { useEffect, useRef, useState } from "react";
import { FriendsDrawer } from "@/components/FriendsDrawer";
import RoomCard from "@/components/RoomCard";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/utilHooks";
import { Room, SupportedPlatforms, VideoInfo } from "server/src/types";
export type Tabs = "public" | "invited" | "friends" | "createRoom";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
	const { showRoomTab, setShowRoomTab } = useGlobalStore((state) => ({
		showRoomTab: state.showRoomTab,
		setShowRoomTab: state.setShowRoomTab,
	}));
	// let { refetch: getPublicRooms } = useGetUserRooms();

	return (
		<>
			<SettingsDrawer />
			<FriendsDrawer />
			<div className="h-[100vh] md:container  md:py-12">
				<div className="flex h-[100vh] flex-col justify-between md:flex-row">
					<LeftText />
					<div className=" max-w-[700px] pt-2 md:w-[700px] md:px-4 md:pt-0">
						<div className="mb-4 px-5">
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
						<div className="flex justify-between  md:gap-24">
							<div className="flex gap-1">
								<TabButton
									setBg={showRoomTab == "public" && "bg-muted"}
									onClick={() => {
										// getPublicRooms();
										setShowRoomTab("public");
									}}
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
							{showRoomTab == "public" && <RoomList roomType="public" />}
							{showRoomTab == "invited" && <RoomList roomType="invited" />}
							{showRoomTab == "friends" && <RoomList roomType="friends" />}
							{showRoomTab == "createRoom" && <CreateRoom />}
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default HomePage;

const TabButton = ({ className, setBg, ...props }: any) => {
	return (
		<button
			className={cn(
				"text-md scroll-m-20 rounded-t-lg border-2 border-muted bg-primary-foreground px-2 py-1 font-extrabold tracking-tight text-muted-foreground md:px-4 lg:text-xl ",
				setBg,
				className,
			)}
			{...props}
		></button>
	);
};

const LeftText = () => {
	return (
		<div className="mx-10 flex flex-col gap-2 self-center pt-3 text-center md:mx-20 md:mb-20 md:gap-6 md:pt-0">
			<TextGradient className="text-2xl xs:text-3xl md:text-6xl">
				Gather Groove{" "}
			</TextGradient>{" "}
			<h2 className="mx-4 scroll-m-20 pb-2 text-lg font-semibold tracking-tight text-primary  transition-colors first:mt-0 xs:text-xl md:mt-1 md:text-pretty md:text-3xl">
				Join a room and start watching together
			</h2>
		</div>
	);
};

const RoomList = ({
	roomType,
}: {
	roomType: "public" | "invited" | "friends";
}) => {
	const scrollAreaRef = useRef<HTMLDivElement | null>(null);
	// const [publicRooms] = useState([
	//   1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
	//   22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
	//   41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
	// ]);
	const navigate = useNavigate();
	const { data: allRooms, isFetching: roomsFetching } = useGetUserRooms();
	const rooms =
		roomType == "public"
			? allRooms?.publicRooms
			: roomType == "invited"
				? allRooms?.invitedRooms
				: allRooms?.friendsRooms;
	const loading = roomsFetching;
	const { setRoomData } = useRoomStore((s) => ({
		setRoomData: s.setRoomData,
	}));

	if (loading) {
		return (
			<ScrollArea
				viewportRef={scrollAreaRef}
				className="border-2  border-muted bg-primary-foreground  "
			>
				<div className="h-[75vh]">
					<Spinner />
				</div>
			</ScrollArea>
		);
	}

	return (
		<ScrollArea
			viewportRef={scrollAreaRef}
			className="border-2 border-muted bg-primary-foreground  "
		>
			{/* <div className="bg-muted space-y-4 rounded-b-lg "> */}
			<div className="h-[75vh]">
				<ul>
					{!rooms && (
						<p className="mx-4 scroll-m-20 p-4 pb-2 text-center text-lg font-semibold tracking-tight text-primary  transition-colors first:mt-0 xs:text-xl md:mt-1 md:text-pretty md:text-2xl">
							No {roomType} rooms
						</p>
					)}
					{rooms && rooms.length < 1 && (
						<p className="mx-4 scroll-m-20 p-4 pb-2 text-center text-lg font-semibold tracking-tight text-primary  transition-colors first:mt-0 xs:text-xl md:mt-1 md:text-pretty md:text-2xl">
							No {roomType} rooms
						</p>
					)}
					{rooms &&
						rooms.length > 0 &&
						rooms.map((room) => {
							console.log("[publicRooms] room: ", room);
							return (
								<RoomCard
									key={room.entityId}
									room={room}
									onClick={() => {
										// setRoomData(room);
										navigate("/room/" + room.entityId);
									}}
									className="mx-2  mr-4 mt-2 cursor-pointer overflow-hidden rounded-xl border border-background bg-background hover:border-muted-foreground focus:border-muted-foreground active:border-muted-foreground"
									// primary muted-foreground
								/>
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
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedPlatform, setSelectedPlatform] =
		useState<SupportedPlatforms>("youtube");
	const navigate = useNavigate();
	const {
		data: room,
		mutate: makeRoom,
		isPending: creatingRoom,
	} = useMakeRoom();

	const { setRoomData } = useRoomStore((s) => ({
		setRoomData: s.setRoomData,
	}));
	const debouncedSearchQuery = useDebounce(searchQuery, 1000);

	const { data: searchResults, isFetching: isFetchingSearchResults } =
		useGetSearchResults(searchQuery, debouncedSearchQuery, selectedPlatform);

	const onSubmitUrlForm = async (e: React.FormEvent) => {
		e.preventDefault();
		if (videoUrl) {
			console.log(
				"[createRoom onsubmit] about to createRoom videoUrl: ",
				videoUrl,
			);
			makeRoom(videoUrl);
		}
	};
	useEffect(() => {
		if (room) {
			setRoomData(room);
			navigate("/room/" + room?.entityId!);
		}
	}, [creatingRoom]);

	console.log("[createRoom] searchResults: ", searchResults);

	return (
		<div className="h-[75vh] border-2 border-muted bg-primary-foreground">
			<p className="mx-4 scroll-m-20 p-4 pb-2 text-center text-lg font-semibold tracking-tight text-primary  transition-colors first:mt-0 xs:text-xl md:mt-1 md:text-pretty md:text-2xl">
				Create Room
			</p>
			<form
				onSubmit={onSubmitUrlForm}
				className="mx-4 mt-4 flex items-end gap-4 md:mx-10"
			>
				<Label className="sr-only" htmlFor="handle">
					Play Using Url
				</Label>
				<Input
					onChange={(e) => {
						setVideoUrl(e.target.value);
					}}
					value={videoUrl}
					id="handle"
					className="border-muted-foreground/50"
					placeholder="Play Using Url"
					type="text"
					autoCapitalize="none"
					autoCorrect="off"
					autoComplete="off"
					disabled={creatingRoom}
				/>
				<Button disabled={creatingRoom || !videoUrl} type="submit" className="">
					{creatingRoom && (
						<Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
					)}
					Create Room
				</Button>
			</form>
			<div className="mx-4 mt-4 flex items-end gap-4 md:mx-10">
				<SelectSearchPlatform setSelectedValue={setSelectedPlatform} />
				<Label className="sr-only" htmlFor="searchQuery">
					Search
				</Label>
				<Input
					onChange={(e) => {
						setSearchQuery(e.target.value);
					}}
					value={searchQuery}
					id="handle"
					className="border-muted-foreground/50"
					placeholder="Search"
					type="text"
					autoCapitalize="none"
					autoCorrect="off"
					autoComplete="off"
					disabled={creatingRoom}
				/>
			</div>
			<div className="mx-4 mt-4 flex flex-wrap justify-center gap-4 overflow-y-hidden md:mx-10">
				{!isFetchingSearchResults && !searchResults && (
					<p className="text-pretty px-20 pb-20 pt-5 font-bold capitalize">
						start typing to search from {selectedPlatform} or select another
						platform to search from...
					</p>
				)}
				{isFetchingSearchResults && <Spinner />}
				{!isFetchingSearchResults &&
					searchResults?.map((r) => {
						return <ResultCard key={r.ytId} result={r} />;
					})}
			</div>
			<div className="mx-4 mt-4 flex flex-wrap justify-center gap-4 overflow-y-hidden md:mx-10">
				<RecentVideosDialog />
				<LikedVideosDialog />
			</div>
		</div>
	);
};

export const ResultCard = ({ result }: { result: VideoInfo }) => {
	const navigate = useNavigate();
	const { data: room, mutate: makeRoom, isPending } = useMakeRoom();
	useEffect(() => {
		if (room) {
			navigate("/room/" + room?.entityId!);
		}
	}, [isPending]);
	return (
		<div
			onClick={() => {
				makeRoom(result.ytId);
			}}
			className="h-[135px] w-[180px] cursor-pointer rounded-sm border border-muted hover:border-muted-foreground"
			style={{
				backgroundImage: `url(${result.thumbnail})`,
				backgroundSize: "cover",
				backgroundRepeat: "no-repeat",
				backgroundPosition: "center",
			}}
		>
			<div className="flex h-full flex-col justify-between">
				<div className="flex flex-col items-end ">
					<span className="rounded-sm bg-muted/70 p-1 text-sm font-bold leading-tight text-white">
						{result.duration}
					</span>
				</div>
				<p className="rounded-t-sm bg-muted/70 px-2 text-sm font-bold leading-tight text-white">
					{trimString(result.title)}
				</p>
			</div>
		</div>
	);
};

export function trimString(str: string) {
	if (str.length > 40) {
		return str.slice(0, 40) + "...";
	}
	return str;
}

export const SelectSearchPlatform = ({
	setSelectedValue,
}: {
	setSelectedValue: (v: any) => void;
}) => {
	const handleChange = (value: any) => {
		setSelectedValue(value);
	};
	return (
		<Select defaultValue="youtube" onValueChange={handleChange}>
			<SelectTrigger className="w-min">
				<SelectValue placeholder="Select platform" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup className="">
					<SelectItem value="youtube">Youtube</SelectItem>
					<SelectItem value="netflix">Netflix</SelectItem>
					<SelectItem value="prime">Prime</SelectItem>
				</SelectGroup>
			</SelectContent>
		</Select>
	);
};

export function RecentVideosDialog() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="secondary">Recent</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Edit profile</DialogTitle>
					<DialogDescription>
						Make changes to your profile here. Click save when you're done.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="name" className="text-right">
							Name
						</Label>
						<Input id="name" value="Pedro Duarte" className="col-span-3" />
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="username" className="text-right">
							Username
						</Label>
						<Input id="username" value="@peduarte" className="col-span-3" />
					</div>
				</div>
				<DialogFooter>
					<Button type="submit">Save changes</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function LikedVideosDialog() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="secondary">Liked</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Edit profile</DialogTitle>
					<DialogDescription>
						Make changes to your profile here. Click save when you're done.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="name" className="text-right">
							Name
						</Label>
						<Input id="name" value="Pedro Duarte" className="col-span-3" />
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="username" className="text-right">
							Username
						</Label>
						<Input id="username" value="@peduarte" className="col-span-3" />
					</div>
				</div>
				<DialogFooter>
					<Button type="submit">Save changes</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export const Spinner = ({ className }: { className?: string }) => {
	return (
		<div className={cn("flex h-[20vh] items-center justify-center", className)}>
			<div
				className="text-surface inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
				role="status"
			>
				<span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
					Loading...
				</span>
			</div>
		</div>
	);
};
