import { IViewModelBase } from "@kinetix/core";
import { CompositeDataFilter } from "../../Data";
import { IWidget } from "../IWidget";
import { IDateHistogramWidget, IWidgetDefinition } from "../models";
import { BarWidgetModel } from "./BarWidgetModel";

export interface IBarWidget extends IViewModelBase<BarWidgetModel>, IWidget {
  stack: boolean;
  categoryField: string;
  categoryColorPalette: string[];
  categoryDefinitions?: IBarWidgetCategoryDefinition[];
  configure(widgetDefinition: IBarWidgetDefinition, filters: CompositeDataFilter): void;
  handleIntervalTabChange(selecedIntervalTab: number): Promise<void>;
  getIntervalExpresion(): string;
  getXAxisIntervals(): string[];
  showDetails(item?: any): void;
}

export interface IBarWidgetCategoryDefinition {
  name: string;
  color?: string;
}

export interface IBarWidgetDefinition extends IWidgetDefinition {
  stack: boolean;
  categoryField: string;
  categoryDefinitions?: IBarWidgetCategoryDefinition[];
  categoryColorPalette: string[];
  histogramConfig: IDateHistogramWidget;
}
