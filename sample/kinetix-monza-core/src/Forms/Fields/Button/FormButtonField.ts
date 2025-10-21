import { ICommand } from "@kinetix/core";
import { Observable } from "rxjs";
import { FormModel } from "../../FormModel";
import { IFormViewModel } from "../../IFormViewModel";
import { FieldModel } from "../FieldModel";
import { FormField } from "../FormField";

export class FormButtonModel  extends FieldModel<void>
{

}
export class FormButtonField extends FormField<FormButtonModel> implements ICommand
{
  private command:ICommand;
  public readonly type: string= "FormButtonField";
  
  get onCanExecuteChanged(): Observable<void>{
    return this.command.onCanExecuteChanged;
  }

  constructor(command:ICommand,owner?:IFormViewModel<FormModel>){
    super(owner);
    this.command=command;
    
  }

  canExecute(commandParameter?:any): boolean {
    return this.command.canExecute(commandParameter);
  }
  execute(commandParameter?:any): void {
    this.command.execute(commandParameter);
  }
  raiseCanExecuteChanged(): void {
    this.command.raiseCanExecuteChanged();
  }

  protected createModel(): FormButtonModel {
      const model = new FormButtonModel(undefined);
      // model.required = true;
      return model;
  }

}