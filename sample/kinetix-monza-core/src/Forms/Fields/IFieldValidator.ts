import { IFormField } from "./IFormField";

export interface IFieldValidator{
    validate(value:any,context:IFormField):string | undefined
}