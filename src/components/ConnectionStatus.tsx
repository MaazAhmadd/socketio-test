import { cn } from "@/lib/utils";
import {useGlobalStore} from "@/state/store";

const ConnectionStatus = () => {
  const { connected } = useGlobalStore((s) => ({
    connected: s.connected,
  }));
  return (
    <span
      className={cn(
        "size-1 fixed top-0 right-0 bg-red-500 z-10",
        connected ? "bg-green-500" : ""
      )}
    ></span>
  );
};
export default ConnectionStatus;
