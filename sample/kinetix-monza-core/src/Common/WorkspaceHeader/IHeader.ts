import { IEventAggregator, IViewModelBase } from "@kinetix/core";
import { HeaderModel } from "./HeaderModel";

export interface IHeader extends IViewModelBase<HeaderModel> {
  events: IEventAggregator;
  GetUsername(): string;
  handleUserMenuClick(text: any): void;
  handleClick(events: IEventAggregator, expanded: boolean): void;
}
