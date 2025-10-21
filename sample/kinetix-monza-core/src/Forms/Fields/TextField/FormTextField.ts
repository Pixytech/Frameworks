import { FieldModel } from "../FieldModel";
import { FormField } from "../FormField";
import { StringLengthValidator } from "../Validators/StringLengthValidator";

export class FormTextField extends FormField<FieldModel<string>> {
  public readonly type: string = "FormTextField";
  public showTooltip: boolean = true;
  public maxLength: number = 0;

  protected createModel(): FieldModel<string> {
    return new FieldModel<string>("");
  }

  public get value(): string {
    return this.model.value;
  }

  public set value(fieldValue: string) {
    this.setValue(fieldValue);
  }

  setMetaData(fieldMeta: any): void {
    super.setMetaData(fieldMeta);
    if (fieldMeta.maxLength) {
      this.maxLength = fieldMeta.maxLength;
    }
  }

  setValidators(): void {
    super.setValidators();
    this.validators.push(new StringLengthValidator());
  }
  getSubmitValue() {
    return this.model.value;
  }
}
