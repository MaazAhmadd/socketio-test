import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	// DialogDescription,
	// DialogFooter,
	// DialogHeader,
	// DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGetSearchResults, useMakeRoom } from "@/hooks/roomHooks";
import { useDebounce } from "@/hooks/utilHooks";
import { useRoomStore, useGlobalStore } from "@/store";
import { DrawingPinFilledIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { SupportedPlatforms } from "server/src/types";
import {
	LikedVideosDialog,
	RecentVideosDialog,
	ResultCard,
	SelectSearchPlatform,
} from "./Authenticated";
import { useNavigate } from "react-router-dom";
export type Tabs = "public" | "invited" | "friends" | "createRoom";

export function RoomPinDialog() {
	const [videoUrl, setVideoUrl] = useState("");
	const [disableBtn, setDisableBtn] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedPlatform, setSelectedPlatform] =
		useState<SupportedPlatforms>("youtube");

	// const navigate = useNavigate();

	// const { mutate: makeRoom,data:room } = useMakeRoom();

	const debouncedSearchQuery = useDebounce(searchQuery, 1000);

	const { data: searchResults, isFetching: isFetchingSearchResults } =
		useGetSearchResults(searchQuery, debouncedSearchQuery, selectedPlatform);

	const onSubmitUrlForm = async (e: React.FormEvent) => {
		e.preventDefault();
		setDisableBtn(true);
		if (videoUrl) {
			console.log(
				"[createRoom onsubmit] about to createRoom videoUrl: ",
				videoUrl,
			);
			// setRoomCreationData_VideoUrl(videoUrl);
			// setRoomCreationRequestType("create");
			// navigate("/room/" + videoUrl);
		}
	};
	useEffect(() => {
		setTimeout(() => {
			setDisableBtn(false);
		}, 2000);
	}, [disableBtn]);

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline" className="">
					<DrawingPinFilledIcon className="h-4 w-4 md:h-6 md:w-6" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<div className="h-[75vh] border-2 border-muted bg-primary-foreground">
					<p className="mx-4 scroll-m-20 p-4 pb-2 text-center text-lg font-semibold tracking-tight text-primary  transition-colors first:mt-0 xs:text-xl md:mt-1 md:text-pretty md:text-2xl">
						Pin in Queue
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
							disabled={disableBtn}
						/>
						<Button disabled={disableBtn} type="submit" className="">
							{disableBtn && (
								<Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
							)}
							Pin in Queue
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
							disabled={disableBtn}
						/>
					</div>
					<div className="mx-4 mt-4 flex flex-wrap justify-center gap-4 overflow-y-hidden md:mx-10">
						{!isFetchingSearchResults && !searchResults && (
							<p className="text-pretty px-20 pb-20 pt-5 font-bold capitalize">
								start typing to search from {selectedPlatform} or select another
								platform to search from...
							</p>
						)}
						{isFetchingSearchResults && (
							<div className="flex h-[20vh] items-center justify-center">
								<div
									className="text-surface inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
									role="status"
								>
									<span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
										Loading...
									</span>
								</div>
							</div>
						)}
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
			</DialogContent>
		</Dialog>
	);
}
