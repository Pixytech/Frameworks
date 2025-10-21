import { DialogContext, IDialogComponent, IDialogContext } from "@kinetix/core";


export class TicketHost extends DialogContext {
  private ticketDialog: IDialogComponent | undefined;
  OnDialogCreated(ticketDialog: IDialogComponent):void {
    this.ticketDialog=ticketDialog;
  }

  notifyDialogChanged():void{
    if(this.ticketDialog){
      this.ticketDialog.notifyModelChanged();
    }
  }

  updateDialog(callback: (model: IDialogContext) => void): void{
    if(this.ticketDialog){
      this.ticketDialog.updateModel(callback);
    }
  }
}
