import { CompositeDataFilter } from "../../Data";
import { WidgetTypes } from "../models";

export class WidgetDetailsModel {
  widgetType: WidgetTypes;
  title: string;
  filter: CompositeDataFilter;
  datasetView: string;
}
