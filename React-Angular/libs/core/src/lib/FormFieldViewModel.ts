import { ViewModelBase } from './ViewModelBase';

// Form field model interface
export interface IFormFieldModel {
  value: any;
  label: string;
  placeholder?: string;
  helpText?: string;
  disabled: boolean;
  readonly: boolean;
  required: boolean;
  hidden: boolean;
  isValid: boolean;
  isDirty: boolean;
  isTouched: boolean;
  errorMessage: string;
  customValidation?: string;
}

// Form field ViewModel interface
export interface IFormFieldViewModel extends IFormFieldModel {
  // Core methods
  setValue(value: any): void;
  setTouched(): void;
  validate(): boolean;
  reset(): void;
  clear(): void;
  focus(): void;
  
  // ViewModelBase methods
  readonly onModelChanged: any;
  batchUpdate(callback: (model: any) => void): void;
  
  // Field metadata
  readonly fieldType: string;
  readonly name: string;
  metaPath?: string;
  
  // Validation
  setCustomValidation(message: string, type?: 'error' | 'warning' | 'info'): void;
  clearCustomValidation(): void;
}

// Base FormField ViewModel implementation
export abstract class FormFieldViewModelBase<TModel extends IFormFieldModel = IFormFieldModel> 
  extends ViewModelBase<TModel> 
  implements IFormFieldViewModel {
  
  public readonly fieldType: string;
  public readonly name: string;
  public metaPath?: string;

  constructor(fieldType: string, name: string) {
    super();
    this.fieldType = fieldType;
    this.name = name;
  }

  protected createModel(): TModel {
    return {
      value: '',
      label: '',
      placeholder: '',
      helpText: '',
      disabled: false,
      readonly: false,
      required: false,
      hidden: false,
      isValid: true,
      isDirty: false,
      isTouched: false,
      errorMessage: '',
      customValidation: undefined
    } as TModel;
  }

  // IFormFieldModel implementation
  get value(): any { return this.model.value; }
  get label(): string { return this.model.label; }
  get placeholder(): string | undefined { return this.model.placeholder; }
  get helpText(): string | undefined { return this.model.helpText; }
  get disabled(): boolean { return this.model.disabled; }
  get readonly(): boolean { return this.model.readonly; }
  get required(): boolean { return this.model.required; }
  get hidden(): boolean { return this.model.hidden; }
  get isValid(): boolean { return this.model.isValid; }
  get isDirty(): boolean { return this.model.isDirty; }
  get isTouched(): boolean { return this.model.isTouched; }
  get errorMessage(): string { return this.model.errorMessage; }
  get customValidation(): string | undefined { return this.model.customValidation; }

  public setValue(value: any): void {
    if (this.model.value !== value) {
      this.batchUpdate(model => {
        model.value = value;
        model.isDirty = true;
        model.isValid = this.validateValue(value);
        if (!model.isValid) {
          model.errorMessage = this.getValidationMessage(value);
        } else {
          model.errorMessage = '';
        }
      });
    }
  }

  public setTouched(): void {
    if (!this.model.isTouched) {
      this.batchUpdate(model => {
        model.isTouched = true;
        model.isValid = this.validateValue(model.value);
        if (!model.isValid) {
          model.errorMessage = this.getValidationMessage(model.value);
        } else {
          model.errorMessage = '';
        }
      });
    }
  }

  public validate(): boolean {
    const isValid = this.validateValue(this.model.value);
    this.batchUpdate(model => {
      model.isValid = isValid;
      model.isTouched = true;
      if (!isValid) {
        model.errorMessage = this.getValidationMessage(model.value);
      } else {
        model.errorMessage = '';
      }
    });
    return isValid;
  }

  public clear(): void {
    this.setValue('');
  }

  public reset(): void {
    this.batchUpdate(model => {
      model.value = '';
      model.isDirty = false;
      model.isTouched = false;
      model.isValid = true;
      model.errorMessage = '';
      model.customValidation = undefined;
    });
  }

  public focus(): void {
    // Override in specific implementations to handle focus
  }

  public setCustomValidation(message: string, type: 'error' | 'warning' | 'info' = 'error'): void {
    this.batchUpdate(model => {
      model.customValidation = message;
      model.isValid = type !== 'error';
    });
  }

  public clearCustomValidation(): void {
    this.batchUpdate(model => {
      model.customValidation = undefined;
      model.isValid = this.validateValue(model.value);
    });
  }

  // Abstract methods to be implemented by specific field types
  protected abstract validateValue(value: any): boolean;
  protected abstract getValidationMessage(value: any): string;
}

