import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormTextField, createNameField, createEmailField, createPasswordField } from '@mlp/core';
import { FormTextBoxComponent, ViewModelDirective } from '@mlp/angular';

@Component({
  selector: 'app-form-example',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FormTextBoxComponent,
    ViewModelDirective
  ],
  template: `
    <div class="form-example">
      <h2>MVVM Form Example - Angular</h2>
      
      <div class="form-section">
        <h3>Using ViewModel with FormTextBox Component</h3>
        
        <!-- Name Field -->
        <mlp-form-text-box 
          [dataContext]="nameFieldViewModel"
          size="middle">
        </mlp-form-text-box>
        
        <!-- Email Field -->
        <mlp-form-text-box 
          [dataContext]="emailFieldViewModel"
          size="middle">
        </mlp-form-text-box>
        
        <!-- Password Field -->
        <mlp-form-text-box 
          [dataContext]="passwordFieldViewModel"
          size="middle">
        </mlp-form-text-box>
        
        <!-- Form Actions -->
        <div class="form-actions">
          <button 
            [disabled]="!isFormValid()" 
            (click)="submitForm()"
            class="submit-button">
            Submit
          </button>
          <button 
            (click)="resetForm()"
            class="reset-button">
            Reset
          </button>
        </div>
        
        <!-- Form State Display -->
        <div class="form-state">
          <h4>Form State:</h4>
          <p><strong>Name:</strong> {{ nameFieldViewModel.value }}</p>
          <p><strong>Email:</strong> {{ emailFieldViewModel.value }}</p>
          <p><strong>Password:</strong> {{ passwordFieldViewModel.value }}</p>
          <p><strong>Form Valid:</strong> {{ isFormValid() }}</p>
        </div>
      </div>
      
      <div class="form-section">
        <h3>Using Reactive Forms with ViewModel</h3>
        
        <form [formGroup]="reactiveForm" (ngSubmit)="onReactiveFormSubmit()" ngNoForm>
          <mlp-form-text-box 
            [dataContext]="reactiveNameViewModel"
            size="middle">
          </mlp-form-text-box>
          
          <mlp-form-text-box 
            [dataContext]="reactiveEmailViewModel"
            size="middle">
          </mlp-form-text-box>
          
          <div class="form-actions">
            <button 
              type="submit"
              [disabled]="!reactiveForm.valid"
              class="submit-button">
              Submit Reactive Form
            </button>
            <button 
              type="button"
              (click)="resetReactiveForm()"
              class="reset-button">
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .form-example {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
      font-family: Arial, sans-serif;
    }
    
    .form-section {
      margin-bottom: 40px;
      padding: 20px;
      border: 1px solid #d9d9d9;
      border-radius: 6px;
      background-color: #fafafa;
    }
    
    .form-section h3 {
      margin-top: 0;
      color: #1890ff;
    }
    
    .form-actions {
      margin-top: 20px;
      display: flex;
      gap: 10px;
    }
    
    .submit-button {
      background-color: #1890ff;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .submit-button:disabled {
      background-color: #d9d9d9;
      cursor: not-allowed;
    }
    
    .reset-button {
      background-color: #f5f5f5;
      color: #666;
      border: 1px solid #d9d9d9;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .form-state {
      margin-top: 20px;
      padding: 15px;
      background-color: #f0f0f0;
      border-radius: 4px;
      font-size: 14px;
    }
    
    .form-state h4 {
      margin-top: 0;
      color: #333;
    }
    
    .form-state p {
      margin: 5px 0;
    }
  `]
})
export class FormExampleComponent implements OnInit {
  // ViewModels for the form fields
  nameFieldViewModel!: FormTextField;
  emailFieldViewModel!: FormTextField;
  passwordFieldViewModel!: FormTextField;
  
  // ViewModels for reactive form
  reactiveNameViewModel!: FormTextField;
  reactiveEmailViewModel!: FormTextField;
  
