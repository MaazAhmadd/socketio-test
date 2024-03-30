import QueryClientProvider from "@/components/QueryClientProvider";
import Authenticated from "./components/Authenticated";
import Unauthenticated from "./components/Unauthenticated";
import { ThemeProvider } from "@/components/theme-provider";
import { jwtDecode } from "jwt-decode";
import { DecodedUser } from "server/types/types";

export default function App() {
  const token = localStorage.getItem("auth_token");

  return (
    <div className="">
      <QueryClientProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          {/* <Unauthenticated /> */}
          {token ? (
            <Authenticated user={jwtDecode(token) as DecodedUser} />
          ) : (
            <Unauthenticated />
          )}
        </ThemeProvider>
      </QueryClientProvider>
    </div>
  );
}
