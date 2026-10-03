import type { PaginationState, SortingState } from "@tanstack/react-table";
import {
  parseSystemPageDTO,
  type SystemPage,
  toSystem,
} from "@/features/systems/types";
import { apiFetch } from "@/lib/api";

// export async function createSystem(payload: CreateSystemPayload): Promise<System> {
//   const response = await apiFetch("systems", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(payload),
//   });

//   if (!response.ok) {
//     const message = await getApiErrorMessage(
//       response,
//       "Could not create system. Please try again",
//     );
//     throw new Error(message);
//   }

//   return (await response.json()) as System;
// }

export async function fetchSystems(
  {
    sorting,
    search,
    pagination,
  }: {
    sorting: SortingState;
    search: string;
    pagination: PaginationState;
  },
  signal?: AbortSignal,
): Promise<SystemPage> {
  const sortFieldMap: Record<string, string> = {
    createdAt: "created_at",
    updatedAt: "updated_at",
  };

  const sort = sorting[0];
  const sortBy = sort ? (sortFieldMap[sort.id] ?? sort.id) : "created_at";
  const sortOrder = sort ? (sort.desc ? "desc" : "asc") : "desc";

  const searchParams = new URLSearchParams({
    page: String(pagination.pageIndex),
    limit: String(pagination.pageSize),
    search,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  const response = await apiFetch(`/systems?${searchParams}`, {
    signal,
  });
  if (!response.ok) {
    throw new Error(`Failed to load systems (${response.status})`);
  }

  const dto = parseSystemPageDTO(await response.json());
  return {
    data: dto.data.map(toSystem),
    total: dto.total,
    pageIndex: dto.page_index,
    pageSize: dto.page_size,
  };
}

// export async function updateSystem(
//   id: string,
//   payload: UpdateSystemPayload,
//   signal?: AbortSignal,
// ): Promise<System> {
//   const response = await apiFetch(`/systems/${id}`, {
//     method: "PATCH",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(payload),
//     signal,
//   });

//   if (!response.ok) {
//     const message = await getApiErrorMessage(
//       response,
//       "Could not update system. Please try again",
//     );
//     throw new Error(message);
//   }

//   return (await response.json()) as System;
// }

// export async function deleteSystems(_ids: string[]) {}

// export async function syncSystems(_ids: string[]) {}
