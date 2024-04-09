import QueryClientProvider from "@/components/QueryClientProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import Authenticated from "./components/Authenticated";
import RoomPage from "./components/Room";
import Unauthenticated from "./components/Unauthenticated";
import useGlobalStore from "./state/store";

export default function App() {
  const route = useGlobalStore((state) => state.route);
  useEffect(() => {
    console.log("[App] route: ", route);
  });

  // glowing background:
  // https://play.tailwindcss.com/ULwT6MTmWI

  return (
    <>
      <ToasterComponent />
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <QueryClientProvider>
          {route == "authPage" && <Unauthenticated />}
          {route == "homePage" && <Authenticated />}
          {route == "roomPage" && <RoomPage />}
        </QueryClientProvider>
      </ThemeProvider>
    </>
  );
}

const ToasterComponent = () => {
  return (
    <Toaster
      position="bottom-right"
      reverseOrder={false}
      gutter={8} // gap between toasts
      toastOptions={{
        style: {
          background: "hsl(var(--primary))",
          color: "hsl(var(--primary-foreground))",
        },
      }}
    />
  );
};
