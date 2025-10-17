import { ViewModelBase } from './ViewModelBase';
import { FormTextField, createNameField, createEmailField, createPasswordField } from './MonzaInspiredViewModel';

// User registration form model
export interface IUserRegistrationFormModel {
  isValid: boolean;
  isDirty: boolean;
  isTouched: boolean;
  isSubmitting: boolean;
  isBusy: boolean;
  busyText?: string;
  errorMessage?: string;
  customValidation?: string;
  allowSubmit: boolean;
}

// User registration form ViewModel using existing architecture
export class UserRegistrationFormViewModel extends ViewModelBase<IUserRegistrationFormModel> {
  
  // Form fields using existing FormTextField architecture
  public readonly nameField: FormTextField;
  public readonly emailField: FormTextField;
  public readonly passwordField: FormTextField;
  public readonly confirmPasswordField: FormTextField;

  constructor() {
    super();
    
    // Initialize form fields using existing factory functions
    this.nameField = createNameField();
    this.nameField.name = 'name';
    
    this.emailField = createEmailField();
    this.emailField.name = 'email';
    
    this.passwordField = createPasswordField();
    this.passwordField.name = 'password';
    
    this.confirmPasswordField = createPasswordField();
    this.confirmPasswordField.name = 'confirmPassword';
    this.confirmPasswordField.label = 'Confirm Password';
    this.confirmPasswordField.placeholder = 'Confirm your password';

    // Set up field change listeners for cross-field validation
    this.setupFieldListeners();
  }

  protected createModel(): IUserRegistrationFormModel {
    return {
      isValid: true,
      isDirty: false,
      isTouched: false,
      isSubmitting: false,
      isBusy: false,
      busyText: undefined,
      errorMessage: undefined,
      customValidation: undefined,
      allowSubmit: true
    };
  }

  private setupFieldListeners(): void {
    // Listen for password field changes to validate confirm password
    this.passwordField.onModelChanged.subscribe(() => {
      if (this.confirmPasswordField.model.touched) {
        this.validateConfirmPassword();
      }
    });

    // Listen for confirm password field changes
    this.confirmPasswordField.onModelChanged.subscribe(() => {
      this.validateConfirmPassword();
    });
  }

  private validateConfirmPassword(): void {
    const password = this.passwordField.model.value;
    const confirmPassword = this.confirmPasswordField.model.value;

    if (confirmPassword && password !== confirmPassword) {
      this.confirmPasswordField.updateModel((model: any) => {
        model.customValidation = 'Passwords do not match';
        model.valid = false;
      });
    } else {
      this.confirmPasswordField.updateModel((model: any) => {
        model.customValidation = null;
        model.valid = true;
      });
    }
  }

  // Form validation
  public validate(): boolean {
    const fields = [this.nameField, this.emailField, this.passwordField, this.confirmPasswordField];
    let isValid = true;
    
    fields.forEach(field => {
      if (field.model.required && (!field.model.value || field.model.value.trim().length === 0)) {
        field.updateModel((model: any) => {
          model.valid = false;
          model.validationMessage = `${field.label} is required`;
        });
        isValid = false;
      } else if (field.model.value && !field.model.valid) {
        isValid = false;
      }
    });

    this.batchUpdate((model: any) => {
      model.isValid = isValid;
      model.isTouched = true;
    });

    return isValid;
  }

  // Form submission
  public async submit(): Promise<void> {
    if (!this.validate()) {
      return;
    }

    this.batchUpdate((model: any) => {
      model.isSubmitting = true;
      model.busyText = 'Creating account...';
      model.errorMessage = undefined;
      model.customValidation = undefined;
    });

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real application, you would make an API call here
      console.log('User registration data:', {
        name: this.nameField.model.value,
        email: this.emailField.model.value,
        password: this.passwordField.model.value
      });

      // Simulate success
      this.batchUpdate((model: any) => {
        model.customValidation = 'Account created successfully!';
        model.isSubmitting = false;
        model.busyText = undefined;
        model.isDirty = false;
      });
    } catch (error) {
      this.batchUpdate((model: any) => {
        model.isSubmitting = false;
        model.busyText = undefined;
        model.errorMessage = error instanceof Error ? error.message : 'An error occurred while creating your account';
      });
    }
  }

  // Form reset
  public reset(): void {
    const fields = [this.nameField, this.emailField, this.passwordField, this.confirmPasswordField];
    
    fields.forEach(field => {
      field.updateModel((model: any) => {
        model.value = '';
        model.modified = false;
        model.touched = false;
        model.valid = true;
        model.validationMessage = null;
        model.customValidation = null;
      });
    });

    this.batchUpdate((model: any) => {
      model.isDirty = false;
      model.isTouched = false;
      model.isValid = true;
      model.errorMessage = undefined;
      model.customValidation = undefined;
    });
  }

  // Helper methods
  public isFormValid(): boolean {
    const fields = [this.nameField, this.emailField, this.passwordField, this.confirmPasswordField];
    return fields.every(field => field.model.valid && field.model.touched);
  }

  public touchAllFields(): void {
    const fields = [this.nameField, this.emailField, this.passwordField, this.confirmPasswordField];
    fields.forEach(field => {
      field.updateModel((model: any) => {
        model.touched = true;
      });
    });
  }

  public getFormData(): { [key: string]: any } {
    return {
      name: this.nameField.model.value,
      email: this.emailField.model.value,
      password: this.passwordField.model.value,
      confirmPassword: this.confirmPasswordField.model.value
    };
  }
}