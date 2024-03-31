import QueryClientProvider from "@/components/QueryClientProvider";
import { ThemeProvider } from "@/components/theme-provider";
import Authenticated from "./components/Authenticated";
import Unauthenticated from "./components/Unauthenticated";
import useGlobalStore from "./state/store";

export default function App() {
  const decodedAuthToken = useGlobalStore((state) => state.decodedAuthToken);
  console.log("apptsx localstorage token: ", decodedAuthToken);

  return (
    <div className="">
      <QueryClientProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          {decodedAuthToken ? <Authenticated /> : <Unauthenticated />}
        </ThemeProvider>
      </QueryClientProvider>
    </div>
  );
}
