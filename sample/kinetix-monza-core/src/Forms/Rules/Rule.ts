import { CompositeDisposable, IocInjectable } from "@kinetix/core";
import { IFormField } from "../Fields";
import { IRule } from "./IRule";
import { IFormViewModelBase } from "../IFormViewModel";

@IocInjectable()
export abstract class Rule<T extends IFormViewModelBase> implements IRule<T> {
  isExecuting: boolean = false;
  abstract get name(): string;

  dispose(): void {
    this.subscriptions.dispose();
  }

  readonly subscriptions: CompositeDisposable = new CompositeDisposable();
  abstract execute(model: T, property: IFormField): Promise<void>;
}
