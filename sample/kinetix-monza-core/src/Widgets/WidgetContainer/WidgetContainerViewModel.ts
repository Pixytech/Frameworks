import { CoreTypes, IocInject, IocInjectable, usingAsync, ViewModelBase } from "@kinetix/core";
import type { IContainer } from "@kinetix/core";

import { TradingCoreTypes } from "../../TradingCoreTypes";
import { dataService } from "../../Utils/blotterApi";
import { BarWidgetViewModel, IBarWidget, IBarWidgetDefinition } from "../BarWidget";
import { IWidget } from "../IWidget";
import { ILiveInquiryWidget, ILiveInquiryWidgetDefinition, LiveInquiryWidgetViewModel } from "../LiveInquiryWidget";
import { IWidgetContainerTabDefinition, WidgetTypes } from "../models";

import { IPieWidget, IPieWidgetDefinition, PieWidgetViewModel } from "../PieWidget";
import { ITopNWidget, ITopNWidgetDefinition, TopNWidgetViewModel } from "../TopNWidget";
import { IWidgetContainer } from "./IWidgetContainer";
import { IWidgetTab, WidgetContainerModel } from "./WidgetContainerModel";
import { CombineCompositeFilters, CompositeDataFilter, GlobalSettingSource, IBlotter, ITabOptionsType, TabOptionsViewModel } from "../..";
import type { IGlobalFilters } from "../..";
import { debounce } from "lodash";

@IocInjectable()
export class WidgetContainerViewModel extends ViewModelBase<WidgetContainerModel> implements IWidgetContainer {
  selectedUser = {
    id: "61b7b6d6385b8f62201f3d00",
  };
  globalFilters: IGlobalFilters;

  constructor(@IocInject(CoreTypes.IContainer) builder: IContainer, @IocInject(TradingCoreTypes.IGlobalFilters) globalFilters: IGlobalFilters) {
    super();
    this.container = builder;
    this.globalFilters = globalFilters;
  }

  private container: IContainer;

  protected createModel(): WidgetContainerModel {
    return new WidgetContainerModel();
  }

  protected async onInitializeOnce(): Promise<void> {
    //Subscribe to Filter Events
    this.globalFilters.onSettingChanged.subscribe(async (args) => {
      if (args === GlobalSettingSource.Filter) {
        const blotters = this.model.tabs.filter((x) => x.widgetType === WidgetTypes.Blotter).map((x) => x.widget as IBlotter);

        await Promise.all(
          blotters.map(async (blotter) => {
            await this.loadBlotter(blotter, this.globalFilters.filters);
          })
        );
      }
    });
  }

  handleTabChange = debounce((selectedTab: number) => {
    if (!this.model.IsTabFocusClick && selectedTab <= this.model.tabs.length - 1) {
      this.updateModel((model) => (model.selectedTab = selectedTab));
    } else {
      this.model.IsTabFocusClick = false;
    }
  }, 200);

  private async loadBlotter(blotter: IBlotter, filters: CompositeDataFilter) {
    try {
      blotter.updateModel((m) => (m.busyText = "Loading.."));
      await usingAsync(blotter.SuspendNotifications(), async () => {
        const filter = filters;
        blotter.updateModel((model) => {
          model.state.skip = 0;
          model.initialFilter = filter?.filters?.length > 0 ? filter : undefined;
        });
        console.debug("Loading new data in blotter", filter);
        await blotter.loadData();
      });
    } finally {
      blotter.updateModel((m) => (m.busyText = ""));
    }
  }

  async addTab(tabDefinition: IWidgetContainerTabDefinition, initialFilters?: CompositeDataFilter): Promise<void> {
    let tabOption = this.container.build<TabOptionsViewModel>(ITabOptionsType);
    tabOption.OnTabFocus = (e: boolean) => {
      this.model.IsTabFocusClick = e;
    };
    let newTab: IWidgetTab = {
      key: tabDefinition.key,
      title: tabDefinition.title,
      optionVM: tabOption,
      widgetType: tabDefinition.widgetType,
      IsCustomWidget: tabDefinition.IsCustomWidget,
    };

    newTab.widget = await this.getWidget(tabDefinition, initialFilters);

    this.updateModel((model) => model.tabs.push(newTab));

    if (newTab.widget) {
      const newTabOptions = await newTab.widget.getTabOptions(newTab);
      tabOption.updateModel(async (m) => {
        m.options = newTabOptions;
      });
    }
  }

