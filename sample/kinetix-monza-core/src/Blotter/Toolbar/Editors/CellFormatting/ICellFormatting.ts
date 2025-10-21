import { IViewModelBase } from "@kinetix/core";
import { FieldSettings } from "@progress/kendo-react-data-tools";

import { BlotterCellFormattingModel } from "./CellFormattingModel";
import { IBlotterCellFormatRowGroup } from "./FormatRowGroup";

import { IConfigurationEditorPage } from "../IConfigurationEditor";
import { BlotterColumnDefinition } from "../../..";
import { FormAutoCompleteField } from "../../../../Forms";
import { GridOperationModes, IBlotterCellFormat } from "../../../BlotterConfiguration";

export const IBlotterCellFormattingType = Symbol.for("IBlotterCellFormatting");
export interface IBlotterCellFormatting extends IViewModelBase<BlotterCellFormattingModel>, IConfigurationEditorPage {
  configurationChanged(): void;
  searchColumn: FormAutoCompleteField;
  columns: BlotterColumnDefinition[];
  formats?: IBlotterCellFormat[];
  formatGroups: IBlotterCellFormatRowGroup[];
  mapFieldSettingsFromColumn(column: BlotterColumnDefinition): FieldSettings;
  getFilteredColumns(): BlotterColumnDefinition[];
  handleColumnListItemClick(column: BlotterColumnDefinition): void;
  setConfiguration(gridMode: GridOperationModes): void;
}
