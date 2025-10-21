import { CompositeDisposable, CoreTypes, IocInject, ViewModelBase } from "@kinetix/core";
import type {
  IContainer,
  IEventAggregator,
  IDialogService,
} from "@kinetix/core";
import {
  WidgetDrillDownEvent,
  WidgetDrillDownEventPayload,
} from "../../Events";
import { IBlotter } from "../../Blotter/IBlotter";
import { TradingCoreTypes } from "../../TradingCoreTypes";
import { dataService } from "../../Utils/blotterApi";

import { IWidgetDetails } from "./IWidgetDetails";
import { WidgetDetailsModel } from "./WidgetDetailsModel";
import { WidgetTitleBar } from "./WidgetTitleBar";

export class WidgetDetailsViewModel
  extends ViewModelBase<WidgetDetailsModel>
  implements IWidgetDetails
{
  protected readonly container: IContainer;
  protected readonly events: IEventAggregator;

  dialogService: IDialogService;
  pageSubscriptions: CompositeDisposable;

  constructor(
    @IocInject(CoreTypes.IContainer) builder: IContainer,
    @IocInject(CoreTypes.IDialogService) dialogService: IDialogService,
    @IocInject(CoreTypes.IEventAggregator) events: IEventAggregator
  ) {
    super();
    this.dialogService = dialogService;
    this.container = builder;
    this.events = events;
  }

  protected createModel(): WidgetDetailsModel {
    return new WidgetDetailsModel();
  }

  protected async onInitialize(): Promise<void> {
      this.pageSubscriptions = new CompositeDisposable([
        // Subscribe to Filter Events
    this.events
    .getEvent<WidgetDrillDownEvent>(
      WidgetDrillDownEvent,
      WidgetDrillDownEvent.Type
    )
    .subscribe(this.handleDrillDown)
      ]);
  }

  protected async onCleanup(): Promise<void> {
    this.pageSubscriptions?.dispose();
  }

  private handleDrillDown = async (
    eventArgs: WidgetDrillDownEventPayload
  ): Promise<void> => {
    console.debug("Widget drill down event handler", this.container);

    let blotter = this.container.build<IBlotter>(TradingCoreTypes.Blotter);
    blotter.liveUpdate = false;
    blotter.toolbar.model.allowAutoRefesh = false;
    blotter.toolbar.model.allowManualRefesh = false;
    blotter.updateModel((model) => {
      model.id = "widgetDetailsBlotter";
      model.initialFilter = eventArgs.filters ? eventArgs.filters : undefined;
    });
    const datasets = await dataService.getDatasetViews(
      "61b7b6d6385b8f62201f3d00"
    );
    const dataset = datasets.find(
      (x: any) => x.id && x.id === eventArgs.datasetView
    );
    console.debug("Tgis is the blotter dataset", dataset);
    blotter.datasetView = dataset;
    blotter.liveUpdate = false;
    blotter.toolbar.model.allowAutoRefesh = false;
    blotter.toolbar.model.allowManualRefesh = false;

    console.debug("Loading Widget details", blotter);

    await this.dialogService.ShowDialog(blotter, {
      title: eventArgs.title,
      headerTemplate: WidgetTitleBar,
      initialHeight: 600,
      initialWidth: 1200,
      canClose: true,
      isModel: true,
    });
  };
}
