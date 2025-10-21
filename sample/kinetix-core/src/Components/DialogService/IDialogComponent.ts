import { IViewModelBase } from "../../Mvvm/IViewModel";
import { IDialogContextModel } from "./IDialogContextModel";


export interface IDialogComponent extends IViewModelBase<IDialogContextModel> {
  Activate(): boolean;
  Close(result:boolean): void;
  Closed?:(result:boolean)=>void;
}
