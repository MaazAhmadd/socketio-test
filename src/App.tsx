import QueryClientProvider from "@/components/QueryClientProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import Authenticated from "./components/Authenticated";
import RoomPage from "./components/Room";
import Unauthenticated from "./components/Unauthenticated";
import { useGlobalStore } from "./state/store";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "./components/ErrorFallback";

export default function App() {
  const route = useGlobalStore((state) => state.route);
  useEffect(() => {
    console.log("[App] route: ", route);
  });

  // glowing background:
  // https://play.tailwindcss.com/ULwT6MTmWI

  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <ErrorBoundary fallback={<ErrorFallback />}>
          <GlobalLoading />
          <ToasterComponent />
          <QueryClientProvider>
            {route == "authPage" && <Unauthenticated />}
            {route == "homePage" && <Authenticated />}
            {route == "roomPage" && <RoomPage />}
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </ErrorBoundary>
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

const GlobalLoading = () => {
  const globalLoading = useGlobalStore((state) => state.globalLoading);
  return globalLoading ? (
    <div className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black/40 backdrop-blur-sm"></div>
  ) : (
    ""
  );
};
