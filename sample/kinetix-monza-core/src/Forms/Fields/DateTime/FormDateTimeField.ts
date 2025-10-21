import { FormField } from "../FormField";
import { FieldModel } from "../FieldModel";
import { Helpers } from "../../../Utils/Helpers";
import { DateValidator } from "../Validators/DateValidator";
import { DataTypes } from "../../../Data";

export class FormDateTimeField extends FormField<FieldModel<Date | undefined>> {
  public readonly type: string = "FormDateTimeField";
  allowTime?: boolean = false;
  minDate: Date | undefined;
  protected createModel(): FieldModel<Date | undefined> {
    return new FieldModel<Date | undefined>(undefined);
  }

  public setValue(value: any): void {
    if (typeof value === "string") {
      let date =
        value && value.includes("UTC")
          ? new Date(value)
          : Helpers.parseDate(value);

      super.setValue(date);
    } else {
      super.setValue(value);
    }
  }

  setValidators(): void {
    super.setValidators();
    this.validators.push(new DateValidator());
  }

  public get value(): Date | undefined {
    return this.model.value;
  }

  public set value(fieldValue: Date | undefined) {
    super.setValue(fieldValue);
  }

  getSubmitValue() {
    switch (this.fieldType) {
      case DataTypes.dateTime:
        return this.model.value
          ? Helpers.formatDateTime(this.model.value)
          : this.model.value;
      case DataTypes.date:
        return this.model.value
          ? Helpers.formatDate(this.model.value)
          : this.model.value;
      default:
        return this.model.value;
    }
  }
}
