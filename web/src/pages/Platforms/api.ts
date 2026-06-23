import { apiFetch } from "@/lib/api";
import type { Platform, PlatformCreate, PlatformUpdate } from "@/pages/Platforms/types";

export const getAll = (): Promise<Platform[]> => apiFetch("/platforms");

export const getTypes = (): Promise<string[]> => apiFetch("/platforms/types");

export const getStatuses = (): Promise<string[]> => apiFetch("/platforms/statuses");

export const getById = (id: number): Promise<Platform> => apiFetch(`/platforms/${id}`);

export const create = (data: PlatformCreate): Promise<Platform> =>
  apiFetch("/platforms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const update = (id: number, data: PlatformUpdate): Promise<Platform> =>
  apiFetch(`/platforms/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const remove = (id: number): Promise<void> =>
  apiFetch(`/platforms/${id}`, { method: "DELETE" });
