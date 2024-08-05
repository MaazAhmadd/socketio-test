import { Button } from "./ui/button";
import { useGlobalStore } from "@/state/store";

const ErrorFallback = () => {
  const logout = useGlobalStore((state) => state.logout);
  return (
    <div className="container m-12 text-lg font-bold">
      Error on the Page, kindly <br />
      <Button onClick={() => logout()}>logout</Button> <br />
      or <br />
      <Button onClick={() => window.location.reload()}>Reload</Button>
    </div>
  );
};

export default ErrorFallback;
