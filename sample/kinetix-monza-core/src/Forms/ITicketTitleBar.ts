import { IViewModel, IViewModelBase } from "@kinetix/core";
import { TicketTitleBarModel } from "./TicketTitleBarModel";


export interface ITicketTitleBar extends IViewModelBase<TicketTitleBarModel> {
    readonly systemCommands: IViewModel[];
}
