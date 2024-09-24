import api from "@/api";
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
import {
	ResError,
	useGetCurrentUser,
	useUpdateUserHandle,
	useUpdateUserName,
} from "@/hooks/user-hooks";
import {
	screenBreakpoints,
	useCurrentBreakpoint,
	useWindowSize,
} from "@/hooks/util-hooks";
import { useGlobalStore } from "@/store";
import { Cross1Icon, GearIcon, Pencil2Icon } from "@radix-ui/react-icons";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ChangeEvent, useEffect, useState } from "react";
import { Icons } from "../../components/common/icons";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { cn, getHexColorFromString } from "@/lib/utils";

export function SettingsDrawer() {
	const [isEditOn, setIsEditOn] = useState(false);
	const { logout } = useGlobalStore((state) => ({
		logout: state.logout,
	}));
	const { data: currentUser } = useGetCurrentUser();
	return (
		<Drawer direction="left">
			<DrawerTrigger asChild>
				<Button
					variant="outline"
					className="fixed top-2 left-2 rounded-lg p-[9px] md:top-4 md:left-4 md:px-[16px] md:py-[24px] "
				>
					<GearIcon className="size-[18px] md:size-6" />
				</Button>
			</DrawerTrigger>
			<DrawerContent className="mr-24 ml-0 max-w-[85vw] bg-background/80">
				{/* horizontal */}
				{/* <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted " /> */}
				{/* vertical */}
				<div className="h-full w-[80vw] max-w-sm pl-5 md:max-w-md">
					{/* <div className="flex justify-between"> */}
					{/* <div></div> */}
					<DrawerHeader>
						<DrawerTitle className="my-2 text-center text-xl md:text-2xl">
							Settings
						</DrawerTitle>
						{/* <DrawerDescription>Set your daily activity goal.</DrawerDescription> */}
					</DrawerHeader>
					{/* </div> */}
					<div className=" flex flex-col items-center justify-center gap-2 md:p-4 ">
						{!isEditOn ? (
							<div className="flex w-full flex-col items-center justify-center rounded-md bg-primary-foreground/80 px-8 py-4">
								<ProfilePicPreview
									_id={currentUser?._id!}
									pfp={currentUser?.pfp!}
									className="mb-2 h-24 w-24"
								/>
								<p className=" text-primary">{currentUser?.name || "Name"}</p>
								<p className="text-muted-foreground text-sm">
									{" "}
									@{currentUser?.handle || "Handle"}
								</p>
								<Button
									variant="ghost"
									className="mt-2 border border-primary/30"
									size="sm"
									onClick={() => setIsEditOn(true)}
								>
									<Pencil2Icon />
									&nbsp;&nbsp; Edit
								</Button>
							</div>
						) : (
							<div className="flex w-full flex-col justify-center gap-2 rounded-md bg-primary-foreground/80 px-2 py-4 md:px-6">
								<UpdateProfilePic />
								<UpdateName />
								<UpdateHandle />
								<Button className="mt-4" onClick={() => setIsEditOn(false)}>
									Done
								</Button>
							</div>
						)}
						<div className="flex h-[100px] w-full flex-col items-center justify-center rounded-md bg-primary-foreground/80 px-8 py-4">
							<p className="text-center font-bold text-lg text-md leading-none tracking-tight md:text-lg">
								Layout Settings
							</p>
						</div>
					</div>
					<DrawerFooter className="items-center">
						<DrawerClose asChild>
							<Button variant="destructive" onClick={() => logout()}>
								Log Out
							</Button>
						</DrawerClose>
					</DrawerFooter>
				</div>
				<div className="flex h-full flex-col items-center justify-between ">
					<DrawerClose asChild>
						<Cross1Icon className="mt-5 mr-5 h-6 w-6 cursor-pointer md:h-8 md:w-8" />
					</DrawerClose>
					<div className="mx-auto mr-4 ml-4 h-[100px] w-2 rounded-full bg-muted" />
					<div></div>
				</div>
			</DrawerContent>
		</Drawer>
	);
}

