import { IocInjectable } from "@kinetix/core";
import { FormModel, FormPartModel } from "./FormModel";
import { FormViewModel } from "./FormViewModel";
import { IFormPart, IFormViewModel } from "./IFormViewModel";

@IocInjectable()
export abstract class FormPart extends FormViewModel<FormPartModel> implements IFormPart {
  Owner: IFormViewModel<FormModel>;
  public readonly type: string = "FormPart";

  protected createModel(): FormPartModel {
    return new FormPartModel();
  }

  protected async onFormInitialize(): Promise<void> {
    await this.onPartInitialize();
  }

  protected abstract onPartInitialize(): Promise<void>;
}
