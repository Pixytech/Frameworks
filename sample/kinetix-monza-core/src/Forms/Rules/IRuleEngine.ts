import { Token } from "@kinetix/core";

import { IRuleEngineBase } from "./IRuleEngineBase";
import { RuleRequest } from "./RuleRequest";
import { IFormViewModelBase } from "../IFormViewModel";
import { ITicketRules } from "./ITicketRules";

export interface IRuleEngine<T extends IFormViewModelBase> extends IRuleEngineBase {
  loadRules<TRule extends ITicketRules<T>>(token: Token<TRule>): Promise<void>;
  processRule(ruleRequest: RuleRequest<T>): Promise<void>;
  onLoad(): Promise<void>;
}
