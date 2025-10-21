import { IViewModelBase } from "@kinetix/core";
import {
  ListBoxItemClickEvent,
  ListBoxDragEvent,
} from "@progress/kendo-react-listbox";
import {
  BlotterColumnDefinition,
  IDatasetView,
  IDatasetDefinition,
  FormBooleanField,
  FormTextField,
  IColumnConfig,
} from "../../../..";

import { IConfigurationEditorPage } from "../IConfigurationEditor";
import {
  BlotterColumnConfigModel,
  IColumnListItemData,
} from "./BlotterColumnConfigModel";

export const IBlotterColumnConfigType = Symbol.for("IBlotterColumnConfig");

export interface IBlotterColumnConfig
  extends IViewModelBase<BlotterColumnConfigModel>,
    IConfigurationEditorPage {
  selectAllColumns: FormBooleanField;
  searchColumns: FormTextField;
  columns: BlotterColumnDefinition[];
  activeColumns: string[];

  handleListItemClick(event: ListBoxItemClickEvent): void;
  handleListItemDragStart(e: ListBoxDragEvent): void;
  handleListItemDrop(e: ListBoxDragEvent): void;

  getFilteredColumns(): IColumnListItemData[];
  setConfiguration(
    datasetView: IDatasetView,
    datasetDefinition: IDatasetDefinition,
    columnConfigs: IColumnConfig[]
  ): void;
}