  // Reactive form
  reactiveForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeViewModels();
    this.initializeReactiveForm();
  }

  private initializeViewModels(): void {
    // Initialize name field
    this.nameFieldViewModel = createNameField();
    this.nameFieldViewModel.label = 'Full Name';
    this.nameFieldViewModel.placeholder = 'Enter your full name';
    this.nameFieldViewModel.model.required = true;

    // Initialize email field
    this.emailFieldViewModel = createEmailField();
    this.emailFieldViewModel.label = 'Email Address';
    this.emailFieldViewModel.placeholder = 'Enter your email';
    this.emailFieldViewModel.model.required = true;

    // Initialize password field
    this.passwordFieldViewModel = createPasswordField();
    this.passwordFieldViewModel.label = 'Password';
    this.passwordFieldViewModel.placeholder = 'Enter your password';
    this.passwordFieldViewModel.model.required = true;
  }

  private initializeReactiveForm(): void {
    // Initialize reactive form ViewModels
    this.reactiveNameViewModel = createNameField();
    this.reactiveNameViewModel.label = 'Reactive Name';
    this.reactiveNameViewModel.placeholder = 'Enter your name';
    this.reactiveNameViewModel.model.required = true;

    this.reactiveEmailViewModel = createEmailField();
    this.reactiveEmailViewModel.label = 'Reactive Email';
    this.reactiveEmailViewModel.placeholder = 'Enter your email';
    this.reactiveEmailViewModel.model.required = true;

    // Create reactive form
    this.reactiveForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]]
    });

    // Sync ViewModels with reactive form
    this.syncViewModelsWithReactiveForm();
  }

  private syncViewModelsWithReactiveForm(): void {
    // Sync name field
    this.reactiveForm.get('name')?.valueChanges.subscribe(value => {
      this.reactiveNameViewModel.setValue(value || '');
    });

    this.reactiveNameViewModel.onModelChanged.subscribe(() => {
      const currentValue = this.reactiveForm.get('name')?.value;
      if (currentValue !== this.reactiveNameViewModel.value) {
        this.reactiveForm.patchValue({ name: this.reactiveNameViewModel.value });
      }
    });

    // Sync email field
    this.reactiveForm.get('email')?.valueChanges.subscribe(value => {
      this.reactiveEmailViewModel.setValue(value || '');
    });

    this.reactiveEmailViewModel.onModelChanged.subscribe(() => {
      const currentValue = this.reactiveForm.get('email')?.value;
      if (currentValue !== this.reactiveEmailViewModel.value) {
        this.reactiveForm.patchValue({ email: this.reactiveEmailViewModel.value });
      }
    });
  }

  isFormValid(): boolean {
    return this.nameFieldViewModel.model.valid && 
           this.emailFieldViewModel.model.valid && 
           this.passwordFieldViewModel.model.valid &&
           this.nameFieldViewModel.model.touched &&
           this.emailFieldViewModel.model.touched &&
           this.passwordFieldViewModel.model.touched;
  }

  submitForm(): void {
    if (this.isFormValid()) {
      const formData = {
        name: this.nameFieldViewModel.value,
        email: this.emailFieldViewModel.value,
        password: this.passwordFieldViewModel.value
      };
      
      console.log('Form submitted:', formData);
      alert('Form submitted successfully! Check console for data.');
    } else {
      // Mark all fields as touched to show validation errors
      this.nameFieldViewModel.updateModel((model: any) => { model.touched = true; });
      this.emailFieldViewModel.updateModel((model: any) => { model.touched = true; });
      this.passwordFieldViewModel.updateModel((model: any) => { model.touched = true; });
    }
  }

  resetForm(): void {
    this.nameFieldViewModel.setValue('');
    this.emailFieldViewModel.setValue('');
    this.passwordFieldViewModel.setValue('');
  }

  onReactiveFormSubmit(): void {
    if (this.reactiveForm.valid) {
      console.log('Reactive form submitted:', this.reactiveForm.value);
      alert('Reactive form submitted successfully! Check console for data.');
    }
  }

  resetReactiveForm(): void {
    this.reactiveForm.reset();
    this.reactiveNameViewModel.setValue('');
    this.reactiveEmailViewModel.setValue('');
  }
}
