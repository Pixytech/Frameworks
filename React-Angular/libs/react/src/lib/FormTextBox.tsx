import React, { useCallback, useRef, useEffect } from 'react';
import { Input, Form } from 'antd';
import { SimpleFormFieldTextBoxViewModel, ISimpleFormFieldViewModel } from '@mlp/core';
import { useViewModel } from './UseViewModel';

export interface FormTextBoxProps {
  dataContext: ISimpleFormFieldViewModel;
  size?: 'small' | 'middle' | 'large';
  className?: string;
  style?: React.CSSProperties;
  onValueChange?: (value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
}

export const FormTextBox: React.FC<FormTextBoxProps> = ({
  dataContext,
  size = 'middle',
  className = '',
  style,
  onValueChange,
  onValidationChange
}) => {
  const inputRef = useRef<any>(null);
  
  // Use the ViewModel hook to handle lifecycle and change detection
  const viewModel = useViewModel(dataContext);

  // Handle input change
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    viewModel.setValue(value);
    onValueChange?.(value);
  }, [viewModel, onValueChange]);

  // Handle blur
  const handleBlur = useCallback(() => {
    viewModel.setTouched();
  }, [viewModel]);

  // Handle focus
  const handleFocus = useCallback(() => {
    // Handle focus if needed
  }, []);

  // Notify validation changes
  useEffect(() => {
    onValidationChange?.(viewModel.isValid);
  }, [viewModel.isValid, onValidationChange]);

  return (
    <Form.Item
      label={viewModel.label}
      required={viewModel.required}
      validateStatus={!viewModel.isValid && viewModel.isTouched ? 'error' : ''}
      help={!viewModel.isValid && viewModel.isTouched ? viewModel.errorMessage : viewModel.helpText}
      className={className}
      style={style}
    >
      <Input
        ref={inputRef}
        placeholder={viewModel.placeholder}
        disabled={viewModel.disabled}
        size={size}
        value={viewModel.value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        maxLength={viewModel.maxLength}
        minLength={viewModel.minLength}
        pattern={viewModel.pattern?.source}
      />
    </Form.Item>
  );
};

// Note: createFormTextBox factory function is exported from @mlp/core

// Hook for using FormTextBox with automatic ViewModel creation
export function useFormTextBox(options?: {
  maxLength?: number;
  minLength?: number;
  pattern?: RegExp;
  required?: boolean;
  placeholder?: string;
  label?: string;
  helpText?: string;
}) {
  const viewModel = React.useMemo(() => new SimpleFormFieldTextBoxViewModel(options), []);
  
  const FormTextBoxComponent = React.useCallback((props: Omit<FormTextBoxProps, 'dataContext'>) => (
    <FormTextBox {...props} dataContext={viewModel} />
  ), [viewModel]);

  return {
    FormTextBox: FormTextBoxComponent,
    viewModel
  };
}

// CSS styles (should be imported in your app)
export const formTextBoxStyles = `
  .mlp-form-field {
    margin-bottom: 16px;
  }
  
  .mlp-form-field__label {
    display: block;
    margin-bottom: 4px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.85);
  }
  
  .mlp-form-field__required {
    color: #ff4d4f;
    margin-left: 2px;
  }
  
  .mlp-form-field__input--error {
    border-color: #ff4d4f !important;
  }
  
  .mlp-form-field__help {
    margin-top: 4px;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
  }
  
  .mlp-form-field__error {
    margin-top: 4px;
    font-size: 12px;
    color: #ff4d4f;
  }
  
  .mlp-form-field--error .mlp-form-field__label {
    color: #ff4d4f;
  }
`;
