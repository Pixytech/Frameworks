import { IBlotterConfiguration } from "../..";
import { FormModel } from "../../../Forms";

export class ConfigurationEditorModel extends FormModel {
  settings: IBlotterConfiguration;
  defaultPage: EditPages;
  selectedTab: number = 0;
}

export enum EditPages {
  Options = "Options",
  Columns = "Columns",
  Filters = "Filters",
  CellFormatings = "Cell Formating",
  SaveAs = "SaveAs",
}
