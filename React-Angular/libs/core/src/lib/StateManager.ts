import { Subject } from "rxjs";
import { IDisposable } from "./Disposable";
import { IStateManager, IPropertyChanged } from "./Interfaces";

export class InMemoryStateManager<TModel extends object> implements IStateManager<TModel> {
  private model: TModel;
  private changeSubject = new Subject<IPropertyChanged>();
  private proxy: TModel;

  constructor() {
    this.model = {} as TModel;
    this.proxy = this.createProxy(this.model);
  }

  initialize(initialModel: TModel): void {
    this.model = { ...initialModel };
    this.proxy = this.createProxy(this.model);
  }

  getModel(): TModel {
    return this.proxy;
  }

  updateModel(updater: (currentModel: TModel) => TModel): void {
    const newModel = updater(this.model);
    this.model = newModel;
    this.proxy = this.createProxy(this.model);
  }

  subscribe(callback: (change: IPropertyChanged) => void): IDisposable {
    const subscription = this.changeSubject.subscribe(callback);
    return {
      dispose: () => subscription.unsubscribe()
    };
  }

  dispose(): void {
    this.changeSubject.complete();
  }

  private createProxy(target: TModel): TModel {
    return new Proxy(target, {
      set: (obj, prop, value) => {
        const oldValue = (obj as any)[prop];
        (obj as any)[prop] = value;
        
        if (oldValue !== value) {
          this.changeSubject.next({ names: [prop as string] });
        }
        
        return true;
      },
      get: (obj, prop) => {
        return (obj as any)[prop];
      }
    });
  }
}

export class ReduxStateManager<TModel extends object> implements IStateManager<TModel> {
  private model: TModel;
  private changeSubject = new Subject<IPropertyChanged>();

  constructor() {
    this.model = {} as TModel;
  }

  initialize(initialModel: TModel): void {
    this.model = { ...initialModel };
  }

  getModel(): TModel {
    return this.model;
  }

  updateModel(updater: (currentModel: TModel) => TModel): void {
    const newModel = updater(this.model);
    this.model = newModel;
    
    // For Redux-style state management, we emit a change for all properties
    // In a real implementation, you might want to track which specific properties changed
    const allProperties = Object.keys(this.model);
    this.changeSubject.next({ names: allProperties });
  }

  subscribe(callback: (change: IPropertyChanged) => void): IDisposable {
    const subscription = this.changeSubject.subscribe(callback);
    return {
      dispose: () => subscription.unsubscribe()
    };
  }

  dispose(): void {
    this.changeSubject.complete();
  }
}
