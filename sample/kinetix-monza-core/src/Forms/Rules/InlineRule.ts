import { IFormField } from "../Fields";
import { IFormViewModelBase } from "../IFormViewModel";
import { Rule } from "./Rule";

export class InlineRule<T extends IFormViewModelBase> extends Rule<T> {
  ruleName: string;
  get name(): string {
    return this.ruleName;
  }

  private readonly callback: (model: T, property: IFormField) => Promise<void>;
  constructor(name: string, callback: (model: T, property: IFormField) => Promise<void>) {
    super();
    this.ruleName = name;
    this.callback = callback;
  }

  async execute(model: T, property: IFormField): Promise<void> {
    await this.callback(model, property);
  }
}
