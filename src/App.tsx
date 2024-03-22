import QueryClientProvider from "@/components/QueryClientProvider";
import Authenticated from "./components/Authenticated";
import Unauthenticated from "./components/Unauthenticated";
import { ThemeProvider } from "@/components/theme-provider";
export default function App() {
  const token = localStorage.getItem("auth_token");

  return (
    <div className="">
      <QueryClientProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          {/* <Unauthenticated /> */}
          {token ? <Authenticated /> : <Unauthenticated />}
        </ThemeProvider>
      </QueryClientProvider>
    </div>
  );
}
