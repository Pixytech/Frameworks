import { ConfigurationItem } from "@kinetix/core";

import { FilterOperator } from "@progress/kendo-react-data-tools";
import { BlotterColumnDefinition } from ".";
import { CompositeDataFilter, DataTypes } from "../Data";
import { SortDescriptor } from "@progress/kendo-data-query";

export enum GridOperationModes {
  Client = "client",
  Server = "server",
}

export interface GridSettings {
  gridMode: GridOperationModes;
  pageSize: number;
  exportSize: number;
  allowGrouping?: boolean;
}

export interface IBlotterConfiguration {
  filters?: CompositeDataFilter;
  sorts?: SortDescriptor[];
  columnConfigs?: IColumnConfig[];
  detailColumnConfigs?: IColumnConfig[];
  toolbarCollapsed?: boolean;
  disableGrouping?: boolean;
  clonedConfig?: IBlotterConfiguration;
  settings: GridSettings;
}

export interface IBlotterCellFormat {
  column: BlotterColumnDefinition;
  conditions: IBlotterCellFormatCondition[];
  priority: number;
}

export interface IBlotterCellFormatCondition {
  opretaor: FilterOperator;
  value?: any;
  format?: IBlotterCellFormatOptions;
  priority: number;
}

export interface IBlotterCellFormatOptions {
  textStyles: TextFormatOptions;
  backgroundColor?: string;
  applyToRow?: boolean;
}

export interface TextFormatOptions {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  textColor?: string;
}

export interface IColumnConfig {
  name: string;
  displayName?: string;
  order?: number;
  hidden?: boolean;
  width?: number;
  editable?: boolean;
  type?: DataTypes;
  cellFormats?: IBlotterCellFormat;
  locked?:boolean
}

export class BlotterConfigurationItem extends ConfigurationItem<IBlotterConfiguration> {}

export interface IRealTimeUpdateConfiguration {
  enableBatching: boolean;
  bufferTime: number;
  batchDelay: number;
  batchThreshold: number;
}

export class RealTimeUpdateConfigurationItem extends ConfigurationItem<IRealTimeUpdateConfiguration> {}
