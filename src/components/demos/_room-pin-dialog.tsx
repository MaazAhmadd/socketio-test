import { Icons } from "@/components/common/icons";
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
import { useGetSearchResults } from "@/hooks/room-hooks";
import { useDebounce } from "@/hooks/util-hooks";
import { DrawingPinFilledIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { SupportedPlatforms } from "server/src/types";
import {
	LikedVideosDialog,
	RecentVideosDialog,
	ResultCard,
	SelectSearchPlatform,
} from "@/pages/home";
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
		setDisableBtn(true);
	};
	useEffect(() => {
		setTimeout(() => {
			setDisableBtn(false);
		}, 2000);
	}, [disableBtn]);

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="ghost" size={"sm"} className="relative">
					<span className="absolute top-1 right-0 flex size-3 items-center justify-center rounded-full bg-primary text-[8px] text-primary-foreground">
						2
					</span>
					<DrawingPinFilledIcon className="size-[18px]" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<div className="h-[75svh] border-2 border-muted bg-primary-foreground">
					<p className="mx-4 scroll-m-20 p-4 pb-2 text-center font-semibold text-lg text-primary xs:text-xl tracking-tight transition-colors first:mt-0 md:mt-1 md:text-pretty md:text-2xl">
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
							<p className="text-pretty px-20 pt-5 pb-20 font-bold capitalize">
								start typing to search from {selectedPlatform} or select another
								platform to search from...
							</p>
						)}
						{isFetchingSearchResults && (
							<div className="flex h-[20svh] items-center justify-center">
								<div
									className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-current border-e-transparent border-solid align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
									// role="status"
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
