import { IocInjectable } from "@kinetix/core";
import { debounceTime, Observable, Subject } from "rxjs";
import { CompositeDataFilter } from "../Data";
import { IGlobalFilters } from "./IGlobalFilters";
import { GlobalSettingSource, IUserPreferenceContext } from "./models";

@IocInjectable()
export class GlobalFilters implements IGlobalFilters {
  private lastfilters: CompositeDataFilter;
  private lastPreferences: IUserPreferenceContext;
  private filterSubject: Subject<GlobalSettingSource> =
    new Subject<GlobalSettingSource>();

  get onSettingChanged(): Observable<GlobalSettingSource> {
    return this.filterSubject.pipe(debounceTime(500));
  }

  public changeFilters(args: CompositeDataFilter): void {
    this.lastfilters = args;
    this.filterSubject.next(GlobalSettingSource.Filter);
  }

  public changePreference(args: IUserPreferenceContext): void {
    this.lastPreferences = args;
    this.filterSubject.next(GlobalSettingSource.Preference);
  }

  public get preference(): IUserPreferenceContext {
    return this.lastPreferences;
  }

  public get filters(): CompositeDataFilter {
    return this.lastfilters;
  }
}
