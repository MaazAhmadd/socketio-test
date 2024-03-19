import Authenticated from "./components/Authenticated";
import Unauthenticated from "./components/Unauthenticated";
import { ThemeProvider } from "@/components/theme-provider";
export default function App() {
  const token = localStorage.getItem("auth_token");

  return (
    <div className="">
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        {token ? <Authenticated /> : <Unauthenticated />}
      </ThemeProvider>
    </div>
  );
}
