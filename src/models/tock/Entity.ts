export interface Entity {
  type: string;
  role: string;
  content?: string;
  value?: string;
  evaluated: boolean;
  subEntities: Entity[];
  new: boolean;
}
