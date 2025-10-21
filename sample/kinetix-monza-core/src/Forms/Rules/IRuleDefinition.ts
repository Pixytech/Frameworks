import { IFormField } from "../Fields";
import { IFormViewModelBase } from "../IFormViewModel";
import { IRule } from "./IRule";

export interface IRuleDefinition<T extends IFormViewModelBase> {
  triggers: IFormField[];
  rule: IRule<T>;
}
