import { FieldValidator } from "../FieldValidator";
import { IFormField } from "../IFormField";

export class CustomValidator extends FieldValidator<IFormField> {
    validate(value: any, context: IFormField): string | undefined {
        if (context.model.customValidation) {
            return context.model.customValidation;
        }
        return undefined;
    }
}
