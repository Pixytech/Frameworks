import { Observable, Subject } from "rxjs";

export interface IFieldModelBase {
  readonly onValueChanged: Observable<void>;
  value: any;
  validationMessage: string | null;
  touched: boolean;
  modified: boolean;
  visited: boolean;
  valid: boolean;

  required: boolean;
  allowEmpty: boolean;
  disabled: boolean;
  readonly: boolean;
  hidden: boolean;
  customValidation: string | null;
  tags: {
    [x: string]: any;
  };
}

export class FieldModelBase implements IFieldModelBase {
  private readonly valueChangeSubject: Subject<void> = new Subject<void>();
  readonly onValueChanged: Observable<void>;

  constructor(){
    this.onValueChanged = this.valueChangeSubject.asObservable();
  }

  private _value: any;

  tags: {
    [x: string]: any;
  } = {};

  get value(): any {
    return this._value;
  }

  set value(data: any) {
    this._value = data;
    this.valueChangeSubject.next(this._value);
  }

  /**
   * Represents the error message that is returned by the validator.
   * The Field is considered valid if the `validationMessage` field is empty.
   */
  validationMessage: string | null;
  /**
   * Indicates if the field is touched.
   * The touched state is set to `true` when the `onBlur` callback is called.
   */
  touched: boolean;
  /**
   * Indicates if the field is modified.
   * The modified state is set to `true` when the `onChange` callback for the current field is called for first time.
   */
  modified: boolean;
  /**
   * Indicates if the field is visited.
   * The visited state is set to `true` when the `onFocus` callback is called.
   */
  visited: boolean;
  /**
   * A calculated property based on whether `validationMessage` is present and the `touched` state is set to `true`.
   */
  valid: boolean;

  required: boolean = false;
  allowEmpty: boolean = false;
  disabled: boolean = false;
  readonly: boolean = false;
  hidden: boolean = false;
  customValidation: string | null;
}
