import { Observable } from "rxjs";
import { IDisposable } from "./Disposable";

export interface IPropertyChanged {
  names: string[];
}

export interface IViewModel extends IDisposable {
  readonly isinitialized: boolean;
  readonly onModelChanged: Observable<IPropertyChanged>;
  notifyModelChanged(change: IPropertyChanged): void;
  cleanup(): Promise<void>;
  initialize(): Promise<void>;
  isNotificationsSuspended(): boolean;
  suspendNotifications(): IDisposable;
}

export interface IViewModelBase<TModel> extends IViewModel {
  readonly model: TModel;
  readonly rules: IRuleEngine<TModel, keyof TModel>;
  batchUpdate(callback: (model: TModel) => void): void;
}

export interface IRule<TModel, K extends keyof TModel> {
  dependencies: K[];
  execute(target: IViewModelBase<TModel>): Promise<void>;
}

export interface IRuleEngine<TModel, K extends keyof TModel> {
  throttle: number; 
  addInline(callback: () => Promise<void>, dependencies: K[]): IRuleEngine<TModel, keyof TModel>;
  add(rule: IRule<TModel, keyof TModel>): IRuleEngine<TModel, keyof TModel>;
  run(): IDisposable;
  runImmediate(): IDisposable;
}

export interface ICommand {
  canExecute(commandParameter?: any): boolean;
  execute(commandParameter?: any): void;
  readonly onCanExecuteChanged: Observable<void>;
  raiseCanExecuteChanged(): void;
}

export interface ICommandOf<T> extends ICommand {
  canExecute(commandParameter: T): boolean;
  execute(commandParameter: T): void;
}

export interface INavigationAware {
  queryParams?: Readonly<Record<string, string | undefined>>;
  navigator?: (to: string) => void;
  location?: any;
}

export interface IDeferSource {
  endDefer(): void;
}

export interface IStateManager<TModel> extends IDisposable {
  initialize(initialModel: TModel): void;
  getModel(): TModel;
  updateModel(updater: (currentModel: TModel) => TModel): void;
  subscribe(callback: (change: IPropertyChanged) => void): IDisposable;
}
