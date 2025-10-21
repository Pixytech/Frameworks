import { CoreTypes, IocInject, IocInjectable, ViewModelBase } from "@kinetix/core";
import type { IEventAggregator } from "@kinetix/core";
import type { IGlobalFilters } from "./IGlobalFilters";
import { IWidget } from "./IWidget";
import { WidgetModel } from "./WidgetModel";
import { TradingCoreTypes } from "../TradingCoreTypes";
import { IWidgetTab } from "./WidgetContainer";
import { MenuItem } from "../Blotter/ContextMenu/MenuItem";
import { CombineCompositeFilters } from "../Data/CompositeDataFilter";

@IocInjectable()
export abstract class WidgetViewModelBase<T extends WidgetModel> extends ViewModelBase<T> implements IWidget {
  datasetView: string;
  drilldownDatasetId: string;
  protected readonly globalFilters: IGlobalFilters;
  protected readonly events: IEventAggregator;

  constructor(@IocInject(TradingCoreTypes.IGlobalFilters) globalFilters: IGlobalFilters, @IocInject(CoreTypes.IEventAggregator) events: IEventAggregator) {
    super();
    this.events = events;
    this.globalFilters = globalFilters;
  }

  async getTabOptions(tab: IWidgetTab): Promise<MenuItem[]> {
    /*
    let menu = [
      {
        id: "about",
        displayName: "About",
        disabled: false,
        icon: "info",
        onSelect: async (items: IWidgetTab[]) => {
          let msg = "";

          items.forEach(
            (x) =>
              (msg +=
                "\nKey : " +
                x.key +
                "\nTitle : " +
                x.title +
                "\nWidgetType : " +
                WidgetTypes[x.widgetType] +
                "\nIsCustomWidget : " +
                x.IsCustomWidget)
          );
          alert(msg);
        },
      },
    ];
    return menu;*/
    return [];
  }

  protected async onInitializeOnce(): Promise<void> {
    this.model.filters = CombineCompositeFilters(this.model.initialFilters, this.globalFilters.filters, "and");
    this.model.preference = this.globalFilters.preference;

    //Subscribe to Filter Events
    this.globalFilters.onSettingChanged.subscribe(async (args) => {
      console.info("Global Setting Event Received", args);
      this.updateModel((model) => {
        if (args === "Filter") {
          model.filters = CombineCompositeFilters(this.model.initialFilters, this.globalFilters.filters, "and");
        }

        if (args === "Preference") {
          model.preference = this.globalFilters.preference;
        }
      });
      await this.loadData();
    });

    await this.loadData();
  }

  datasetId: string;

  abstract loadData(showLoading?: boolean): Promise<void>;

  setLoading(isLoading: boolean): void {
    this.updateModel((model) => (model.isLoading = isLoading));
  }
}
