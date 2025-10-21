import { IViewModelBase } from "@kinetix/core";
import { IWidget } from "../../IWidget";
import { WidgetContainerTabModel } from "./WidgetContainerTabModel";

export interface IWidgetContainerTab extends IViewModelBase<WidgetContainerTabModel> {
    widget: IWidget;
}