import { IFieldValidator } from "./IFieldValidator";
import { IFormField } from "./IFormField";


export abstract class FieldValidator<FieldContext extends IFormField> implements IFieldValidator{
    abstract validate(value: any, context: FieldContext): string | undefined;

}

