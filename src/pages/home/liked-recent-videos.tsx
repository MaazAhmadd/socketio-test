import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlatformSelect } from "./video-url-input";
import { useGetCurrentUser } from "@/hooks/user-hooks";
import { PlatformsArray } from "../../../server/src/types";
import { VideoPinCard } from "@/components/common/video-pin-card";
import toast from "react-hot-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const LikedRecentVideos = ({
	scrollAreaClassName,
}: { scrollAreaClassName?: string }) => {
	const [selectedPlatform, setSelectedPlatform] = useState(0);
	const [filteredRecents, setFilteredRecents] = useState<string[]>([]);
	const [filteredLiked, setFilteredLiked] = useState<string[]>([]);
	console.log(
		"[LikedRecentVideos] selectedPlatform,filteredRecents, filteredLiked:",
		selectedPlatform,
		filteredRecents,
		filteredLiked,
	);

	const { data: currentUser } = useGetCurrentUser();
	const empty = {
		yt: [
			"TRnYo-gYupY",
			"EPaLg4U_K1o",
			"onCHSujPlfg",
			"5xL4bb90WDI",
			"cc_xmawJ8Kg",
			"Cl_JpCSvTpk",
			"TRnYo-gYupY",
			"EPaLg4U_K1o",
			"onCHSujPlfg",
			"5xL4bb90WDI",
			"cc_xmawJ8Kg",
			"Cl_JpCSvTpk",
			"TRnYo-gYupY",
			"EPaLg4U_K1o",
			"onCHSujPlfg",
			"5xL4bb90WDI",
			"cc_xmawJ8Kg",
			"Cl_JpCSvTpk",
			"TRnYo-gYupY",
			"EPaLg4U_K1o",
			"onCHSujPlfg",
			"5xL4bb90WDI",
			"cc_xmawJ8Kg",
			"Cl_JpCSvTpk",
		],
		web: [],
	};
	const recents = empty;
	// const recents = currentUser?.recentVideos || empty;
	const liked = empty;
	// const liked = currentUser?.likedVideos || empty;

	useEffect(() => {
		if (selectedPlatform === 0) {
			setFilteredRecents(recents.yt);
			setFilteredLiked(liked.yt);
		}
		if (selectedPlatform === 1) {
			setFilteredRecents(recents.web);
			setFilteredLiked(liked.web);
		}
	}, [selectedPlatform]);
	return (
		<Tabs defaultValue="recents" className="w-full">
			<div className="flex gap-2">
				<PlatformSelect
					setSelectedValue={(v) => {
						setSelectedPlatform(v);
					}}
				/>
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="recents">Recents</TabsTrigger>
					<TabsTrigger value="liked">Liked</TabsTrigger>
				</TabsList>
			</div>

			<TabsContent value="recents">
				<Card>
					<CardContent className="p-2">
						{!(filteredRecents.length > 0) ? (
							<div className="my-5 text-center text-sm">
								No Recent{" "}
								<span className="capitalize">
									{PlatformsArray[selectedPlatform]}
								</span>{" "}
								videos
							</div>
						) : (
							<ScrollArea
								className={cn(
									// "h-[min(200px,30svh)] sm:h-[min(250px,34svh)]",
									scrollAreaClassName,
								)}
							>
								<div className="flex flex-wrap justify-center gap-2">
									{filteredRecents.map((r) => {
										return (
											<VideoPinCard
												key={r}
												platform={selectedPlatform}
												src={getUrlBasedOnPlatforms(r, selectedPlatform)}
												onClick={() => {
													toast.success("pin clicked");
												}}
												titleLength={35}
												className="h-[75px] w-[133.33px]"
											/>
										);
									})}
								</div>
							</ScrollArea>
						)}
					</CardContent>
				</Card>
			</TabsContent>

			<TabsContent value="liked">
				<Card>
					<CardContent className="p-2">
						{!(filteredLiked.length > 0) ? (
							<div className="my-5 text-center text-sm">
								No liked{" "}
								<span className="capitalize">
									{PlatformsArray[selectedPlatform]}
								</span>{" "}
								videos
							</div>
						) : (
							<ScrollArea
								className={cn(
									// "h-[min(200px,30svh)] sm:h-[min(250px,34svh)]",
									scrollAreaClassName,
								)}
							>
								<div className="flex flex-wrap justify-center gap-2">
									{filteredLiked.map((l) => {
										return (
											<VideoPinCard
												key={l}
												platform={selectedPlatform}
												src={getUrlBasedOnPlatforms(l, selectedPlatform)}
												onClick={() => {
													toast.success("pin clicked");
												}}
												titleLength={35}
												className="h-[75px] w-[133.33px]"
											/>
										);
									})}
								</div>
							</ScrollArea>
						)}
					</CardContent>
				</Card>
			</TabsContent>
		</Tabs>
	);
};

export default LikedRecentVideos;

function getUrlBasedOnPlatforms(url: string, platform: number) {
	switch (platform) {
		case 0:
			return `https://youtube.com/watch?v=${url}`;
		case 1:
			return url;
		default:
			return "";
	}
}
