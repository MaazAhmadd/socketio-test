import QueryClientProvider from "@/components/QueryClientProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "react-hot-toast";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "react-router-dom";
import router from "./routes";
import 'react-photo-view/dist/react-photo-view.css';


export default function App() {
  // glowing background:
  // https://play.tailwindcss.com/ULwT6MTmWI

  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        {/* <ErrorBoundary fallback={<ErrorFallback />}> */}
        <ToasterComponent />
        <QueryClientProvider>
          <RouterProvider router={router} />
          {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        </QueryClientProvider>
        {/* </ErrorBoundary> */}
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

// const GlobalLoading = () => {
//   const globalLoading = useGlobalStore((state) => state.globalLoading);
//   return globalLoading ? (
//     <div className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black/40 backdrop-blur-sm"></div>
//   ) : (
//     ""
//   );
// };
