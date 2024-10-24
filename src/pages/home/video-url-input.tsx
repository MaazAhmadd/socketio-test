import { Icons } from "@/components/common/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useVideoInfo } from "@/hooks/video-player-hooks";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { TiPin } from "react-icons/ti";
import { PlatformsArray } from "../../../server/src/types";
import { z } from "zod";

function VideoUrlInput({
	makeRoomOrPinVideo,
	className,
}: {
	makeRoomOrPinVideo: (data: { url: string; duration: number }) => void;
	className?: string;
}) {
	const [url, setUrl] = useState("");
	const [srcType, setSrcType] = useState<number>(0); // 0 for youtube
	const schema = z.object({
		url: z
			.string()
			.url({ message: "enter a valid url" })
			.min(11, "url should be minimum 11 characters")
			.max(512, "url should be maximum 512 characters"),
	});
	type FormData = z.infer<typeof schema>;
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormData>({ resolver: zodResolver(schema) });

	const { info, error, setError, isLoading, player } = useVideoInfo(
		url,
		srcType,
	);

	useEffect(() => {
		if (info.duration) {
			makeRoomOrPinVideo({ url, duration: info.duration });
		}
	}, [info.duration]);

	const onSubmitUrlForm = (data: FieldValues) => {
		setError("");
		setUrl(data.url);
	};

	return (
		<div className={cn(className)}>
			{player}
			<form
				onSubmit={handleSubmit(onSubmitUrlForm)}
				className="flex items-center gap-3"
			>
				<PlatformSelect setSelectedValue={setSrcType} />
				<Input
					{...register("url")}
					id="searchquery"
					placeholder="Enter a Url"
					autoCapitalize="none"
					autoCorrect="off"
					autoComplete="off"
					disabled={isLoading}
				/>
				<Button disabled={isLoading} size="sm" type="submit">
					{isLoading ? (
						<Icons.spinner className="mx-auto size-4 animate-spin" />
					) : (
						<TiPin className="size-6" />
					)}
				</Button>
			</form>
			<div className="flex items-center justify-center gap-2">
				{errors.url && (
					<span className="my-1 text-center text-red-500 text-xs">
						{errors.url.message}
					</span>
				)}
				{error && errors.url && (
					<Separator orientation="vertical" className="mt-1 h-3" />
				)}
				{error && (
					<span className="my-1 text-center text-red-500 text-xs">{error}</span>
				)}
			</div>
		</div>
	);
}

export const PlatformSelect = ({
	setSelectedValue,
}: { setSelectedValue: (v: number) => void }) => {
	const handleChange = (value: string) => setSelectedValue(Number(value));

	return (
		<Select defaultValue="0" onValueChange={handleChange}>
			<SelectTrigger className="w-min">
				<SelectValue placeholder="Select platform" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					{PlatformsArray.map((p, i) => (
						<SelectItem value={String(i)} key={i}>
							<span className="capitalize">{p}</span>
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
};
export default VideoUrlInput;
