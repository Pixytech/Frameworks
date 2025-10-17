import { Observable, Subject } from "rxjs";

// Inspired by Monza's FieldModelBase
export interface IFieldModel {
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
}

export class FieldModel implements IFieldModel {
  private readonly valueChangeSubject: Subject<void> = new Subject<void>();
  readonly onValueChanged: Observable<void>;

  constructor(initialValue: any = '') {
    this.onValueChanged = this.valueChangeSubject.asObservable();
    this._value = initialValue;
  }

  private _value: any;

  get value(): any {
    return this._value;
  }

  set value(data: any) {
    this._value = data;
    this.valueChangeSubject.next();
  }

  validationMessage: string | null = null;
  touched: boolean = false;
  modified: boolean = false;
  visited: boolean = false;
  valid: boolean = true;
  required: boolean = false;
  allowEmpty: boolean = false;
  disabled: boolean = false;
  readonly: boolean = false;
  hidden: boolean = false;
  customValidation: string | null = null;
}

// Inspired by Monza's ViewModelBase
export interface IViewModel {
  readonly isInitialized: boolean;
  notifyModelChanged(force?: boolean): void;
  cleanup(): Promise<void>;
  initialize(): Promise<void>;
  isNotificationsSuspended(): boolean;
  suspendNotifications(): IDisposable;
}

export interface IDisposable {
  dispose(): void;
}

export interface IViewModelBase<TModel> extends IViewModel {
  readonly model: TModel;
  readonly onModelChanged: Observable<TModel>;
  updateModel(callback: (model: TModel) => void): void;
}

// Inspired by Monza's ViewModelBase
export abstract class ViewModelBase<TModel> implements IViewModelBase<TModel> {
  public readonly model: TModel;
  public readonly onModelChanged: Observable<TModel>;
  private readonly stateSubject: Subject<TModel>;

  isInitialized: boolean = false;
  private deferLevel: number = 0;

  constructor() {
    this.stateSubject = new Subject<TModel>();
    this.onModelChanged = this.stateSubject;
    this.model = this.createModel();
  }

  protected abstract createModel(): TModel;

  public updateModel(callback: (model: TModel) => void): void {
    callback(this.model);
    this.notifyModelChanged();
  }

  public notifyModelChanged(force: boolean = false): void {
    if (!this.isNotificationsSuspended() || force) {
      this.stateSubject.next(this.model);
    }
  }

  public async cleanup(): Promise<void> {
    if (this.onCleanup) {
      await this.onCleanup();
    }
  }

  public isNotificationsSuspended(): boolean {
    return this.deferLevel > 0;
  }

  public suspendNotifications(): IDisposable {
    this.deferLevel += 1;
    return new DeferHelper(this);
  }

  public async initialize(): Promise<void> {
    if (this.onInitializeOnce && !this.isInitialized) {
      this.isInitialized = true;
      await this.onInitializeOnce();
    }

    if (this.onInitialize) {
      await this.onInitialize();
    }
  }

  protected async onCleanup?(): Promise<void>;
  protected async onInitialize?(): Promise<void>;
  protected async onInitializeOnce?(): Promise<void>;
}

class DeferHelper implements IDisposable {
  constructor(private viewModel: ViewModelBase<any>) {}
  
  dispose(): void {
    this.viewModel['deferLevel']--;
  }
}

// Inspired by Monza's FormField
export interface IFormField extends IViewModelBase<FieldModel> {
  readonly type: string;
  name: string;
  label: string;
  placeholder?: string;
  focus(): void;
  setValue(value: any): void;
  getSubmitValue(): any;
  setValidators(): void;
  getValidators(): any[];
}

export abstract class FormField extends ViewModelBase<FieldModel> implements IFormField {
  public readonly type: string = "FormField";
  public name: string = '';
  public label: string = '';
  public placeholder?: string;

  constructor() {
    super();
  }

  protected createModel(): FieldModel {
    return new FieldModel();
  }

  public focus(): void {
    // Focus implementation
  }

  public setValue(value: any): void {
    this.updateModel(model => {
      model.value = value;
      model.modified = true;
    });
  }

  public getSubmitValue(): any {
    return this.model.value;
  }

  public setValidators(): void {
    // Validator setup
  }

  public getValidators(): any[] {
    return [];
  }
}

// Inspired by Monza's FormTextField
export class FormTextField extends FormField {
  public override readonly type: string = "FormTextField";
  public maxLength: number = 0;

  protected override createModel(): FieldModel {
    return new FieldModel('');
  }

  public get value(): string {
    return this.model.value;
  }

  public set value(fieldValue: string) {
    this.setValue(fieldValue);
  }

  public override setValidators(): void {
    super.setValidators();
    // Add string length validator if maxLength is set
    if (this.maxLength > 0) {
      // Validator logic here
    }
  }
}

// Factory functions inspired by Monza patterns
export function createTextField(options?: {
  label?: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  disabled?: boolean;
}): FormTextField {
  const field = new FormTextField();
  
  if (options) {
    field.label = options.label || '';
    field.placeholder = options.placeholder;
    field.model.required = options.required || false;
    field.maxLength = options.maxLength || 0;
    field.model.disabled = options.disabled || false;
  }
  
  return field;
}

export function createNameField(): FormTextField {
  return createTextField({
    label: 'Name',
    placeholder: 'Enter your name',
    required: true,
    maxLength: 50
  });
}

export function createEmailField(): FormTextField {
  return createTextField({
    label: 'Email',
    placeholder: 'Enter your email',
    required: true,
    maxLength: 100
  });
}

export function createPasswordField(): FormTextField {
  return createTextField({
    label: 'Password',
    placeholder: 'Enter your password',
    required: true,
    maxLength: 20
  });
}

// Helper functions
export function isFormValid(...fields: FormField[]): boolean {
  return fields.every(field => field.model.valid && field.model.touched);
}

export function resetForm(...fields: FormField[]): void {
  fields.forEach(field => {
    field.updateModel(model => {
      model.value = '';
      model.modified = false;
      model.touched = false;
      model.valid = true;
      model.validationMessage = null;
    });
  });
}

export function touchAllFields(...fields: FormField[]): void {
  fields.forEach(field => {
    field.updateModel(model => {
      model.touched = true;
    });
  });
}

