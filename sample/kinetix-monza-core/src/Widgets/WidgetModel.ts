import { CompositeDataFilter } from "../Data";
import { IUserPreferenceContext } from "./models";

export class WidgetModel {
  isLoading: boolean;
  filters: CompositeDataFilter = { logic: "and", filters: [] };
  initialFilters: CompositeDataFilter = { logic: "and", filters: [] };
  preference: IUserPreferenceContext;
  isFirstRender: boolean = true;
  showFullView: boolean = false;
}
