import { IShell, IDialogOptions, ShellModel, IDialogContext } from "@kinetix/core";
import { IFormViewModelBase } from "./Forms";

export interface IComponentShell extends IShell<ComponentShellModel> {
  showContent(content: IFormViewModelBase, dialogOptions?: IDialogOptions): Promise<void>;
  getContent(): IFormViewModelBase;
  windowAction(action: string): void;
}

export class ComponentShellModel extends ShellModel {
  theme: string = "dark-theme";
  hasContent: boolean = false;
  dialogContext: IDialogContext = {};
}
