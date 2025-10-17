import React, { useEffect, useState } from 'react';
import { UserRegistrationFormViewModel } from '@mlp/core';
import './UserRegistration.scss';

interface UserRegistrationProps {
  className?: string;
}

export const UserRegistration: React.FC<UserRegistrationProps> = ({ className }) => {
  const [viewModel] = useState(() => new UserRegistrationFormViewModel());
  const [, forceUpdate] = useState({});

  useEffect(() => {
    // Subscribe to form model changes for reactive updates
    const subscription = viewModel.onModelChanged.subscribe(() => {
      forceUpdate({});
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [viewModel]);

  const handleFieldChange = (field: any, event: React.ChangeEvent<HTMLInputElement>) => {
    field.setValue(event.target.value);
  };

  const handleFieldBlur = (field: any) => {
    field.setTouched();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    viewModel.touchAllFields();
    if (viewModel.isFormValid()) {
      await viewModel.submit();
    }
  };

  const handleReset = () => {
    viewModel.reset();
  };

  return (
    <div className={`registration-container ${className || ''}`}>
      <div className="registration-card">
        <div className="registration-header">
          <h2>User Registration</h2>
          <p>Create your account to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="registration-form">
          {/* Name Field */}
          <div className="form-group">
            <label htmlFor={viewModel.nameField.name} className="form-label">
              {viewModel.nameField.label}
              {viewModel.nameField.required && <span className="required">*</span>}
            </label>
            <input
              id={viewModel.nameField.name}
              type="text"
              className={`form-control ${!viewModel.nameField.isValid && viewModel.nameField.isTouched ? 'is-invalid' : ''}`}
              placeholder={viewModel.nameField.placeholder}
              value={viewModel.nameField.value}
              disabled={viewModel.nameField.disabled}
              readOnly={viewModel.nameField.readonly}
              onChange={(e) => handleFieldChange(viewModel.nameField, e)}
              onBlur={() => handleFieldBlur(viewModel.nameField)}
            />
            {viewModel.nameField.helpText && (
              <div className="form-help">
                {viewModel.nameField.helpText}
              </div>
            )}
            {!viewModel.nameField.isValid && viewModel.nameField.isTouched && (
              <div className="invalid-feedback">
                {viewModel.nameField.errorMessage}
              </div>
            )}
            {viewModel.nameField.customValidation && (
              <div className="custom-validation">
                {viewModel.nameField.customValidation}
              </div>
            )}
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label htmlFor={viewModel.emailField.name} className="form-label">
              {viewModel.emailField.label}
              {viewModel.emailField.required && <span className="required">*</span>}
            </label>
            <input
              id={viewModel.emailField.name}
              type="email"
              className={`form-control ${!viewModel.emailField.isValid && viewModel.emailField.isTouched ? 'is-invalid' : ''}`}
              placeholder={viewModel.emailField.placeholder}
              value={viewModel.emailField.value}
              disabled={viewModel.emailField.disabled}
              readOnly={viewModel.emailField.readonly}
              onChange={(e) => handleFieldChange(viewModel.emailField, e)}
              onBlur={() => handleFieldBlur(viewModel.emailField)}
            />
            {viewModel.emailField.helpText && (
              <div className="form-help">
                {viewModel.emailField.helpText}
              </div>
            )}
            {!viewModel.emailField.isValid && viewModel.emailField.isTouched && (
              <div className="invalid-feedback">
                {viewModel.emailField.errorMessage}
              </div>
            )}
            {viewModel.emailField.customValidation && (
              <div className="custom-validation">
                {viewModel.emailField.customValidation}
              </div>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor={viewModel.passwordField.name} className="form-label">
              {viewModel.passwordField.label}
              {viewModel.passwordField.required && <span className="required">*</span>}
            </label>
            <input
              id={viewModel.passwordField.name}
              type="password"
              className={`form-control ${!viewModel.passwordField.isValid && viewModel.passwordField.isTouched ? 'is-invalid' : ''}`}
              placeholder={viewModel.passwordField.placeholder}
              value={viewModel.passwordField.value}
              disabled={viewModel.passwordField.disabled}
              readOnly={viewModel.passwordField.readonly}
              onChange={(e) => handleFieldChange(viewModel.passwordField, e)}
              onBlur={() => handleFieldBlur(viewModel.passwordField)}
            />
            {viewModel.passwordField.helpText && (
              <div className="form-help">
                {viewModel.passwordField.helpText}
              </div>
            )}
            {!viewModel.passwordField.isValid && viewModel.passwordField.isTouched && (
              <div className="invalid-feedback">
                {viewModel.passwordField.errorMessage}
              </div>
            )}
            {viewModel.passwordField.customValidation && (
              <div className="custom-validation">
                {viewModel.passwordField.customValidation}
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <label htmlFor={viewModel.confirmPasswordField.name} className="form-label">
              {viewModel.confirmPasswordField.label}
              {viewModel.confirmPasswordField.required && <span className="required">*</span>}
            </label>
            <input
              id={viewModel.confirmPasswordField.name}
              type="password"
              className={`form-control ${!viewModel.confirmPasswordField.isValid && viewModel.confirmPasswordField.isTouched ? 'is-invalid' : ''}`}
              placeholder={viewModel.confirmPasswordField.placeholder}
              value={viewModel.confirmPasswordField.value}
              disabled={viewModel.confirmPasswordField.disabled}
              readOnly={viewModel.confirmPasswordField.readonly}
              onChange={(e) => handleFieldChange(viewModel.confirmPasswordField, e)}
              onBlur={() => handleFieldBlur(viewModel.confirmPasswordField)}
            />
            {viewModel.confirmPasswordField.helpText && (
              <div className="form-help">
                {viewModel.confirmPasswordField.helpText}
              </div>
            )}
            {!viewModel.confirmPasswordField.isValid && viewModel.confirmPasswordField.isTouched && (
              <div className="invalid-feedback">
                {viewModel.confirmPasswordField.errorMessage}
              </div>
            )}
            {viewModel.confirmPasswordField.customValidation && (
              <div className="custom-validation">
                {viewModel.confirmPasswordField.customValidation}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!viewModel.allowSubmit || viewModel.isSubmitting}
            >
              {viewModel.isSubmitting && <span className="spinner"></span>}
              {viewModel.isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
            
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleReset}
              disabled={viewModel.isSubmitting}
            >
              Reset
            </button>
          </div>

          {/* Form Status */}
          {viewModel.customValidation && (
            <div className="form-status">
              {viewModel.customValidation}
            </div>
          )}
          
          {viewModel.errorMessage && (
            <div className="form-error">
              {viewModel.errorMessage}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

