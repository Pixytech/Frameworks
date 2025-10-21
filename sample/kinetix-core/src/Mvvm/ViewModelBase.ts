import { Subject, Observable } from "rxjs";
import { IDisposable } from "../Core";
import { IocInjectable } from "../IoC";
import { DeferHelper } from "./DeferHelper";
import { IDeferSource } from "./IDeferSource";
import { IViewModelBase } from "./IViewModel";

@IocInjectable()
export abstract class ViewModelBase<TModel> implements IViewModelBase<TModel>, IDeferSource {
  public readonly model: TModel;
  public readonly onModelChanged: Observable<TModel>;
  private readonly stateSubect: Subject<TModel>;

  isinitialized: boolean = false;
  private deferLevel: number = 0;

  constructor() {
    this.stateSubect = new Subject<TModel>();
    this.onModelChanged = this.stateSubect;
    this.model = this.createModel();
  }

  EndDefer(): void {
    this.deferLevel--;
    if (this.deferLevel === 0) {
    }
  }

  protected abstract createModel(): TModel;
  public updateModel(callback: (model: TModel) => void): void {
    callback(this.model);
    this.notifyModelChanged();
  }

  public notifyModelChanged(force:boolean = false): void {
    if (!this.IsNotificationsSuspended() || force) {
      this.stateSubect.next(this.model);
    }
  }

  public async cleanup(): Promise<void> {
    if (this.onCleanup) {
      await this.onCleanup();
    }
  }

  public IsNotificationsSuspended(): boolean {
    return this.deferLevel > 0;
  }

  public SuspendNotifications(): IDisposable {
    this.deferLevel += 1;
    return new DeferHelper(this);
  }

  public async initialize(): Promise<void> {
   if (this.onInitializeOnce && !this.isinitialized) {
      this.isinitialized = true;
      await this.onInitializeOnce();
    }

    if (this.onInitialize) {
      await this.onInitialize();
    }
  }

  /*
   * On component unmount this method will be invoked
   */
  protected async onCleanup?(): Promise<void>;

  /*
   * On component mount this method will be invoked
   */
  protected async onInitialize?(): Promise<void>;

  /*
   * On component mount for first time this method will be invoked
   */
  protected async onInitializeOnce?(): Promise<void>;
}
