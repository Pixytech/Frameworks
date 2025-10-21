import { DataTypes } from "../../../../Data";

export interface IColumnListItemData {
  name: string;
  displayName: string;
  selected: boolean;
  order?: number;
  type: DataTypes;
}

export class BlotterColumnConfigModel {
  searchString: string = "";
  columns: IColumnListItemData[] = [];
  draggedItem?: IColumnListItemData;
}
