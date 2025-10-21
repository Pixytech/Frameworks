import { FormModel } from "../../FormModel";
import { IFormViewModel } from "../../IFormViewModel";
import { FieldModel } from "../FieldModel";
import { FormField } from "../FormField";

export class FormLabelField<TData> extends FormField<FieldModel<TData>> {
  public readonly type: string = "FormLabelField";
  public showTooltip: boolean = true;
  public maxLength: number = 0;
  initialData: TData;
  public valueProvider:()=>TData = ()=>{ return this.model.value;}

  constructor(owner?: IFormViewModel<FormModel>, initialData?: TData) {
    super(owner);
    if (initialData) {
      this.updateModel((m) => (m.value = initialData));
    }
  }

  protected createModel(): FieldModel<TData> {
    return new FieldModel<TData>(this.initialData);
  }

  public get value(): TData {
    return this.valueProvider();
  }

  public set value(fieldValue: TData) {
    this.setValue(fieldValue);
  }

  public setValue(fieldValue: TData) {
    super.setValue(fieldValue);
  }

  setMetaData(fieldMeta: any): void {
    super.setMetaData(fieldMeta);
    if (fieldMeta.maxLength) {
      this.maxLength = fieldMeta.maxLength;
    }
  }
}
