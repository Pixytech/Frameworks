
import { IViewModel, IViewModelBase } from "../../Mvvm";
import { DialogHostModel } from "./DialogHostModel";
import { IDialogComponent } from "./IDialogComponent";
import { IDialogOptions } from "./IDialogOptions";

export interface IDialogHost extends IViewModelBase<DialogHostModel> {
  Dialogs: IDialogComponent[];
  Create(viewModel: IViewModel, dialogOptions?: IDialogOptions):IDialogComponent;
  Close(dialog:IDialogComponent,result:boolean):void;
  Activate(dialog:IDialogComponent):boolean;
  TryFindWindowForViewModel(viewModel:IViewModel): IDialogComponent | undefined;
}
