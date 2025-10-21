import { FieldValidator } from "../FieldValidator";
import { FormNumericField } from "../NumericField/FormNumericField";
import { ValidationType } from "../ValidationType";

export class NumericValidator extends FieldValidator<FormNumericField> {
    validate(value: number, context: FormNumericField): string | undefined {
        if (value) {
            if ((context.min || context.min===0) && value < context.min) {
                return `${ValidationType.Error}${context.label} Must be greater than ${context.min}.`;
            }
            if ((context.max || context.max===0)  && value > context.max) {
                return `${ValidationType.Error}${context.label} Must be less than ${context.max}.`;
            }
        }
        return undefined;
    }
}