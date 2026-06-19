import { apiFetch } from "@/lib/api";
import type { FormData, System } from "./types";

export const getAll = (): Promise<System[]> => apiFetch("/systems");

export const getById = (id: number): Promise<System> => apiFetch(`/systems/${id}`);

export const create = (data: FormData): Promise<System> =>
  apiFetch("/systems", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const update = (id: number, data: FormData): Promise<System> =>
  apiFetch(`/systems/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const remove = (id: number): Promise<void> =>
  apiFetch(`/systems/${id}`, { method: "DELETE" });
