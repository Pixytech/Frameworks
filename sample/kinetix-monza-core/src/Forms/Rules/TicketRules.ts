import { IContainer, IocInjectable } from "@kinetix/core";
import { IRuleDefinition } from "./IRuleDefinition";
import { ITicketRules } from "./ITicketRules";
import { RuleBuilder } from "./RuleBuilder";
import { RuleBuilderContext } from "./RuleBuilderContext";
import { IFormViewModelBase } from "../IFormViewModel";
import { IFormField } from "../Fields";

@IocInjectable()
export abstract class TicketRules<T extends IFormViewModelBase> implements ITicketRules<T> {
  readonly rules: IRuleDefinition<T>[] = [];
  protected container: IContainer;
  protected currentDate: Date;
  protected eventType: string;
  protected viewmodel: T;
  readonly isLoading: boolean = false;
  initialize(context: RuleBuilderContext<T>): void {
    this.container = context.container;
    this.currentDate = context.currentDate;
    this.eventType = context.eventType;
    this.viewmodel = context.viewmodel;
  }

  protected abstract configureRules(): Promise<void>;

  async load(): Promise<IRuleDefinition<T>[]> {
    await this.configureRules();
    return this.rules;
  }

  whenChange(fieldOnChange: (model: T) => IFormField[]): RuleBuilder<T> {
    const fields = fieldOnChange(this.viewmodel);
    return new RuleBuilder<T>(this.rules, this.viewmodel, fields, this.container);
  }

  public async onLoad(): Promise<void> {}
}
