
import { IViewModel } from "../../Mvvm";
import { IDialogComponent } from "./IDialogComponent";
import { IDialogOptions } from "./IDialogOptions";

export interface IDialogService {
  
  getDialog(viewModel: IViewModel):IDialogComponent | undefined;

  Activate(viewModel: IViewModel): boolean;

  ShowDialog(viewModel: IViewModel,dialogOptions?: IDialogOptions): Promise<boolean>;

  Show(viewModel: IViewModel, dialogOptions?: IDialogOptions): void;

  Close(viewModel: IViewModel,result?:boolean): void;
}
