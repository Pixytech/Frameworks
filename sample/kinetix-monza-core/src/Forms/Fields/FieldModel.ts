import { FieldModelBase } from "./FieldModelBase";

export class FieldModel<TValue> extends FieldModelBase {
  constructor(initialValue: TValue) {
    super();
    this.value = initialValue;
  }
  

  get value(): TValue {
    return super.value;
  }

  set value(data: TValue) {
    super.value = data;
  }
}
