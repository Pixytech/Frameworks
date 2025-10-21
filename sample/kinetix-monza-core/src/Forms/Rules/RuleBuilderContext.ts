import { IContainer } from "@kinetix/core";
import { IFormViewModelBase } from "../IFormViewModel";

export class RuleBuilderContext<T extends IFormViewModelBase> {
  public readonly container: IContainer;
  public readonly viewmodel: T;
  public readonly eventType: string;
  public readonly currentDate: Date;

  constructor(container: IContainer, viewmodel: T, eventType: string, currentDate: Date) {
    this.container = container;
    this.viewmodel = viewmodel;
    this.eventType = eventType;
    this.currentDate = currentDate;
  }
}
