import { SortDescriptor } from "@progress/kendo-data-query";
import { CompositeDataFilter } from "../Data";
import { FxRateDateType } from "../FxRateDateType";
import { AggregationType } from "../Utils/analyticsService";

export enum WidgetTypes {
  Pie,
  Donut,
  TopN,
  Bar,
  LiveInquiry,
  Blotter,
}

export enum GlobalSettingSource {
  Filter = "Filter",
  Preference = "Preference",
}

export interface ICurrencyContext {
  reportingCCY: string;
  fxRateDateType: FxRateDateType;
}

export interface IUserPreferenceContext {
  // themeSettings:
  // blotterSettings:
  currencySettings: ICurrencyContext;
}

export interface IWidgetContainerDefinition {
  key: string;
  width: number;
  minWidth?: number;
  minHeight?: number;
  height: number;
  row: number;
  column: number;
  initialFilters: CompositeDataFilter;
  widgetTabs: IWidgetContainerTabDefinition[];
}

export interface IWidgetContainerTabDefinition {
  key: string;
  title: string;
  widgetType: WidgetTypes;
  IsCustomWidget?: boolean;
  widgetDefinition: IWidgetDefinition;
}

export interface ITermWidget {
  groupByField: string;
  aggregateByField: string;
  aggregationType: AggregationType;
  limit: number;
}

export interface IHistogramWidget {
  xAxisField: string;
  yAxisField: string;
  interval: number;
  aggregationType: AggregationType;
}

export interface IDateHistogramWidget {
  xAxisField: string;
  yAxisField: string;
  intervalExpression: string;
  aggregationType: AggregationType;
}

export interface IWidgetDefinition {
  datasetId: string;
  datasetView?: string;
  drilldownDatasetId?: string;
  primaryKey?: string[];
  sortDefinitions?: SortDescriptor[];
  filters?: CompositeDataFilter;
  initialFilters?: CompositeDataFilter;
}
