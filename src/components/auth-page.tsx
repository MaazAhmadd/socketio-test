import * as React from "react";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCheckUser, useLoginUser, useRegisterUser } from "@/hooks/auth";
import useDebounce from "@/hooks/useDebounce";
import { isValidJwt } from "@/utils";

export default function AuthenticationPage() {
  const [registerStateError, setRegisterStateError] = React.useState("");
  const [registerState, setRegisterState] = React.useState("");

  const [passwordState, setPasswordState] = React.useState("");
  const [passwordStateError, setPasswordStateError] = React.useState("");

  // const [checkUser, setCheckUser] = React.useState<any>(false);

  const {
    mutate: login,
    isPending: isLoadingLogin,
    error: errorLogin,
    data: dataLogin,
  } = useLoginUser();
  const {
    mutate: register,
    isPending: isLoadingRegister,
    error: errorRegister,
    data: dataRegister,
  } = useRegisterUser();

  const debouncedRegisterState = useDebounce(registerState, 500);
  const { data: checkUser } = useCheckUser(
    registerState,
    debouncedRegisterState,
    passwordStateError.length > 0 || registerStateError.length > 0
  );

  // React.useEffect(() => {
  //   if (registerStateError.length > 0) return;
  //   refetch();
  // }, [debouncedRegisterState]);

  React.useEffect(() => {
    if (dataLogin && isValidJwt(dataLogin)) {
      localStorage.setItem("auth_token", dataLogin);
      window.location.reload();
    }
    if (dataRegister && isValidJwt(dataRegister)) {
      localStorage.setItem("auth_token", dataRegister);
      window.location.reload();
    }
  }, [dataLogin, dataRegister]);
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("handle", registerState);
    formData.append("password", passwordState);
    if (String(checkUser) === "true") {
      if (passwordStateError.length > 0 || registerStateError.length > 0)
        return;
      console.log("passwordStateError", passwordStateError);

      login({
        handle: formData.get("handle") as string,
        password: formData.get("password") as string,
      });
    } else {
      if (passwordStateError.length > 0 || registerStateError.length > 0)
        return;
      register({
        handle: formData.get("handle") as string,
        password: formData.get("password") as string,
      });
    }
  };

  return (
    <>
      <div className="container relative  h-[100vh] flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0 md:gap-0 gap-4">
        <div className="relative  h-full flex-col bg-muted max-sm:py-8 md:p-10 text-white flex dark:border-r">
          <div className="absolute inset-0 bg-zinc-900 full-bleed" />
          <div className="relative z-20 flex items-center  font-medium">
            <TextGradient className="md:text-5xl text-3xl">
              Gather Groove
            </TextGradient>{" "}
          </div>
          <br />
          <div className="relative z-20 flex items-center font-medium my-auto md:pr-40">
            <p className="md:text-2xl text-md">
              Welcome to{" "}
              <TextGradient className="md:text-3xl text-lg" inline={true}>
                {" "}
                Gather Groove{" "}
              </TextGradient>{" "}
              Sign up and step into a world where watching videos becomes a
              social experience. Explore public rooms and watch videos from
              YouTube, Netflix, Prime, Drive, and more, all in perfect sync.
              <br />
              <br />
              Meet new friends, chat, and enjoy videos together. With{" "}
              <TextGradient className="md:text-3xl text-lg" inline={true}>
                {" "}
                Gather Groove{" "}
              </TextGradient>{" "}
              , you're not just watching, you're connecting. Join us and make
              every watch party a blast!
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
            <div className="grid gap-6">
              <form onSubmit={onSubmit}>
                <div className="grid gap-2">
                  <div className="grid gap-1">
                    <Label className="sr-only" htmlFor="email">
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
                            validateInputs(value) as string
                          );
                        }
                      }}
                      value={registerState}
                      id="handle"
                      className={cn(
                        registerStateError.length > 0
                          ? "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500 border-red-500"
                          : "",
                        String(checkUser) === "true"
                          ? "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-500 border-green-500"
                          : ""
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
                            validateInputs(value) as string
                          );
                        }
                      }}
                      className={cn(
                        passwordStateError.length > 0
                          ? "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500 border-red-500"
                          : ""
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
                        : ""
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
              <p className="text-sm text-muted-foreground mb-[-20px]">
                coming soon...
              </p>
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
                href="#"
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
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
      value
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
          "font-Scripto bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-lime-500",
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  } else {
    return (
      <p
        className={cn(
          "font-Scripto bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-lime-500",
          className
        )}
        {...props}
      >
        {children}
      </p>
    );
  }
};
