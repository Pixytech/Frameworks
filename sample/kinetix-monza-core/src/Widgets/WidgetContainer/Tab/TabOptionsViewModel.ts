import {
  INavigationAware,
  IocInjectable,
  IViewModelBase,
  ViewModelBase,
} from "@kinetix/core";
import { TabOptonModel } from ".";
import { IWidgetTab } from "..";
import { Params, NavigateFunction, Location } from "react-router-dom";

export const ITabOptionsType = Symbol.for("ITabOptionsType");

export interface ITabOptions
  extends IViewModelBase<TabOptonModel>,
    INavigationAware {
  OnItemClick(id: string, tab: IWidgetTab): Promise<void>;
  OnTabFocus: any;
}

@IocInjectable()
export class TabOptionsViewModel
  extends ViewModelBase<TabOptonModel>
  implements ITabOptions
{
  QueryParams: Readonly<Params<string>>;
  navigator: NavigateFunction;
  location: Location;
  OnTabFocus: any;

  async OnItemClick(id: string, tab: IWidgetTab): Promise<void> {
    const menu = this.model.options.find((x) => x.id === id);
    if (menu) {
      await menu.onSelect(
        { rows: [tab] },
        {
          location: this.location,
          navigator: this.navigator,
          QueryParams: this.QueryParams,
        }
      );
    }
  }

  protected createModel(): TabOptonModel {
    return new TabOptonModel();
  }
}
