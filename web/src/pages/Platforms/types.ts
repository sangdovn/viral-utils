import type { System } from "@/pages/Systems/types";

export type PlatformType = "facebook" | "tiktok" | "youtube";
export type PlatformStatus = "active" | "restricted" | "suspended" | "banned";

export interface Platform {
  id: number;
  type: PlatformType;
  name: string;
  url: string | null;
  status: PlatformStatus;
  reason: string | null;
  system: System | null;
}

export interface PlatformCreate {
  type: PlatformType;
  name: string;
  url: string | null;
  status: PlatformStatus;
  reason: string | null;
  system_id: number | null;
}

export type PlatformUpdate = PlatformCreate;
