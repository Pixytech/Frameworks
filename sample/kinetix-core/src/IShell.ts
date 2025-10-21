import { IViewModel, IViewModelBase } from "./Mvvm/IViewModel";

export interface IShellBase extends IViewModel {
  readonly appName:string;
  readonly themeName:string;
  /*
    Validate of currrent application profile is supported by shell.
    if not shell can return diffrent profile app to bootstrap 
    */
  validateAppProfile(currentProfile: string): string;
}

export class ShellModel {}

export interface IShell<TModel extends ShellModel>
  extends IViewModelBase<TModel>,
    IShellBase {}
