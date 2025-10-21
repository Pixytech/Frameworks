import { PubSubEvent } from "@kinetix/core";
import { CompositeDataFilter } from "../Data";

import { WidgetTypes } from "../Widgets";

export class WidgetDrillDownEventPayload {
  constructor(
    title: string,
    widgetType: WidgetTypes,
    datasetView: string,
    filters: CompositeDataFilter
  ) {
    this.title = title;
    this.widgetType = widgetType;
    this.datasetView = datasetView;
    this.filters = filters;
  }

  public readonly title: string;
  public readonly widgetType: WidgetTypes;
  public readonly datasetView: string;
  public readonly filters: CompositeDataFilter;
}

export class WidgetDrillDownEvent extends PubSubEvent<WidgetDrillDownEventPayload> {
  public static readonly Type = Symbol.for("WidgetDrillDownEvent");
}
