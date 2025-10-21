import { IViewModelBase } from "@kinetix/core";
import { CompositeDataFilter } from "../../Data";
import { IWidget } from "../IWidget";
import { ITermWidget, IUserPreferenceContext, IWidgetDefinition } from "../models";
import { IPieWidgetItem, PieWidgetModel } from "./PieWidgetModel";
import { SizeInfo } from "rc-resize-observer";

export interface IPieWidget extends IViewModelBase<PieWidgetModel>, IWidget {
  itemDefinitions: IPieWidgetItemDefinition[];
  isDonut: boolean;
  customHoleSize?: number;
  isMultiCategory: boolean;
  handleWidgetResize(size: SizeInfo): void;
  configure(widgetDefinition: IPieWidgetDefinition, filters: CompositeDataFilter, preference: IUserPreferenceContext): void;
  showDetails(item?: { dataItem: IPieWidgetItem }): void;
}

export interface IPieWidgetItemDefinition {
  key: string;
  displayName: string;
  color: string;
}

export interface IPieWidgetDefinition extends IWidgetDefinition {
  itemDefinitions: IPieWidgetItemDefinition[];
  termConfig: ITermWidget;
  customHoleSize?: number;
}
