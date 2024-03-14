import Authenticated from "./components/Authenticated";
import Unauthenticated from "./components/Unauthenticated";

export default function App() {
  const token = localStorage.getItem("auth_token");
  if (token) {
    return <Authenticated />;
  }
  return <Unauthenticated />;
}
