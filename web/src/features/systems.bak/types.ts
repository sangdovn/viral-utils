export interface System {
  id: string;
  name: string;
  description: string | null;
}

export interface SystemPage {
  data: System[];
  total: number;
  pageIndex: number;
  pageSize: number;
}

export type SystemSortBy = "id" | "name" | "description" | "created_at" | "updated_at";

export type SystemSortOrder = "default" | "asc" | "desc";

export interface CreateSystemFormData {
  name: string;
  description: string;
}

export interface CreateSystemErrors
  extends Partial<Record<keyof CreateSystemFormData, string>> {}

export interface CreateSystemPayload {
  name: string;
  description: string | null;
}

export interface ListSystemsParams {
  pageIndex: number;
  pageSize: number;
  search: string;
  sortBy: SystemSortBy;
  sortOrder: SystemSortOrder;
}

export type EditableField = "name" | "description";

export interface SystemDraft {
  name: string;
  description: string;
}

export interface UpdateSystemErrors
  extends Partial<Record<keyof SystemDraft, string>> {}

export interface UpdateSystemPayload {
  name?: string;
  description?: string | null;
}
