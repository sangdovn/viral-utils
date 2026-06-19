import type { JSX } from "react";
import type Douyin from "@/pages/Douyin";
import type Home from "@/pages/Home";
import type Platforms from "@/pages/Platforms";
import type Systems from "@/pages/Systems";
import type Video from "@/pages/Video";

interface Route {
  path: string;
  label: string;
  element: JSX.Element;
}

export const routes: Route[] = [
  { path: "/", label: "Home", element: <Home /> },
  { path: "/systems", label: "Systems", element: <Systems /> },
  { path: "/platforms", label: "Platforms", element: <Platforms /> },
  { path: "/douyin", label: "Douyin", element: <Douyin /> },
  { path: "/video", label: "Video", element: <Video /> },
];
