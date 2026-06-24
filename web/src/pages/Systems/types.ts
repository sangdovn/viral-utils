export interface System {
  id: number;
  name: string;
  description: string | null;
}

export interface SystemCreate {
  name: string;
  description: string | null;
}

export type SystemEdit = SystemCreate;
