import { IFieldModelBase } from "../FieldModelBase";
import { GridModel } from "../../../Data";
import { State } from "@progress/kendo-data-query";
import { Observable, Subject } from "rxjs";

export class DataGridModel extends GridModel implements IFieldModelBase {
  protected _state: State = { skip: 0, sort: [], group: [] };
    private readonly valueChangeSubject: Subject<void> = new Subject<void>();
    readonly onValueChanged: Observable<void>;
  
  isLoading: boolean = false;
  constructor(initialValue: any[] = []) {
    super();
    this.onValueChanged = this.valueChangeSubject.asObservable();
    this.items = initialValue;
  }
  

  get value(): any[] {
    return this.items;
  }

  set value(data: any[]) {
    this.items = data;
    this.valueChangeSubject.next();
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
  tags: {
    [x: string]: any;
  } = {};
}
