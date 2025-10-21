import { IViewModel, ViewModelBase } from "@kinetix/core";
import { ITicketTitleBar } from "./ITicketTitleBar";
import { TicketTitleBarModel } from "./TicketTitleBarModel";


export class TicketTitleBar extends ViewModelBase<TicketTitleBarModel> implements ITicketTitleBar {
    protected createModel(): TicketTitleBarModel {
        return new TicketTitleBarModel();
    }
    systemCommands: IViewModel[]=[];

}
