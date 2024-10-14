import { Icons } from "@/components/common/icons";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	AllRoomsObject,
	useGetSearchResults,
	useGetUserRooms,
	useMakeRoom,
} from "@/hooks/room-hooks";
import { useDebounce } from "@/hooks/util-hooks";
import { cn, parseYouTubeDuration } from "@/lib/utils";
import { useGlobalStore, useRoomStore } from "@/store";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SupportedPlatforms, VideoInfo } from "server/src/types";
import { TextGradient } from "@/components/common/text-gradient";
import { FriendsDrawer } from "./friends-drawer";
import RoomCard from "./room-card";
import { SettingsDrawer } from "./settings-drawer";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, useForm } from "react-hook-form";
import { z } from "zod";
import { FaYoutube } from "react-icons/fa";
import { TiPin } from "react-icons/ti";
import { useYoutubeInfo } from "@/hooks/video-player-hooks";

export type Tabs = "public" | "invited" | "friends" | "createRoom";

const HomePage = () => {
	const { showRoomTab, setShowRoomTab } = useGlobalStore((state) => ({
		showRoomTab: state.showRoomTab,
		setShowRoomTab: state.setShowRoomTab,
	}));
	const { data: allRooms, isFetching: roomsFetching } = useGetUserRooms();
	// let { refetch: getPublicRooms } = useGetUserRooms();

	return (
		<>
			<SettingsDrawer />
			<FriendsDrawer />
			<div className="h-[100svh] bg-primary-foreground md:container md:py-6">
				<div className="flex h-[100svh] flex-col items-center justify-between md:flex-row">
					<LeftText />
					<div className=" w-[100svw] pt-2 md:w-[80svw] md:px-4 md:pt-0 lg:max-w-[650px]">
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
						<div className="flex justify-between">
							<div className="flex gap-1">
								<TabButton
									setBg={showRoomTab == "public" ? "bg-muted" : ""}
									onClick={() => {
										// getPublicRooms();
										setShowRoomTab("public");
									}}
								>
									Public
								</TabButton>
								<TabButton
									setBg={showRoomTab == "invited" ? "bg-muted" : ""}
									onClick={() => setShowRoomTab("invited")}
									showIndicator={allRooms?.invitedRooms?.length}
								>
									Invited
								</TabButton>
								<TabButton
									setBg={showRoomTab == "friends" ? "bg-muted" : ""}
									onClick={() => setShowRoomTab("friends")}
									showIndicator={allRooms?.friendsRooms?.length}
								>
									Friends
								</TabButton>
							</div>

							<TabButton
								setBg={showRoomTab == "createRoom" ? "bg-muted" : ""}
								onClick={() => setShowRoomTab("createRoom")}
							>
								Create Room
							</TabButton>
						</div>
						<div>
							{showRoomTab == "public" && (
								<RoomList allRooms={allRooms} roomType="public" />
							)}
							{showRoomTab == "invited" && (
								<RoomList allRooms={allRooms} roomType="invited" />
							)}
							{showRoomTab == "friends" && (
								<RoomList allRooms={allRooms} roomType="friends" />
							)}
							{showRoomTab == "createRoom" && <CreateRoom />}
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default HomePage;

const TabButton = ({
	className,
	setBg,
	onClick,
	showIndicator = 0,
	children,
}: {
	className?: string;
	setBg: string;
	onClick: () => void;
	showIndicator?: number;
	children: React.ReactNode | string;
}) => {
	return (
		<button
			onClick={onClick}
			className={cn(
				"relative scroll-m-20 whitespace-nowrap rounded-t-lg border-2 border-muted bg-primary-foreground px-2 py-1 font-extrabold text-muted-foreground text-sm tracking-tight md:px-4 md:text-base lg:text-lg",
				setBg,
				className,
			)}
		>
			{showIndicator ? (
				<span className="-top-1 -right-1 absolute size-2 rounded-full bg-red-600"></span>
			) : null}
			{children}
		</button>
	);
};

const LeftText = () => {
	return (
		<div className="mx-10 flex flex-col gap-2 self-center pt-3 text-center md:mx-20 md:mb-20 md:gap-6 md:pt-0">
			<TextGradient className="text-xl sm:text-3xl md:text-6xl">
				Gather Groove{" "}
			</TextGradient>{" "}
			<h2 className="mx-0 mb-2 scroll-m-20 text-muted-foreground text-sm tracking-tight transition-colors first:mt-0 sm:mx-2 sm:text-lg md:mt-1 md:text-pretty lg:text-3xl">
				Join a room and start watching together
			</h2>
		</div>
	);
};

const RoomList = ({
	roomType,
	allRooms,
}: {
	roomType: "public" | "invited" | "friends";
	allRooms: AllRoomsObject | undefined;
}) => {
	const scrollAreaRef = useRef<HTMLDivElement | null>(null);
	const navigate = useNavigate();
	const rooms =
		roomType == "public"
			? allRooms?.publicRooms
			: roomType == "invited"
				? allRooms?.invitedRooms
				: allRooms?.friendsRooms;
	const loading = !allRooms;
	const { setLoading } = useRoomStore((s) => ({
		setLoading: s.setLoading,
	}));

	if (loading) {
		return (
			<ScrollArea
				viewportRef={scrollAreaRef}
				className="border-2 border-muted bg-primary-foreground "
			>
				<div className="h-[75svh]">
					<Spinner />
				</div>
			</ScrollArea>
		);
	}

	return (
		<ScrollArea
			viewportRef={scrollAreaRef}
			className="border-2 border-muted bg-primary-foreground "
		>
			{/* <div className="bg-muted space-y-4 rounded-b-lg "> */}
			<div className="h-[75svh] px-1 pt-2 lg:px-2">
				<ul>
					{!rooms && (
						<p className="mx-4 scroll-m-20 p-4 pb-2 text-center font-semibold text-lg text-primary xs:text-xl tracking-tight transition-colors first:mt-0 md:mt-1 md:text-pretty md:text-2xl">
							No {roomType} rooms
						</p>
					)}
					{rooms && rooms.length < 1 && (
						<p className="mx-4 scroll-m-20 p-4 pb-2 text-center font-semibold text-lg text-primary xs:text-xl tracking-tight transition-colors first:mt-0 md:mt-1 md:text-pretty md:text-2xl">
							No {roomType} rooms
						</p>
					)}
					{rooms &&
						rooms.length > 0 &&
						// [...new Array(20).fill(0).map((_, i) => rooms[0])].map((room) => {
						rooms.map((room) => { 
							return (
								<RoomCard
									key={room.entityId}
									room={room}
									onClick={() => {
										// setRoomData(room);
										setLoading(true);
										navigate("/room/" + room.entityId);
									}}
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
	const [url, setUrl] = useState("");
	const schema = z.object({
		url: z
			.string()
			.min(11, "url should me minimum 11 characters")
			.max(512, "url should me maximum 512 characters"),
	});
	type FormData = z.infer<typeof schema>;
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(schema),
	});
	const { info, error, setError, isLoading, player } = useYoutubeInfo(url);

	const {
		data: room,
		mutate: makeRoom,
		isPending: makingRoom,
		isError: roomMakingError,
	} = useMakeRoom();

	useEffect(() => {
		if (info.duration) {
			makeRoom({ url, duration: info.duration });
		}
	}, [info.duration]);

	const onSubmitUrlForm = async (data: FieldValues) => {
		if (data) {
			setError("");
			setUrl(data.url);
		}
	};

	return (
		<div className="h-[75svh] border-2 border-muted bg-primary-foreground">
			{player}
			<p className="mx-4 scroll-m-20 p-4 pb-2 text-center font-semibold text-lg text-primary xs:text-xl tracking-tight transition-colors first:mt-0 md:mt-1 md:text-pretty md:text-2xl">
				Create Room
			</p>
			<form
				onSubmit={handleSubmit(onSubmitUrlForm)}
				className="mx-4 mt-4 flex items-center gap-4 md:mx-10"
			>
				{/* <Button variant={"secondary"}>Youtube</Button> */}
				<FaYoutube className="h-9 w-14 text-[#FF0000]" />
				<Label className="sr-only" htmlFor="searchquery">
					Play Using Url
				</Label>
				<Input
					{...register("url")}
					id="searchquery"
					className="border-muted-foreground/50"
					placeholder="Play Using Youtube Url"
					type="text"
					autoCapitalize="none"
					autoCorrect="off"
					autoComplete="off"
					disabled={isLoading || makingRoom}
				/>
				<Button
					disabled={isLoading || makingRoom}
					size={"sm"}
					type="submit"
					className=""
				>
					{isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
					<TiPin className="size-6" />
				</Button>
			</form>
			{error && (
				<p className="my-2 text-center text-red-500 text-sm">{error}</p>
			)}
			{errors && (
				<p className="my-2 text-center text-red-500 text-sm">
					{errors.url?.message}
				</p>
			)}
			{/* <SearchYt /> */}
			<div className="mx-4 mt-4 flex flex-wrap justify-center gap-4 overflow-y-hidden md:mx-10">
				<RecentVideosDialog />
				<LikedVideosDialog />
			</div>
		</div>
	);
};

export function trimString(str: string, max = 40) {
	if (str.length > max) {
		return str.slice(0, max) + "...";
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
		<div
			className={cn("flex h-[20svh] items-center justify-center", className)}
		>
			<div
				className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-current border-e-transparent border-solid align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
				// role="status"
			>
				<span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
					Loading...
				</span>
			</div>
		</div>
	);
};

const SearchYt = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedPlatform, setSelectedPlatform] =
		useState<SupportedPlatforms>("youtube");
	// const navigate = useNavigate();
	const {
		data: room,
		mutate: makeRoom,
		isPending: creatingRoom,
	} = useMakeRoom();

	// const { setRoomData, setMics } = useRoomStore((s) => ({
	// 	setRoomData: s.setRoomData,
	// 	setMics: s.setMics,
	// }));
	const debouncedSearchQuery = useDebounce(searchQuery, 1000);

	const { data: searchResults, isFetching: isFetchingSearchResults } =
		useGetSearchResults(searchQuery, debouncedSearchQuery, selectedPlatform);

	return (
		<>
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
					<p className="text-pretty px-20 pt-5 pb-20 font-bold capitalize">
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
		</>
	);
};

export const ResultCard = ({ result }: { result: VideoInfo }) => {
	// const navigate = useNavigate();
	const { data: room, mutate: makeRoom, isPending } = useMakeRoom();
	// useEffect(() => {
	// 	if (room) {
	// 		navigate("/room/" + room?.entityId!);
	// 	}
	// }, [isPending]);
	return (
		<div
			onClick={() => {
				makeRoom({ url: result.ytId, duration: Number(result.duration) });
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
					<span className="rounded-sm bg-muted/70 p-1 font-bold text-sm text-white leading-tight">
						{parseYouTubeDuration(result.duration)}
					</span>
				</div>
				<p className="rounded-t-sm bg-muted/70 px-2 text-white text-xs leading-tight">
					{trimString(result.title, 50)}
				</p>
			</div>
		</div>
	);
};