const UpdateHandle = () => {
	const { data: currentUser, isLoading } = useGetCurrentUser();
	const [newHandle, setNewHandle] = useState<string>("");
	const {
		mutate: updateUserHandle,
		error: updateUserHandleError,
		isSuccess,
	} = useUpdateUserHandle();
	const { width } = useWindowSize();

	useEffect(() => {
		if (currentUser) {
			setNewHandle(currentUser.handle);
		}
	}, [currentUser, isLoading]);
	const onHandleChange = (event: ChangeEvent<HTMLInputElement>) => {
		setNewHandle(event.target.value);
	};
	return (
		<div>
			<Label htmlFor="userHandle" className="text-sm">
				Update Handle:
			</Label>
			{updateUserHandleError ? (
				<p className="text-red-400 text-sm">
					{updateUserHandleError.response?.data.error}
				</p>
			) : (
				""
			)}
			{isSuccess && <p className="text-green-400 text-sm">Handle Updated</p>}
			<div className="flex gap-4">
				<Input
					type="text"
					id="userHandle"
					value={newHandle}
					autoComplete="off"
					className=" bg-muted-foreground text-background"
					onChange={onHandleChange}
				/>
				<Button
					onClick={() => {
						if (newHandle == currentUser?.handle) return;
						updateUserHandle(newHandle);
					}}
					size={width <= screenBreakpoints.md ? "sm" : "default"}
				>
					Update
				</Button>
			</div>
		</div>
	);
};
const UpdateName = () => {
	const { data: currentUser, isLoading } = useGetCurrentUser();
	const [newName, setNewName] = useState<string>(currentUser?.name || "");
	const { mutate: updateUsername, isSuccess } = useUpdateUserName();
	const { width } = useWindowSize();

	useEffect(() => {
		if (currentUser) {
			setNewName(currentUser.name);
		}
	}, [currentUser, isLoading]);
	const onNameChange = (event: ChangeEvent<HTMLInputElement>) => {
		setNewName(event.target.value);
	};

	return (
		<div>
			<Label htmlFor="userName" className="text-sm">
				Update Name:
			</Label>
			{isSuccess && <p className="text-green-400 text-sm">Name Updated</p>}

			<div className="flex gap-4">
				<Input
					type="text"
					id="userName"
					value={newName}
					className=" bg-muted-foreground text-background"
					onChange={onNameChange}
					autoComplete="off"
				/>
				<Button
					onClick={() => {
						if (newName == currentUser?.name) return;
						updateUsername(newName);
					}}
					size={width <= screenBreakpoints.md ? "sm" : "default"}
				>
					Update
				</Button>
			</div>
		</div>
	);
};
const UpdateProfilePic: React.FC = () => {
	const { data: currentUser } = useGetCurrentUser();
	// const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [loadingState, setLoadingState] = useState<boolean>(false);
	const [errorState, setErrorState] = useState<string>("");
	const [successState, setSuccessState] = useState<string>("");
	const queryClient = useQueryClient();

	const fileChangedHandler = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files ? event.target.files[0] : null;

		// Create a URL representing the selected file
		if (file) {
		} else {
		}
		if (file) {
			try {
				setPreviewUrl(URL.createObjectURL(file));
				setLoadingState(true);
				let fileToUpload = file;
				if (file.type !== "image/gif") {
					const compressedBlob = await compressImage(file);
					fileToUpload = new File([compressedBlob], file.name, {
						type: file.type,
					});
				}
				const formData = new FormData();
				formData.append("image", fileToUpload, fileToUpload.name);
				const response = await api.put("/user/updateuserpfp", formData, {
					headers: {
						"Content-Type": "multipart/form-data",
					},
				});
				setLoadingState(false);
				setSuccessState("Profile picture updated successfully");
				queryClient.invalidateQueries({ queryKey: ["currentUser"] });
				console.log(response.data);
			} catch (error) {
				setLoadingState(false);
				if ((error as ResError).response?.data.error == "File is too large") {
					setErrorState("File is too large. Max file size is 2MB");
				} else {
					setErrorState("Failed to update profile picture");
				}
				console.error("Error uploading file", error);
			}
		} else {
			setPreviewUrl(null);
		}
	};

	const compressImage = (file: File): Promise<Blob> => {
		return new Promise((resolve, reject) => {
			const img = document.createElement("img");
			img.src = URL.createObjectURL(file);
			img.onload = () => {
				const canvas = document.createElement("canvas");
				const ctx = canvas.getContext("2d");
				if (ctx) {
					canvas.width = img.width / 2;
					canvas.height = img.height / 2;
					ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
					canvas.toBlob(
						(blob) => {
							if (blob) {
								resolve(blob);
							} else {
								reject(new Error("Failed to compress image"));
							}
						},
						file.type,
						0.8,
					);
				}
			};
			img.onerror = reject;
		});
	};

	// const uploadHandler = async () => {
	//   if (selectedFile) {
	//     try {
	//       setLoadingState(true);
	//       let fileToUpload = selectedFile;
	//       if (selectedFile.type !== "image/gif") {
	//         const compressedBlob = await compressImage(selectedFile);
	//         fileToUpload = new File([compressedBlob], selectedFile.name, {
	//           type: selectedFile.type,
	//         });
	//       }
	//       const formData = new FormData();
	//       formData.append("image", fileToUpload, fileToUpload.name);
	//       const response = await api.put("/user/updateuserpfp", formData, {
	//         headers: {
	//           "Content-Type": "multipart/form-data",
	//         },
	//       });
	//       setLoadingState(false);
	//       setSuccessState("Profile picture updated successfully");
	//       queryClient.invalidateQueries({ queryKey: ["currentUser"] });
	//       console.log(response.data);
	//     } catch (error) {
	//       setLoadingState(false);
	//       if ((error as AxiosError).response?.data == "File is too large") {
	//         setErrorState("File is too large. Max file size is 2MB");
	//       } else {
	//         setErrorState("Failed to update profile picture");
	//       }
	//       console.error("Error uploading file", error);
	//     }
	//   }
	// };

	return (
		<div className="flex flex-col items-center gap-4">
			{previewUrl ? (
				<ProfilePicPreview _id="" pfp={previewUrl} className="size-24" />
			) : (
				<ProfilePicPreview
					_id={currentUser?._id!}
					pfp={currentUser?.pfp}
					className="size-24"
				/>
			)}
			<div>
				<div className="flex justify-between">
					<Label htmlFor="profilePic" className="text-sm">
						Update Profile Picture:
					</Label>
					<div>
						{loadingState && (
							<Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
						)}
					</div>
				</div>
				{errorState && <p className="text-red-400 text-sm">{errorState}</p>}
				{successState && (
					<p className="text-green-400 text-sm">{successState}</p>
				)}
				<div className="flex gap-4">
					<Input
						type="file"
						id="profilePic"
						className="cursor-pointer bg-muted-foreground text-background"
						onChange={fileChangedHandler}
					/>
					{/* <Button onClick={uploadHandler} size={width < 768 ? "sm" : "default"}>
            {loadingState && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Upload
          </Button> */}
				</div>
			</div>
		</div>
	);
};

export const ProfilePicPreview = ({
	_id,
	pfp,
	className,
}: {
	_id: string;
	pfp?: string;
	className?: string;
}) => {
	if (!pfp) return <></>;
	const randomColor = getHexColorFromString(_id);

	return pfp ? (
		<img
			src={pfp}
			alt=""
			className={cn(
				"size-[42px] rounded-full border border-primary object-cover p-[2px]",
				className,
			)}
		/>
	) : (
		<div
			key={_id}
			style={{
				backgroundImage: `linear-gradient(to bottom, ${randomColor} 0%, ${randomColor} 100%), linear-gradient(to bottom, hsl(var(--muted)) 0%, hsl(var(--muted)) 100%)`,
				backgroundClip: "content-box, padding-box",
			}}
			className={cn(
				"size-[42px] rounded-full border border-primary p-[2px]",
				className,
			)}
		></div>
	);
};
