import { FormDateTimeField } from "../DateTime/FormDateTimeField";
import { FieldValidator } from "../FieldValidator";
import { ValidationType } from "../ValidationType";

export class DateValidator extends FieldValidator<FormDateTimeField> {
  validate(value: Date, context: FormDateTimeField): string | undefined {
    if (value) {
      if (context.minDate && value < context.minDate) {
        return `${ValidationType.Error}${
          context.label
        } Must be greater than ${context.minDate.toLocaleDateString()} 00:00:00.`;
      }
    }
    return undefined;
  }
}
