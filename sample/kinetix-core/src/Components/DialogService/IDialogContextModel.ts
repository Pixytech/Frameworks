import { IViewModel } from "../../Mvvm/IViewModel";
import { IDialogContext } from "./IDialogContext";

export interface IDialogContextModel extends IDialogContext {
  content?: IViewModel;
}
