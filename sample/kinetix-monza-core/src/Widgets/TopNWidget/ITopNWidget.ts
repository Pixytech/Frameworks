import { IViewModelBase } from "@kinetix/core";
import { CompositeDataFilter } from "../../Data";
import { IWidget } from "../IWidget";
import {
  ITermWidget,
  IUserPreferenceContext,
  IWidgetDefinition,
} from "../models";
import { ITopNWidgetItem, TopNWidgetModel } from "./TopNWidgetModel";

export interface ITopNWidget extends IViewModelBase<TopNWidgetModel>, IWidget {
  itemDefinitions: ITopNWidgetItemDefinition[];
  itemColumnDisplayName: string;
  valueColumnDisplayName: string;
  configure(
    widgetDefinition: ITopNWidgetDefinition,
    filters: CompositeDataFilter,
    preference: IUserPreferenceContext
  ): void;
  showDetails(item?: ITopNWidgetItem): void;
}

export interface ITopNWidgetItemDefinition {
  key: string;
  displayName: string;
  color: string;
}

export interface ITopNWidgetDefinition extends IWidgetDefinition {
  itemDefinitions: ITopNWidgetItemDefinition[];
  termConfig: ITermWidget;
  itemColumnDisplayName: string;
  valueColumnDisplayName: string;
}
