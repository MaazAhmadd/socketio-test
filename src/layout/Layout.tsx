import { Outlet } from "react-router-dom";
import { useGetCurrentUser } from "@/hooks/userHooks";

const Layout = () => {
  const { data: currentUser } = useGetCurrentUser();
  return (
    <>
      {currentUser && <title>{currentUser?.handle}</title>}
      <Outlet />;
    </>
  );
};

export default Layout;
