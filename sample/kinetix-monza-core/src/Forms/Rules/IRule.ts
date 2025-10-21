import { CompositeDisposable, IDisposable } from "@kinetix/core";
import { IFormField } from "../Fields";
import { IFormViewModelBase } from "../IFormViewModel";

export interface IRule<T extends IFormViewModelBase> extends IDisposable {
  isExecuting: boolean;
  readonly name: string;
  readonly subscriptions: CompositeDisposable;
  execute(model: T, property: IFormField): Promise<void>;
}
