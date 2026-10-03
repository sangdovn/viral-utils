import type {
  CreateSystemPayload,
  ListSystemsParams,
  System,
  SystemPage,
  UpdateSystemPayload,
} from "@/features/systems/types";
import { apiFetch, getApiErrorMessage } from "@/lib/api";

interface SystemsPageDto {
  data: System[];
  total: number;
  page_index: number;
  page_size: number;
}

export async function createSystem(payload: CreateSystemPayload): Promise<System> {
  const response = await apiFetch("systems", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await getApiErrorMessage(
      response,
      "Could not create system. Please try again",
    );
    throw new Error(message);
  }

  return (await response.json()) as System;
}

export async function listSystems(
  { pageIndex, pageSize, search, sortBy, sortOrder }: ListSystemsParams,
  signal?: AbortSignal,
): Promise<SystemPage> {
  const params = new URLSearchParams({
    page: String(pageIndex),
    limit: String(pageSize),
    search,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  const response = await apiFetch(`/systems?${params}`, {
    signal,
  });
  if (!response.ok) {
    throw new Error(`Failed to load systems (${response.status})`);
  }

  const dto = (await response.json()) as SystemsPageDto;
  return {
    data: dto.data,
    total: dto.total,
    pageIndex: dto.page_index,
    pageSize: dto.page_size,
  };
}

export async function updateSystem(
  id: string,
  payload: UpdateSystemPayload,
  signal?: AbortSignal,
): Promise<System> {
  const response = await apiFetch(`/systems/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    const message = await getApiErrorMessage(
      response,
      "Could not update system. Please try again",
    );
    throw new Error(message);
  }

  return (await response.json()) as System;
}

export async function deleteSystems(_ids: string[]) {}

export async function syncSystems(_ids: string[]) {}
