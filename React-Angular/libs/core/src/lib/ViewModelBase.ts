import { Subject, Observable } from "rxjs";
import { IDisposable, using, usingAsync } from "./Disposable";
import { IDeferSource, IPropertyChanged, IRuleEngine, IViewModelBase, IStateManager } from "./Interfaces";
import { DeferHelper } from "./DeferHelper";
import { RuleEngine } from "./RuleEngine";
import { InMemoryStateManager } from "./StateManager";

export abstract class ViewModelBase<TModel extends object> implements IViewModelBase<TModel>, IDeferSource {
  public model: TModel;
  public readonly onModelChanged: Observable<IPropertyChanged>;
  private readonly stateSubject: Subject<IPropertyChanged>;
  private readonly _rules: RuleEngine<TModel, keyof TModel>;
  private ruleSubscription: IDisposable | null = null;
  private readonly accumulateChange: IPropertyChanged[] = [];
  private _stateManager: IStateManager<TModel>;
  private stateManagerSubscription: IDisposable | null = null;

  public get rules(): IRuleEngine<TModel, keyof TModel> {
    return this._rules;
  }

  isinitialized: boolean = false;
  private deferLevel: number = 0;

  constructor() {
    this.stateSubject = new Subject<IPropertyChanged>();
    this.onModelChanged = this.stateSubject.asObservable();
    
    // Default to InMemoryStateManager
    this._stateManager = new InMemoryStateManager<TModel>();
    
    // Initialize the state manager with the model
    this._stateManager.initialize(this.createModel());
    
    // Get the model from the state manager (this will be the proxied model)
    this.model = this._stateManager.getModel();
    
    // Subscribe to state manager changes
    this.stateManagerSubscription = this._stateManager.subscribe((change: any) => {
      this.notifyModelChanged(change);
    });
    
    this._rules = new RuleEngine(this);
  }

  protected abstract createModel(): TModel;

  public async initialize(): Promise<void> {
    if (this.onInitializeOnce && !this.isinitialized) {
      this.isinitialized = true;
      await this.onInitializeOnce();
      await usingAsync(this.suspendNotifications(), async () => {
        this.ruleSubscription = this._rules.run();
      });
    }

    if (this.onInitialize) {
      await this.onInitialize();
    }
  }

  /**
   * Batch update model and emit single notifyModelChanged to update view
   * @param callback call back to update the model
   */
  public batchUpdate(callback: (model: TModel) => void): void {
    using(this.suspendNotifications(), async () => {
      // Use the state manager's updateModel method instead of directly modifying the model
      // This works for both InMemoryStateManager (with proxy) and ReduxStateManager (with actions)
      this._stateManager.updateModel((currentModel: TModel) => {
        // Create a mutable copy for the callback to modify
        const mutableModel = { ...currentModel } as TModel;
        callback(mutableModel);
        return mutableModel;
      });
      
      // Update the model reference in case the state manager created a new model (like InMemoryStateManager)
      this.model = this._stateManager.getModel();
    });
    const batchedNames = [...new Set(this.accumulateChange.flatMap(x => x.names))];
    this.accumulateChange.length = 0;
    this.notifyModelChanged({ names: batchedNames });
  }

  /**
   * notify view that model has changed and requires rerender. this is involved automatically
   * @param change list of propertyNames, empty list will force update
   */
  public notifyModelChanged(change: IPropertyChanged): void {
    if (!this.isNotificationsSuspended() || change?.names.length == 0) {
      this.stateSubject.next(change);
    } else {
      this.accumulateChange.push(change);
    }
  }

  /**
   * Get the state manager instance (useful for subclasses that need direct access)
   */
  public get stateManager(): IStateManager<TModel> {
    return this._stateManager;
  }

  /**
   * Swap the state manager (useful for changing from in-memory to Redux, etc.)
   */
  public setStateManager(newStateManager: IStateManager<TModel>): void {
    // Dispose the old state manager
    this.stateManagerSubscription?.dispose();
    this._stateManager.dispose();
    
    // Set the new state manager
    this._stateManager = newStateManager;
    
    // Initialize the new state manager with the current model
    this._stateManager.initialize(this.createModel());
    
    // Update the model reference
    (this as any).model = this._stateManager.getModel();
    
    // Subscribe to the new state manager changes
    this.stateManagerSubscription = this._stateManager.subscribe((change: any) => {
      this.notifyModelChanged(change);
    });
  }

  public async cleanup(): Promise<void> {
    if (this.onCleanup) {
      await usingAsync(this.suspendNotifications(), async () => {
        if (this.onCleanup) {
          await this.onCleanup();
        }
      });
    }
  }

  public isNotificationsSuspended(): boolean {
    return this.deferLevel > 0;
  }

  public suspendNotifications(): IDisposable {
    this.deferLevel += 1;
    return new DeferHelper(this);
  }

  dispose(): void {
    this.ruleSubscription?.dispose();
    this.stateManagerSubscription?.dispose();
    this._stateManager.dispose();
  }

  endDefer(): void {
    this.deferLevel--;
    if (this.deferLevel === 0) {
      // All defer levels completed
    }
  }

  /*
   * On component unmount this method will be invoked
   */
  protected async onCleanup?(): Promise<void>;

  /*
   * On component mount/update this method will be invoked
   */
  protected async onInitialize?(): Promise<void>;

  /*
   * On component mount for first time only this method will be invoked
   */
  protected async onInitializeOnce?(): Promise<void>;
}
