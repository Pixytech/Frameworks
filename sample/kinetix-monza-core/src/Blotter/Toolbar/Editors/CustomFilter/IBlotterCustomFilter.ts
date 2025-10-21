import { IViewModelBase } from "@kinetix/core";
import { CompositeFilterDescriptor } from "@progress/kendo-data-query";
import { FieldSettings, FilterOperator } from "@progress/kendo-react-data-tools";
import { BlotterColumnDefinition, GridOperationModes } from "../../..";
import { DataTypes } from "../../../../Data";
import { FormAutoCompleteField } from "../../../../Forms";
import { IConfigurationEditorPage } from "../IConfigurationEditor";
import { BlotterCustomFilterModel } from "./CustomFilterModel";

export const IBlotterCustomFilterType = Symbol.for("IBlotterCustomFilter");

export interface IBlotterCustomFilter extends IViewModelBase<BlotterCustomFilterModel>, IConfigurationEditorPage {
  searchColumn: FormAutoCompleteField;
  columns: BlotterColumnDefinition[];

  handleClientFilterChange(filter: CompositeFilterDescriptor): void;
  handleFilterChange(field: string, fieldType: DataTypes, operator: FilterOperator, value: any, oldField?: string): void;
  mapFieldSettingsFromColumn(column: BlotterColumnDefinition): FieldSettings;
  getFilteredColumns(): BlotterColumnDefinition[];
  handleColumnListItemClick(column: BlotterColumnDefinition): void;
  handleDeleteFilter(field: string): void;
  setConfiguration(filters: CompositeFilterDescriptor, gridMode: GridOperationModes): void;
}
