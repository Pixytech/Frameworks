import { CompositeDisposable, DeferHelper, DisposableAction, IDisposable, Token, usingAsync } from "@kinetix/core";

import { IRuleEngine } from "./IRuleEngine";
import { ITicketRules } from "./ITicketRules";
import { RuleBuilderContext } from "./RuleBuilderContext";
import { RuleRequest } from "./RuleRequest";
import { IFormViewModelBase } from "../IFormViewModel";

export class RuleEngine<T extends IFormViewModelBase> implements IRuleEngine<T> {
  private readonly viewModel: T;
  private deferLevel: number = 0;
  private rules: ITicketRules<T>[] = [];
  private isLoading: boolean = false;
  private readonly ruleSubscriptions = new CompositeDisposable();
  constructor(viewModel: T) {
    this.viewModel = viewModel;
  }

  async onLoad(): Promise<void> {
    this.rules.forEach((x) => (x.isLoading = true));
    await Promise.all(this.rules.map((x) => x.onLoad()));
    this.rules.forEach((x) => (x.isLoading = false));
  }

  dispose(): void {
    this.ruleSubscriptions.dispose();
    this.rules.forEach((rule) => {
      rule.rules.forEach((def) => {
        def.rule.dispose();
      });
    });
  }

  public isSuspended(): boolean {
    console.debug("Rule Engine isSuspended", this.deferLevel > 0);
    return this.deferLevel > 0;
  }

  suspend(): IDisposable {
    this.deferLevel = this.deferLevel + 1;
    return new DeferHelper(this);
  }

  EndDefer(): void {
    this.deferLevel = this.deferLevel - 1;
    if (this.deferLevel < 0) {
      this.deferLevel = 0;
    }
  }

  async processRule(ruleRequest: RuleRequest<T>): Promise<void> {
    if (this.shouldExecuteRule(ruleRequest)) {
      const rule = ruleRequest.rule;

      try {
        rule.isExecuting = true;
        console.debug(`Executing rule ${rule.name} on change of property ${ruleRequest.property.name}`);
        if (ruleRequest.isLoading) {
          await usingAsync(this.viewModel.SuspendNotifications(), async () => {
            await rule.execute(this.viewModel, ruleRequest.property);
          });
        } else {
          await rule.execute(this.viewModel, ruleRequest.property);
        }
      } catch (e) {
        console.error(
          `Unable to execute rule ${rule} for 
                        ${ruleRequest.property.name}...`,
          e
        );
      } finally {
        rule.isExecuting = false;
      }
    } else {
      console.debug(`Skipped already executing rule ${ruleRequest.rule.name}`);
    }
  }

  private shouldExecuteRule(ruleRequest: RuleRequest<T>): boolean {
    return !this.isSuspended() && !ruleRequest.rule.isExecuting;
  }

  async loadRules<TRule extends ITicketRules<T>>(token: Token<TRule>): Promise<void> {
    try {
      this.isLoading = true;
      const ticketRule = this.viewModel.container.build<ITicketRules<T>>(token);
      const ruleContext = new RuleBuilderContext<T>(this.viewModel.container, this.viewModel, this.viewModel.eventType, new Date(Date.now()));
      if (ticketRule == null) return;
      ticketRule.initialize(ruleContext);
      const ruleDefinitions = await ticketRule.load();

      ruleDefinitions.forEach((definition) => {
        const subscription = definition.triggers.map((field) => {
          const fieldSubscription = field.model.onValueChanged.subscribe((v) => {
            this.processRule(new RuleRequest<T>(definition.rule, this.isLoading, field));
          });
          return new DisposableAction(() => {
            fieldSubscription.unsubscribe();
          });
        });

        this.ruleSubscriptions.addRange(subscription);

        // kick rule on load
        // this.processRule(new RuleRequest<T>(definition.rule,this.isLoading,definition.triggers[0]));
      });

      this.rules.push(ticketRule);
    } finally {
      this.isLoading = false;
    }
  }
}
