import { IViewModelBase } from "@kinetix/core";
import { BlotterData, TicketData } from "..";
import { MainToolbarModel } from "./MainToolbarModel";

export interface IMainToolbar extends IViewModelBase<MainToolbarModel> {
  launchTicket(currentTicketType: TicketData): void;
  launchBlotter(currentBlotter: BlotterData): void;
}
