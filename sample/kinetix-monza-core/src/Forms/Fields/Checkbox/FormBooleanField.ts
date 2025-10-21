import { FormField } from "../FormField";
import { FieldModel } from "../FieldModel";
import { UpdateSourceTrigger } from "../UpdateSourceTrigger";
import { FormBooleanVariation } from "./FormBoolean";

export class FormBooleanField extends FormField<FieldModel<boolean>> {
  public readonly type: string = "FormBooleanField";
  variation: FormBooleanVariation;
  protected createModel(): FieldModel<boolean> {
    return new FieldModel<boolean>(false);
  }

  protected async onInitializeOnce(): Promise<void> {
    this.updateSourceTrigger = UpdateSourceTrigger.PropertyChanged;
  }
  public get value(): boolean {
    return this.model.value;
  }

  public set value(fieldValue: boolean) {
    super.setValue(fieldValue);
  }
}
