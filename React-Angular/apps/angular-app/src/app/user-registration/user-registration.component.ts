import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRegistrationFormViewModel } from '@mlp/core';
import { FormAdapter, FormFieldAdapter } from '@mlp/angular';

@Component({
  selector: 'app-user-registration',
  standalone: true,
  imports: [CommonModule, FormAdapter, FormFieldAdapter],
  template: `
    <div class="registration-container">
      <div class="ant-card">
        <div class="ant-card-head">
          <div class="ant-card-head-wrapper">
            <div class="ant-card-head-title">
              <h2>User Registration</h2>
              <p>Create your account to get started</p>
            </div>
          </div>
        </div>
        
        <div class="ant-card-body">
          <form mlpForm [viewModel]="viewModel" (submit)="formAdapter.onSubmit()" class="ant-form ant-form-vertical">
            <!-- Name Field -->
            <div class="ant-form-item" [class.ant-form-item-has-error]="!viewModel.nameField.model.valid && viewModel.nameField.model.touched">
              <label class="ant-form-item-label">
                <span class="ant-form-item-required" *ngIf="viewModel.nameField.model.required">*</span>
                {{ viewModel.nameField.label }}
              </label>
              <div class="ant-form-item-control">
                <div class="ant-form-item-control-input">
                  <div class="ant-form-item-control-input-content">
                    <input
                      type="text"
                      class="ant-input"
                      mlpFormField
                      [field]="viewModel.nameField"
                      [placeholder]="viewModel.nameField.placeholder"
                    />
                  </div>
                </div>
                <div *ngIf="!viewModel.nameField.model.valid && viewModel.nameField.model.touched" class="ant-form-item-explain ant-form-item-explain-error">
                  {{ viewModel.nameField.model.validationMessage }}
                </div>
                <div *ngIf="viewModel.nameField.model.customValidation" class="ant-form-item-explain ant-form-item-explain-success">
                  {{ viewModel.nameField.model.customValidation }}
                </div>
              </div>
            </div>

            <!-- Email Field -->
            <div class="ant-form-item" [class.ant-form-item-has-error]="!viewModel.emailField.model.valid && viewModel.emailField.model.touched">
              <label class="ant-form-item-label">
                <span class="ant-form-item-required" *ngIf="viewModel.emailField.model.required">*</span>
                {{ viewModel.emailField.label }}
              </label>
              <div class="ant-form-item-control">
                <div class="ant-form-item-control-input">
                  <div class="ant-form-item-control-input-content">
                    <input
                      type="email"
                      class="ant-input"
                      mlpFormField
                      [field]="viewModel.emailField"
                      [placeholder]="viewModel.emailField.placeholder"
                    />
                  </div>
                </div>
                <div *ngIf="!viewModel.emailField.model.valid && viewModel.emailField.model.touched" class="ant-form-item-explain ant-form-item-explain-error">
                  {{ viewModel.emailField.model.validationMessage }}
                </div>
                <div *ngIf="viewModel.emailField.model.customValidation" class="ant-form-item-explain ant-form-item-explain-success">
                  {{ viewModel.emailField.model.customValidation }}
                </div>
              </div>
            </div>

            <!-- Password Field -->
            <div class="ant-form-item" [class.ant-form-item-has-error]="!viewModel.passwordField.model.valid && viewModel.passwordField.model.touched">
              <label class="ant-form-item-label">
                <span class="ant-form-item-required" *ngIf="viewModel.passwordField.model.required">*</span>
                {{ viewModel.passwordField.label }}
              </label>
              <div class="ant-form-item-control">
                <div class="ant-form-item-control-input">
                  <div class="ant-form-item-control-input-content">
                    <input
                      type="password"
                      class="ant-input"
                      mlpFormField
                      [field]="viewModel.passwordField"
                      [placeholder]="viewModel.passwordField.placeholder"
                    />
                  </div>
                </div>
                <div *ngIf="!viewModel.passwordField.model.valid && viewModel.passwordField.model.touched" class="ant-form-item-explain ant-form-item-explain-error">
                  {{ viewModel.passwordField.model.validationMessage }}
                </div>
                <div *ngIf="viewModel.passwordField.model.customValidation" class="ant-form-item-explain ant-form-item-explain-success">
                  {{ viewModel.passwordField.model.customValidation }}
                </div>
              </div>
            </div>

            <!-- Confirm Password Field -->
            <div class="ant-form-item" [class.ant-form-item-has-error]="!viewModel.confirmPasswordField.model.valid && viewModel.confirmPasswordField.model.touched">
              <label class="ant-form-item-label">
                <span class="ant-form-item-required" *ngIf="viewModel.confirmPasswordField.model.required">*</span>
                {{ viewModel.confirmPasswordField.label }}
              </label>
              <div class="ant-form-item-control">
                <div class="ant-form-item-control-input">
                  <div class="ant-form-item-control-input-content">
                    <input
                      type="password"
                      class="ant-input"
                      mlpFormField
                      [field]="viewModel.confirmPasswordField"
                      [placeholder]="viewModel.confirmPasswordField.placeholder"
                    />
                  </div>
                </div>
                <div *ngIf="!viewModel.confirmPasswordField.model.valid && viewModel.confirmPasswordField.model.touched" class="ant-form-item-explain ant-form-item-explain-error">
                  {{ viewModel.confirmPasswordField.model.validationMessage }}
                </div>
                <div *ngIf="viewModel.confirmPasswordField.model.customValidation" class="ant-form-item-explain ant-form-item-explain-success">
                  {{ viewModel.confirmPasswordField.model.customValidation }}
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="ant-form-item">
              <div class="ant-form-item-control">
                <div class="ant-form-item-control-input">
                  <div class="ant-form-item-control-input-content">
                    <div class="ant-space ant-space-horizontal">
                      <button
                        type="submit"
                        class="ant-btn ant-btn-primary"
                        [class.ant-btn-loading]="formAdapter.isSubmitting"
                        [disabled]="!formAdapter.allowSubmit || formAdapter.isSubmitting"
                      >
                        {{ formAdapter.isSubmitting ? 'Creating Account...' : 'Create Account' }}
                      </button>
                      
                      <button
                        type="button"
                        class="ant-btn"
                        (click)="formAdapter.onReset()"
                        [disabled]="formAdapter.isSubmitting"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Form Status -->
            <div *ngIf="formAdapter.customValidation" class="ant-alert ant-alert-success">
              {{ formAdapter.customValidation }}
            </div>
            
            <div *ngIf="formAdapter.errorMessage" class="ant-alert ant-alert-error">
              {{ formAdapter.errorMessage }}
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .registration-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .registration-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      padding: 40px;
      width: 100%;
      max-width: 500px;
    }

    .registration-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .registration-header h2 {
      color: #333;
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 600;
    }

    .registration-header p {
      color: #666;
      margin: 0;
      font-size: 16px;
    }

    .registration-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-label {
      font-weight: 500;
      color: #333;
      margin-bottom: 6px;
      font-size: 14px;
    }

    .required {
      color: #e74c3c;
    }

    .form-control {
      padding: 12px 16px;
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      font-size: 16px;
      transition: all 0.2s ease;
      background: #fff;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-control.is-invalid {
      border-color: #e74c3c;
    }

    .form-control:disabled {
      background-color: #f8f9fa;
      color: #6c757d;
      cursor: not-allowed;
    }

    .form-help {
      font-size: 12px;
      color: #6c757d;
      margin-top: 4px;
    }

    .invalid-feedback {
      color: #e74c3c;
      font-size: 12px;
      margin-top: 4px;
    }

    .custom-validation {
      color: #28a745;
      font-size: 12px;
      margin-top: 4px;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 20px;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .btn-primary {
      background: #667eea;
      color: white;
      flex: 1;
    }

    .btn-primary:hover:not(:disabled) {
      background: #5a6fd8;
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #5a6268;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .form-status {
      background: #d4edda;
      color: #155724;
      padding: 12px;
      border-radius: 8px;
      font-size: 14px;
      margin-top: 16px;
    }

    .form-error {
      background: #f8d7da;
      color: #721c24;
      padding: 12px;
      border-radius: 8px;
      font-size: 14px;
      margin-top: 16px;
    }
  `]
})
export class UserRegistrationComponent implements OnInit, OnDestroy {
  public viewModel: UserRegistrationFormViewModel;
  public formAdapter: FormAdapter;
  private subscription: any;

  constructor() {
    this.viewModel = new UserRegistrationFormViewModel();
    this.formAdapter = new FormAdapter();
  }

  ngOnInit(): void {
    // Initialize the form adapter with the view model
    this.formAdapter.viewModel = this.viewModel;
    
    // Subscribe to form model changes for reactive updates
    this.subscription = this.viewModel.onModelChanged.subscribe(() => {
      // Angular change detection will handle the rest
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