  removeTab(tab: IWidgetTab) {
    this.updateModel((model) => {
      if (this.model.selectedTab == model.tabs.indexOf(tab)) {
        this.model.selectedTab -= 1;
      }
      model.tabs = model.tabs.filter((item) => item.key !== tab.key);
      model.IsTabFocusClick = false;
    });
  }

  setDimensions(key: string, row?: number, column?: number, width?: number, height?: number, minWidth?: number, minHeight?: number): void {
    this.updateModel((model) => {
      model.key = key;
      if (row) model.row = row;
      if (column) model.column = column;
      if (width) model.width = width;
      if (height) model.height = height;
      if (minWidth) model.minWidth = minWidth;
      if (minHeight) model.minHeight = minHeight;
    });
  }

  private async getWidget(tabDef: IWidgetContainerTabDefinition, initialFilters?: CompositeDataFilter): Promise<IWidget | IBlotter> {
    if (tabDef.widgetType === WidgetTypes.Pie || tabDef.widgetType === WidgetTypes.Donut) {
      let pieWidget = this.container.build<IPieWidget>(PieWidgetViewModel);
      const widgetDefinition = tabDef.widgetDefinition as IPieWidgetDefinition;
      pieWidget.configure(widgetDefinition, CombineCompositeFilters(initialFilters, this.globalFilters.filters), this.globalFilters.preference);
      pieWidget.model.initialFilters = initialFilters ? initialFilters : { logic: "and", filters: [] };

      // console.info("Returning pie", pieWidget);
      return pieWidget;
    } else if (tabDef.widgetType === WidgetTypes.TopN) {
      let topNWidget = this.container.build<ITopNWidget>(TopNWidgetViewModel);
      const widgetDefinition = tabDef.widgetDefinition as ITopNWidgetDefinition;
      topNWidget.configure(widgetDefinition, CombineCompositeFilters(initialFilters, this.globalFilters.filters), this.globalFilters.preference);
      topNWidget.model.initialFilters = initialFilters ? initialFilters : { logic: "and", filters: [] };

      // console.info("Returning topN", topNWidget);
      return topNWidget;
    } else if (tabDef.widgetType === WidgetTypes.Bar) {
      let barWidget = this.container.build<IBarWidget>(BarWidgetViewModel);
      const widgetDefinition = tabDef.widgetDefinition as IBarWidgetDefinition;
      barWidget.configure(widgetDefinition, CombineCompositeFilters(initialFilters, this.globalFilters.filters));
      barWidget.model.initialFilters = initialFilters ? initialFilters : { logic: "and", filters: [] };
      // console.info("Returning topN", barWidget);
      return barWidget;
    } else if (tabDef.widgetType === WidgetTypes.LiveInquiry) {
      let liveInqWidget = this.container.build<ILiveInquiryWidget>(LiveInquiryWidgetViewModel);
      const widgetDefinition = tabDef.widgetDefinition as ILiveInquiryWidgetDefinition;
      liveInqWidget.configure(widgetDefinition, CombineCompositeFilters(initialFilters, this.globalFilters.filters));
      liveInqWidget.model.initialFilters = initialFilters ? initialFilters : { logic: "and", filters: [] };
      return liveInqWidget;
    }
    //Blotter
    else {
      const widgetDefinition = tabDef.widgetDefinition as IBarWidgetDefinition;
      var blotterVM = this.container.build<IBlotter>(TradingCoreTypes.Blotter);

      blotterVM.model.id = tabDef.key;
      blotterVM.model.state.sort = tabDef.widgetDefinition.sortDefinitions ? tabDef.widgetDefinition.sortDefinitions : [{ field: "created", dir: "desc" }];
      blotterVM.model.initialFilter = initialFilters;
      blotterVM.model.state.filter = tabDef.widgetDefinition.filters ? tabDef.widgetDefinition.filters : undefined; //

      const datasets = await dataService.getDatasetViews(this.selectedUser.id);
      const dataset = datasets.find((x: any) => x.id && x.id === widgetDefinition.datasetId);
      blotterVM.datasetView = dataset;
      // blotterVM.assetType = AssetType.Eqdt;
      blotterVM.liveUpdate = false;
      blotterVM.toolbar.model.allowAutoRefesh = true;
      blotterVM.toolbar.model.allowManualRefesh = true;
      blotterVM.model.primaryKeys = widgetDefinition.primaryKey;

      return blotterVM;
    }
  }
}
