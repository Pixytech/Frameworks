
import { IViewModel } from "../../Mvvm/IViewModel";
import { IDialogContext } from "./IDialogContext";
import { IDialogOptions } from "./IDialogOptions";


export interface IDialogModelContext extends IViewModel, IDialogContext {
    IsVisible: boolean;

    ContentViewModel: IViewModel;
    Owner: IViewModel;
    DialogResult?: boolean;
    DialogOptions: IDialogOptions;
    ShowDialog(): boolean;
    Show(): void;

}
