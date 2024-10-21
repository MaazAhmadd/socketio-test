import { cn } from "@/lib/utils";
import {useGlobalStore} from "@/store";

const ConnectionStatus = () => {
  const { connected } = useGlobalStore((s) => ({
    connected: s.connected,
  }));
  return (
    <span
      className={cn(
        "fixed top-0 right-0 z-[100] size-1 bg-red-500",
        connected ? "bg-green-500" : ""
      )}
    ></span>
  );
};
export default ConnectionStatus;
