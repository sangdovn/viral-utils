import { createBrowserRouter } from "react-router";
import { AppLayout } from "@/layouts/AppLayout";
import { HomePage } from "@/pages/HomePage/HomePage";
import { SystemsPage } from "@/pages/SystemsPage";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        Component: HomePage,
      },
      {
        path: "/systems",
        Component: SystemsPage,
      },
    ],
  },
]);
