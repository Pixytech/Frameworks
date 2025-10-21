import { Helpers } from "../../../Utils/Helpers";
import { FormDateTimeField } from "../DateTime/FormDateTimeField";
import { FieldValidator } from "../FieldValidator";
import { ValidationType } from "../ValidationType";

export class EqualDateValidator extends FieldValidator<FormDateTimeField> {
  baseField: FormDateTimeField;

  constructor(baseField: FormDateTimeField) {
    super();
    this.baseField = baseField;
  }

  validate(value: Date, context: FormDateTimeField): string | undefined {
    var baseValue = this.baseField?.model.value;

    if (baseValue) {
      if (!Helpers.areDatesEqual(value, baseValue)) {
        return `${ValidationType.Error}${context.label} date should match ${this.baseField?.label}`;
      }
    }

    return undefined;
  }
}
