import QueryClientProvider from "@/components/QueryClientProvider";
import { ThemeProvider } from "@/components/theme-provider";
import Authenticated from "./components/Authenticated";
import Unauthenticated from "./components/Unauthenticated";
import useGlobalStore from "./state/store";
import Room from "./components/Room";
import { useEffect } from "react";

export default function App() {
  const route = useGlobalStore((state) => state.route);
  useEffect(() => {
    console.log("[App] route: ", route);
  });
  // glowing background:
  // https://play.tailwindcss.com/ULwT6MTmWI

  return (
    <div className="">
      <QueryClientProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          {route == "authPage" && <Unauthenticated />}
          {route == "homePage" && <Authenticated />}
          {route == "roomPage" && <Room />}
        </ThemeProvider>
      </QueryClientProvider>
    </div>
  );
}
