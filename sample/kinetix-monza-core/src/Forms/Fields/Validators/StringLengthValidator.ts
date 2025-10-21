import { FieldValidator } from "../FieldValidator";
import { FormTextField } from "../TextField/FormTextField";
import { ValidationType } from "../ValidationType";

export class StringLengthValidator extends FieldValidator<FormTextField> {
    validate(value: any, context: FormTextField): string | undefined {
        if (context.maxLength > 0 && value) {
            if (`${value}`.length > context.maxLength) {
                return `${ValidationType.Error}${context.label} length should be less than ${context.maxLength}.`;
            }
        }
        return undefined;
    }
}