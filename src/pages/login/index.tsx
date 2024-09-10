import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCheckUser, useLoginUser, useRegisterUser } from "@/hooks/userHooks";
import { cn } from "@/lib/utils";
import * as React from "react";
import { ModeToggle } from "@/components/theme-toggle";
import toast from "react-hot-toast";
import { useDebounce } from "@/hooks/utilHooks";
import { Navigate } from "react-router-dom";

export default function LoginPage() {
	const token = localStorage.getItem("auth_token");

	if (token) {
		return <Navigate to="/home" />;
	}

	const [registerStateError, setRegisterStateError] = React.useState("");
	const [registerState, setRegisterState] = React.useState("");

	const [passwordState, setPasswordState] = React.useState("");
	const [passwordStateError, setPasswordStateError] = React.useState("");

	const {
		mutate: login,
		isPending: isLoadingLogin,
		error: errorLogin,
		// data: dataLogin,
	} = useLoginUser();
	const {
		mutate: register,
		isPending: isLoadingRegister,
		error: errorRegister,
		// data: dataRegister,
	} = useRegisterUser();

	const debouncedRegisterState = useDebounce(registerState, 500);
	const { data: checkUser } = useCheckUser(
		registerState,
		debouncedRegisterState,
		passwordStateError.length > 0 ||
			registerStateError.length > 0 ||
			registerState.length < 1,
	);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const formData = {
			handle: registerState,
			password: passwordState,
		};
		if (passwordStateError.length > 0 || registerStateError.length > 0) {
			console.log(
				"loginStateError: ",
				passwordStateError,
				" | ",
				registerStateError,
			);
			toast.error("error check console");
			return;
		}
		if (checkUser) {
			login(formData);
		} else {
			register(formData);
		}
	};

	return (
		<>
			<div className="container relative  grid h-[100vh] flex-col items-center justify-center gap-4 md:gap-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
				<div className="relative  flex h-full flex-col bg-muted text-white dark:border-r max-sm:py-4 md:p-10">
					<div className="full-bleed absolute inset-0 bg-zinc-900" />
					<div className="relative z-20 flex items-center  font-medium">
						<TextGradient className="mb-2 text-2xl md:text-4xl">
							Gather Groove
						</TextGradient>{" "}
					</div>
					<ModeToggle className="fixed right-4 top-4" />
					{/* <br /> */}
					<div className="relative z-20 my-auto flex flex-col items-center font-medium md:pr-40">
						<p className="text-md hidden  md:block md:text-2xl">
							Welcome to{" "}
							<TextGradient className="text-lg md:text-3xl" inline={true}>
								{" "}
								Gather Groove{" "}
							</TextGradient>{" "}
							Sign up and step into a world where watching videos becomes a
							social experience. Explore public rooms and watch videos from
							YouTube, Netflix, Prime, Drive, and more, all in perfect sync.
						</p>
						<p className="text-md md:hidden md:text-2xl">
							Welcome to{" "}
							<TextGradient className="text-lg md:text-3xl" inline={true}>
								{" "}
								Gather Groove{" "}
							</TextGradient>{" "}
							Sign up, Explore public rooms and watch videos from YouTube,
							Netflix, Prime, Drive, and more, all in perfect sync.
						</p>

						<p className="text-md hidden md:block md:text-2xl">
							Meet new friends, chat, and enjoy videos together. With{" "}
							<TextGradient className="text-lg md:text-3xl" inline={true}>
								{" "}
								Gather Groove{" "}
							</TextGradient>{" "}
							, you're not just watching, you're connecting. Join us and make
							every watch party a blast!
						</p>
						<p className="text-md md:hidden md:text-2xl">
							Meet new friends, chat, and enjoy videos together. With{" "}
							<TextGradient className="text-lg md:text-3xl" inline={true}>
								{" "}
								Gather Groove{" "}
							</TextGradient>{" "}
						</p>
					</div>

					{/* <div className="relative z-20 mt-auto hidden md:block"></div> */}
				</div>
				<div className="lg:p-8">
					<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
						<div className="flex flex-col space-y-2 text-center">
							<h1 className="text-2xl font-semibold tracking-tight">
								Create an account or Login
							</h1>
							<p className="text-sm text-muted-foreground">
								Enter unique handle to Login or Register
							</p>
						</div>
						<div className="grid gap-2 md:gap-6">
							<form onSubmit={onSubmit}>
								<div className="grid gap-2">
									<div className="grid gap-1">
										<Label className="sr-only" htmlFor="handle">
											Handle
										</Label>
										<Input
											onChange={(e) => {
												const value = e.target.value;
												if (validateInputs(value) == true) {
													setRegisterStateError("");
													setRegisterState(value.trim());
												} else {
													// setCheckUser(false);
													setRegisterState(value.trim());
													setRegisterStateError(
														validateInputs(value) as string,
													);
												}
											}}
											value={registerState}
											id="handle"
											className={cn(
												registerStateError.length > 0
													? "border-red-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500"
													: "",
												String(checkUser) === "true"
													? "border-green-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-500"
													: "",
											)}
											placeholder="@handle"
											type="text"
											autoCapitalize="none"
											autoCorrect="off"
											autoComplete="off"
											disabled={isLoadingLogin || isLoadingRegister}
										/>
										{registerStateError.length > 0 && (
											<p className="text-sm text-red-500">
												{registerStateError}
											</p>
										)}
										<Input
											onChange={(e) => {
												const value = e.target.value;
												if (validateInputs(value) == true) {
													setPasswordStateError("");
													setPasswordState(value.trim());
												} else {
													setPasswordState(value.trim());
													setPasswordStateError(
														validateInputs(value) as string,
													);
												}
											}}
											className={cn(
												passwordStateError.length > 0
													? "border-red-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500"
													: "",
											)}
											id="password"
											placeholder="password"
											type="password"
											autoCapitalize="none"
											autoCorrect="off"
											autoComplete="off"
											disabled={isLoadingLogin || isLoadingRegister}
										/>
										{passwordStateError.length > 0 && (
											<p className="text-sm text-red-500">
												{passwordStateError}
											</p>
										)}
										{errorLogin && (
											<p className="text-sm text-red-500">
												InValid Password
												{/* {(errorLogin as any)?.response?.data?.error} */}
											</p>
										)}
										{errorRegister && (
											<p className="text-sm text-red-500">Error Registering</p>
										)}
									</div>
									<Button
										disabled={isLoadingLogin || isLoadingRegister}
										type="submit"
										className={cn(
											String(checkUser) === "true"
												? "bg-green-500 text-secondary-foreground shadow-sm hover:bg-green-500/80"
												: "",
										)}
									>
										{(isLoadingLogin || isLoadingRegister) && (
											<Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
										)}
										{String(checkUser) === "true" ? "Continue" : "Register"}
									</Button>
								</div>
							</form>
							<div className="relative">
								<div className="absolute inset-0 flex items-center">
									<span className="w-full border-t" />
								</div>
								<div className="relative flex justify-center text-xs uppercase">
									<span className="bg-background px-2 text-muted-foreground">
										Or continue with
									</span>
								</div>
							</div>
							<p className="text-sm text-muted-foreground">coming soon...</p>
							<Button
								variant="outline"
								type="button"
								// disabled
								className="cursor-not-allowed"
							>
								<Icons.google className="mr-2 h-4 w-4" /> Google
							</Button>
						</div>
						<p className="px-8 text-center text-sm text-muted-foreground">
							By clicking continue, you agree to our{" "}
							<a
								href="/#"
								className="underline underline-offset-4 hover:text-primary"
							>
								Terms of Service
							</a>{" "}
							and{" "}
							<a
								href="/#"
								className="underline underline-offset-4 hover:text-primary"
							>
								Privacy Policy
							</a>
							.
						</p>
					</div>
				</div>
			</div>
		</>
	);
}
function validateInputs(value: string) {
	if (value.length < 6) {
		return "minimum 6 characters";
	}
	if (value.length > 64) {
		return "maximum 64 characters";
	}
	if (
		!/^[a-zA-Z0-9#$_&\-+@()/*"':;!?~`|•√÷×§∆\\}{=°^¥€¢£%©®™✓\[\]\,\.<>]*$/.test(
			value,
		)
	) {
		return "no spaces or invalid characters allowed";
	}
	return true;
}

export const TextGradient = ({
	children,
	className,
	inline = false,
	...props
}: {
	children?: React.ReactNode;
	className?: string;
	inline?: boolean;
}) => {
	if (inline) {
		return (
			<span
				className={cn(
					"gradient-text animate-gradient font-Scripto text-4xl font-medium text-transparent",
					// "font-Scripto bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-lime-500",
					className,
				)}
				{...props}
			>
				{children}
			</span>
		);
	}
	return (
		<p
			className={cn(
				"gradient-text animate-gradient font-Scripto text-4xl font-medium text-transparent",
				// "font-Scripto bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-lime-500",
				className,
			)}
			{...props}
		>
			{children}
		</p>
	);
};
