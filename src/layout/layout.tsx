import { Outlet } from "react-router-dom";
import { useGetCurrentUser } from "@/hooks/user-hooks";

const Layout = () => {
  // const { data: currentUser } = useGetCurrentUser();
  return (
    <>
      {/* {currentUser && <title>{currentUser?.handle}</title>} */}
      <Outlet />
    </>
  );
};

export default Layout;
