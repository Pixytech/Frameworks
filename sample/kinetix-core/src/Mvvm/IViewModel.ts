import { NavigateFunction, Params, Location } from "react-router-dom";
import { Observable } from "rxjs";
import { IDisposable } from "../Core";

export class NavigationResuest {
  constructor(path: string) {
    this.path = path;
  }
  public readonly path: string;
}
export interface INavigationAware {
  QueryParams: Readonly<Params<string>>;
  navigator: NavigateFunction;
  location: Location;
}

export interface IViewModel {
  readonly isinitialized: boolean;
  notifyModelChanged(force?:boolean): void;
  cleanup(): Promise<void>;
  initialize(): Promise<void>;
  IsNotificationsSuspended(): boolean;
  SuspendNotifications(): IDisposable;
}

export interface IViewModelBase<TModel> extends IViewModel {
  readonly model: TModel;
  readonly onModelChanged: Observable<TModel>;
  updateModel(callback: (model: TModel) => void): void;
}
