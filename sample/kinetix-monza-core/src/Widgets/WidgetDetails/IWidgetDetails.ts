import { IViewModelBase } from "@kinetix/core";
import { WidgetDetailsModel } from "./WidgetDetailsModel";

export const IWidgetDetailType = Symbol.for("IWidgetDetailType");

export interface IWidgetDetails extends IViewModelBase<WidgetDetailsModel> {}
