export interface System {
  id: number;
  name: string;
  description: string;
}

export interface SystemCreate extends Omit<System, "id"> {}

export interface SystemEdit extends Omit<System, "id"> {}
