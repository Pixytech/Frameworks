import { IFormViewModelBase } from "../IFormViewModel";
import { IRuleDefinition } from "./IRuleDefinition";
import { RuleBuilderContext } from "./RuleBuilderContext";

export interface ITicketRules<T extends IFormViewModelBase> {
  isLoading: boolean;
  readonly rules: IRuleDefinition<T>[];
  initialize(context: RuleBuilderContext<T>): void;
  load(): Promise<IRuleDefinition<T>[]>;
  onLoad(): Promise<void>;
}
