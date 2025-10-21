import { IContainer, Token } from "@kinetix/core";

import { IRuleDefinition } from "./IRuleDefinition";
import { IRule } from "./IRule";
import { IFormViewModelBase } from "../IFormViewModel";
import { InlineRule } from "./InlineRule";
import { IFormField } from "../Fields";

export class RuleBuilder<T extends IFormViewModelBase> {
  private readonly container: IContainer;
  private readonly form: T;
  private readonly rules: IRuleDefinition<T>[];

  thenRule<TRule extends IRule<T>>(ruleToken: Token<TRule>, configure?: (model: T, rule: TRule) => void): void {
    const rule = this.container.build<TRule>(ruleToken);
    if (configure) {
      configure(this.form, rule);
    }
    this.rules.push({ triggers: this.sourceFields, rule: rule });
  }

  then(ruleName: string, callback: (model: T, property: IFormField) => Promise<void>): void {
    const rule = new InlineRule<T>(ruleName, callback);
    this.rules.push({ triggers: this.sourceFields, rule: rule });
  }

  private readonly sourceFields: IFormField[];

  constructor(rules: IRuleDefinition<T>[], form: T, sourceFields: IFormField[], container: IContainer) {
    this.form = form;
    this.sourceFields = sourceFields;
    this.container = container;
    this.rules = rules;
  }
}
