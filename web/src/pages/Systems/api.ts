import { apiFetch } from "@/lib/api";
import type { System, SystemCreate, SystemEdit } from "./types";

export const getAll = (): Promise<System[]> => apiFetch<System[]>("/systems");

export const getById = (id: number): Promise<System> => apiFetch<System>(`/systems/${id}`);

export const create = (data: SystemCreate): Promise<System> =>
  apiFetch<System>("/systems", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const update = (id: number, data: SystemEdit): Promise<System> =>
  apiFetch<System>(`/systems/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const remove = (id: number): Promise<void> =>
  apiFetch<void>(`/systems/${id}`, { method: "DELETE" });
