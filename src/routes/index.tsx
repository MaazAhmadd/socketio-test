import Layout from "@/layout/Layout";
import HomePage from "@/pages/home";
import LoginPage from "@/pages/login";
import RoomPage from "@/pages/room";
import PrivateRoute from "@/routes/PrivateRoute";
import { createBrowserRouter } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    // errorElement: <ErrorFallback />,
    children: [
      {
        index: true,
        element: <LoginPage />,
      },
      {
        element: <PrivateRoute />,
        children: [
          {
            path: "/home",
            element: <HomePage />,
          },
          {
            path: "/room/:id",
            element: <RoomPage />,
          },
        ],
      },
    ],
  },
]);

export default router;
