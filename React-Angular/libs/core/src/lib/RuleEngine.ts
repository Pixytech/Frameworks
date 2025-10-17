import { Subject, debounceTime, distinctUntilChanged } from "rxjs";
import { IDisposable } from "./Disposable";
import { IViewModelBase, IRule, IRuleEngine } from "./Interfaces";

export class RuleEngine<TModel, K extends keyof TModel> implements IRuleEngine<TModel, K> {
  public throttle: number = 0;
  private rules: IRule<TModel, K>[] = [];
  private inlineRules: Array<{ callback: () => Promise<void>; dependencies: K[] }> = [];
  // private _subscription: IDisposable | null = null;
  private isRunning = false;

  constructor(private viewModel: IViewModelBase<TModel>) {}

  addInline(callback: () => Promise<void>, dependencies: K[]): IRuleEngine<TModel, keyof TModel> {
    this.inlineRules.push({ callback, dependencies });
    return this;
  }

  add(rule: IRule<TModel, K>): IRuleEngine<TModel, keyof TModel> {
    this.rules.push(rule);
    return this;
  }

  run(): IDisposable {
    if (this.isRunning) {
      return { dispose: () => {} };
    }

    this.isRunning = true;
    const changeSubject = new Subject<string[]>();
    
    const subscription = changeSubject
      .pipe(
        debounceTime(this.throttle),
        distinctUntilChanged((prev, curr) => 
          prev.length === curr.length && prev.every((val, index) => val === curr[index])
        )
      )
      .subscribe(async (changedProperties) => {
        await this.executeRules(changedProperties);
      });

    const modelSubscription = this.viewModel.onModelChanged.subscribe((change) => {
      changeSubject.next(change.names);
    });

    return {
      dispose: () => {
        subscription.unsubscribe();
        modelSubscription.unsubscribe();
        this.isRunning = false;
      }
    };
  }

  runImmediate(): IDisposable {
    if (this.isRunning) {
      return { dispose: () => {} };
    }

    this.isRunning = true;
    const modelSubscription = this.viewModel.onModelChanged.subscribe(async (change) => {
      await this.executeRules(change.names);
    });

    return {
      dispose: () => {
        modelSubscription.unsubscribe();
        this.isRunning = false;
      }
    };
  }

  private async executeRules(changedProperties: string[]): Promise<void> {
    const allRules = [
      ...this.rules,
      ...this.inlineRules.map(rule => ({
        dependencies: rule.dependencies,
        execute: async () => await rule.callback()
      }))
    ];

    for (const rule of allRules) {
      const hasDependencyChange = rule.dependencies.some(dep => 
        changedProperties.includes(dep as string)
      );

      if (hasDependencyChange) {
        await rule.execute(this.viewModel);
      }
    }
  }
}
