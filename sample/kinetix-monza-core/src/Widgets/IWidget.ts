import { IViewModel } from "@kinetix/core";
import { IWidgetTab, MenuItem } from "..";

export interface IWidget extends IViewModel {
  datasetId: string;
  datasetView: string;
  loadData(showLoading: boolean): Promise<void>;
  setLoading(isLoading: boolean): void;
  getTabOptions(tab: IWidgetTab): Promise<MenuItem[]>;
}
