import { FieldValidator } from "../FieldValidator";
import { IFormField } from "../IFormField";

export class RequiredValidator extends FieldValidator<IFormField> {
  validate(value: any, context: IFormField): string | undefined {
    const fieldValue = context.model.value;
    if (context.model.required && !context.model.allowEmpty && !fieldValue) {
      return `Error:${
        typeof context.label == "string" ? context.label : context.name
      } is required.`;
    }
    return undefined;
  }
}
