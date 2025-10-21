import { ITabOptions } from ".";
import { IBlotter } from "../../Blotter/IBlotter";
import { IWidget } from "../IWidget";
import { WidgetTypes } from "../models";

export class WidgetContainerModel {
  key: string;
  // specify width and height in terms of dashboard grid cells
  // when used in a dashboad grid layout
  width: number = 5;
  height: number = 4;
  minWidth?: number;
  minHeight?: number;
  // start position in terms of dashboard grid cells
  // when used in a dashboad grid layout
  row: number = 0;
  column: number = 0;
  selectedTab: number = 0;
  tabs: IWidgetTab[] = [];
  IsTabFocusClick: boolean = false;
}

export interface IWidgetTab {
  key: string;
  title: string;
  widgetType: WidgetTypes;
  optionVM: ITabOptions;
  IsCustomWidget?: boolean;
  widget?: IWidget | IBlotter;
}
