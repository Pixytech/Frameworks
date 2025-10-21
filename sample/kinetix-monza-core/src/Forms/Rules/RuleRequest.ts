import { IFormField } from "../Fields";
import { IFormViewModelBase } from "../IFormViewModel";
import { IRule } from "./IRule";

export class RuleRequest<T extends IFormViewModelBase> {
  constructor(rule: IRule<T>, isLoading: boolean, property: IFormField) {
    this.rule = rule;
    this.property = property;

    this.isLoading = isLoading;
  }
  public readonly isLoading: boolean;
  public readonly property: IFormField;
  public readonly rule: IRule<T>;
}
