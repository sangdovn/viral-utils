import type { System } from "@/pages/Systems/types";

export type PlatformType = "facebook" | "tiktok" | "youtube";
export type PlatformStatus = "active" | "restricted" | "suspended" | "banned";

export interface Platform {
  id: number;
  type: PlatformType;
  name: string;
  url?: string;
  status: PlatformStatus;
  reason?: string;
  system?: System;
}

export interface PlatformCreate extends Omit<Platform, "id" | "system"> {
  system_id?: number;
}

export interface PlatformUpdate extends PlatformCreate {}
