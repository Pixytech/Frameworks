import { Observable } from "rxjs";
import { GlobalSettingSource, IUserPreferenceContext } from ".";
import { CompositeDataFilter } from "../Data";

export interface IGlobalFilters {
  readonly filters: CompositeDataFilter;
  readonly preference: IUserPreferenceContext;
  readonly onSettingChanged: Observable<GlobalSettingSource>;
  changeFilters(filters: CompositeDataFilter): void;
  changePreference(preference: IUserPreferenceContext): void;
}
