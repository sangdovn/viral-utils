import type { PaginationState, SortingState } from "@tanstack/react-table";

export type SystemDTO = {
  id: string;
  name: string;
  description: string | null;
};

export type System = {
  id: string;
  name: string;
  description: string | null;
};

export type SystemPageDTO = {
  data: SystemDTO[];
  total: number;
  page_index: number;
  page_size: number;
};

export type SystemPage = {
  data: System[];
  total: number;
  pageIndex: number;
  pageSize: number;
};

export type SystemCreate = Omit<System, "id">;

export type SystemUpdate = Partial<SystemCreate>;

export function toSystem(dto: SystemDTO): System {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
  };
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function isSystemDTO(value: unknown): value is SystemDTO {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    (typeof value.description === "string" || value.description === null)
  );
}

export function parseSystemPageDTO(value: unknown): SystemPageDTO {
  if (
    !isRecord(value) ||
    !Array.isArray(value.data) ||
    !value.data.every(isSystemDTO) ||
    !isNonNegativeInteger(value.total) ||
    !isNonNegativeInteger(value.page_index) ||
    !isPositiveInteger(value.page_size)
  ) {
    throw new Error("The systems API returned an invalid response");
  }

  return {
    data: value.data,
    total: value.total,
    page_index: value.page_index,
    page_size: value.page_size,
  };
}

export type SystemsQuery = {
  sorting: SortingState;
  search: string;
  pagination: PaginationState;
};
