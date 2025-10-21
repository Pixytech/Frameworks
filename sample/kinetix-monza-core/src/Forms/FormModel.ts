import { KeyValue } from "@progress/kendo-react-form";

export abstract class FormModel {
  errors: KeyValue<string> = {};
  valid: boolean = false;
  touched: boolean = false;
  visited: boolean = false;
  modified: boolean = false;
  submitted: boolean = false;
  allowSubmit: boolean = false;
  readonly: boolean = false;
  disabled: boolean = false;
  submitting: boolean = false;
  reloading: boolean = false;
  busyText: string | undefined;
  customValidation: string | null;
  formKey: number = 1;
}

export class FormPartModel extends FormModel {}
