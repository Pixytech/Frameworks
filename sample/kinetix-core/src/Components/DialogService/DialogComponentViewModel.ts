import { IDialogContextModel } from "./IDialogContextModel";
import { IDialogComponent } from "./IDialogComponent";
import { IDialogHost } from "./IDialogHost";
import { ViewModelBase } from "../../Mvvm";
import { DialogContext } from "./DialogContext";

export class DialogComponentViewModel
  extends ViewModelBase<IDialogContextModel>
  implements IDialogComponent
{
  dialogHost: IDialogHost;
  constructor(dialogHost: IDialogHost) {
    super();
    this.dialogHost = dialogHost;
  }

  Close(result: boolean = true): void {
    this.dialogHost.Close(this, result);
  }

  Activate(): boolean {
    return this.dialogHost.Activate(this);
  }
  Dialogs: IDialogContextModel[] = [];
  protected createModel(): IDialogContextModel {
    return new DialogContext();
  }
}
