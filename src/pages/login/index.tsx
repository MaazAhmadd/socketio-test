import { Icons } from "@/components/common/icons";
import { TextGradient } from "@/components/common/text-gradient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginUser, useRegisterUser } from "@/hooks/user-hooks";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { FieldValues, useForm } from "react-hook-form";
import { Navigate } from "react-router-dom";
import { z } from "zod";

const schema = z.object({
	handle: z
		.string()
		.regex(
			/^[a-zA-Z0-9#$_&\-+@()/*"':;!?~`|•√÷×§∆\\}{=°^¥€¢£%©®™✓\[\]\,\.<>]*$/,
			"no spaces or invalid characters allowed in handle",
		)
		.min(6, "handle should me minimum 6 characters")
		.max(64, "handle should me maximum 64 characters"),
	password: z
		.string()
		.min(6, "password should me minimum 6 characters")
		.max(64, "password should me maximum 64 characters"),
});
type FormData = z.infer<typeof schema>;
export default function LoginPage() {
	const token = localStorage.getItem("auth_token");

	if (token) {
		return <Navigate to="/home" />;
	}
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(schema),
	});
	const [formType, setFormType] = React.useState<"login" | "register">("login");

	const {
		mutate: loginUser,
		isPending: isLoadingLogin,
		error: errorLogin,
		// data: dataLogin,
	} = useLoginUser();
	const {
		mutate: registerUser,
		isPending: isLoadingRegister,
		error: errorRegister,
		// data: dataRegister,
	} = useRegisterUser();

	const onSubmit = async (data: FieldValues) => {
		if (formType === "login") {
			loginUser(data);
		} else {
			registerUser(data);
		}
	};

	return (
		<div className="container relative grid flex-col items-center justify-center gap-4 md:h-[100vh] md:gap-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
			<div className="relative flex h-full flex-col bg-muted py-4 text-white md:p-10 dark:border-r">
				<div className="full-bleed absolute inset-0 bg-zinc-900" />
				<div className="relative z-20 flex items-center justify-center font-medium">
					<TextGradient className="mb-2 text-2xl md:text-4xl">
						Gather Groove
					</TextGradient>{" "}
				</div>
				{/* <ModeToggle className="fixed top-4 right-4" /> */}
				{/* <br /> */}
				<div className="relative z-20 my-auto flex flex-col items-start px-2 font-medium md:pr-40 lg:items-center">
					<p className="hidden text-md md:block md:text-2xl">
						Welcome to Gather Groove. Sign up and step into a world where
						watching videos becomes a social experience. Explore public rooms
						and watch videos from YouTube, Netflix, Prime, Drive, and more, all
						in perfect sync.
					</p>
					<p className="text-md md:hidden md:text-2xl">
						Welcome to Gather Groove. Sign up and Explore public rooms. watch
						videos from YouTube, Netflix, Prime, Drive, and more, all in perfect
						sync.
					</p>

					<p className="hidden text-md md:block md:text-2xl">
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
				<div className="mx-auto flex w-full flex-col justify-center space-y-2 sm:w-[350px] md:space-y-4">
					<div className="flex flex-col text-center">
						<h1 className="font-semibold text-2xl tracking-tight">
							{formType === "login"
								? "Login to your account"
								: "Register a new account"}
							<br />
						</h1>
						{formType === "login" && (
							<Button
								size={"sm"}
								onClick={() => setFormType("register")}
								variant={"link"}
							>
								( Register? )
							</Button>
						)}
						{formType === "register" && (
							<Button
								size={"sm"}
								onClick={() => setFormType("login")}
								variant={"link"}
							>
								( Login? )
							</Button>
						)}
						{/* <p className="text-muted-foreground text-sm">
							Enter unique handle to Login or Register
						</p> */}
					</div>
					<div className="grid gap-2 md:gap-6">
						<form onSubmit={handleSubmit(onSubmit)}>
							<div className="grid gap-2">
								<div className="grid gap-1">
									<Label className="sr-only" htmlFor="handle">
										Handle
									</Label>
									<Input
										{...register("handle")}
										className={cn(
											errors.handle &&
												"border-red-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500",
										)}
										placeholder="@handle"
										type="text"
										autoCapitalize="none"
										autoCorrect="off"
										autoComplete="off"
										disabled={isLoadingLogin || isLoadingRegister}
									/>
									{errors.handle && (
										<p className="text-red-500 text-sm">
											{errors.handle.message}
										</p>
									)}
									<Input
										{...register("password")}
										className={cn(
											errors.password &&
												"border-red-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500",
										)}
										id="password"
										placeholder="password"
										type="password"
										autoCapitalize="none"
										autoCorrect="off"
										autoComplete="off"
										disabled={isLoadingLogin || isLoadingRegister}
									/>
									{errors.password && (
										<p className="text-red-500 text-sm">
											{errors.password.message}
										</p>
									)}
								</div>
								<Button
									disabled={isLoadingLogin || isLoadingRegister}
									type="submit"
									className={cn(
										formType === "login" &&
											"bg-green-700 text-primary ring ring-green-600 hover:bg-green-800 hover:text-primary focus:bg-green-800 focus:text-primary",
									)}
								>
									{(isLoadingLogin || isLoadingRegister) && (
										<Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
									)}
									{formType === "login" ? "Login" : "Register"}
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
						<p className="text-muted-foreground text-sm">coming soon...</p>
						<Button
							variant="outline"
							type="button"
							// disabled
							className="cursor-not-allowed"
						>
							<Icons.google className="mr-2 h-4 w-4" /> Google
						</Button>
					</div>
					<p className="px-8 text-center text-muted-foreground text-sm">
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
