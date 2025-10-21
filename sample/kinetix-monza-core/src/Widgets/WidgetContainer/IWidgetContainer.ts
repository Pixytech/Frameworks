import { IViewModelBase } from "@kinetix/core";
import { IWidgetContainerTabDefinition } from "../models";
import { IWidgetTab, WidgetContainerModel } from ".";
import { CompositeDataFilter } from "../../Data";

export interface IWidgetContainer extends IViewModelBase<WidgetContainerModel> {
  handleTabChange(selectedTab: number): void;
  addTab(tabDefinition: IWidgetContainerTabDefinition, initialFilters?: CompositeDataFilter): void;
  removeTab(tab: IWidgetTab): void;
  setDimensions(key: string, row?: number, column?: number, width?: number, height?: number, minWidth?: number, minHeight?: number): void;
}
