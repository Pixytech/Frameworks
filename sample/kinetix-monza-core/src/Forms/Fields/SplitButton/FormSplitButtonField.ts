import { ICommand } from "@kinetix/core";
import { Observable } from "rxjs";
import { FormModel } from "../../FormModel";
import { IFormViewModel } from "../../IFormViewModel";
import { FieldModel } from "../FieldModel";
import { FormField } from "../FormField";
import { SplitButtonItemProps } from "@progress/kendo-react-buttons";

export interface FormSplitButtonItemProps extends SplitButtonItemProps{
  themeColor?: null | 'base' | 'primary' | 'secondary' | 'tertiary' | 'info' | 'success' | 'warning' | 'error' | 'dark' | 'light' | 'inverse';
  value?:any
}

export class FormSplitButtonModel  extends FieldModel<void>
{
  selectedButton: FormSplitButtonItemProps | undefined;
  buttons: FormSplitButtonItemProps[] = [];
  tooltip?: string;

}

export class FormSplitButtonField extends FormField<FormSplitButtonModel> implements ICommand
{
  public readonly type: string= "FormSplitButtonField";
  private delegateCommand:ICommand;
  
  constructor(delegateCommand:ICommand,owner?:IFormViewModel<FormModel>){
    super(owner);
    this.delegateCommand=delegateCommand;
  }

  protected createModel(): FormSplitButtonModel {
    const model = new FormSplitButtonModel();
    return model;
}

  get onCanExecuteChanged(): Observable<void>{
    return this.delegateCommand.onCanExecuteChanged;
  }
  
  execute(commandParameter?:any): void {
    this.delegateCommand.execute(commandParameter);
  }

  canExecute(commandParameter?:any): boolean {
    return this.delegateCommand.canExecute(commandParameter);
  }

  raiseCanExecuteChanged(): void {
    this.delegateCommand.raiseCanExecuteChanged();
  }
}