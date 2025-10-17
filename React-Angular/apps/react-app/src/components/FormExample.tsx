import React, { useState, useCallback } from 'react';
import { FormFieldTextBoxViewModel, createFormTextBox } from '@mlp/core';
import { FormTextBox, useFormTextBox } from '@mlp/react';
import { Button, Card, Space, Typography, Divider } from 'antd';

const { Title, Text, Paragraph } = Typography;

export const FormExample: React.FC = () => {
  // Using the hook approach
  const { FormTextBox: HookFormTextBox, viewModel: hookViewModel } = useFormTextBox({
    label: 'Hook-based Field',
    placeholder: 'This field uses the useFormTextBox hook',
    required: true,
    helpText: 'This demonstrates the hook-based approach'
  });

  // Using direct ViewModel creation
  const [nameViewModel] = useState(() => createFormTextBox({
    label: 'Full Name',
    placeholder: 'Enter your full name',
    required: true,
    minLength: 2,
    maxLength: 50,
    helpText: 'Enter your first and last name'
  }));

  const [emailViewModel] = useState(() => createFormTextBox({
    label: 'Email Address',
    placeholder: 'Enter your email',
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    helpText: 'Enter a valid email address'
  }));

  const [passwordViewModel] = useState(() => createFormTextBox({
    label: 'Password',
    placeholder: 'Enter your password',
    required: true,
    minLength: 8,
    helpText: 'Password must be at least 8 characters long'
  }));

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    hookField: ''
  });

  // Check if form is valid
  const isFormValid = useCallback(() => {
    return nameViewModel.isValid && 
           emailViewModel.isValid && 
           passwordViewModel.isValid &&
           nameViewModel.isTouched &&
           emailViewModel.isTouched &&
           passwordViewModel.isTouched;
  }, [nameViewModel, emailViewModel, passwordViewModel]);

  // Handle form submission
  const handleSubmit = useCallback(() => {
    if (isFormValid()) {
      const data = {
        name: nameViewModel.value,
        email: emailViewModel.value,
        password: passwordViewModel.value,
        hookField: hookViewModel.value
      };
      
      console.log('Form submitted:', data);
      setFormData(data);
      alert('Form submitted successfully! Check console for data.');
    } else {
      // Mark all fields as touched to show validation errors
      nameViewModel.setTouched();
      emailViewModel.setTouched();
      passwordViewModel.setTouched();
      hookViewModel.setTouched();
    }
  }, [isFormValid, nameViewModel, emailViewModel, passwordViewModel, hookViewModel]);

  // Handle form reset
  const handleReset = useCallback(() => {
    nameViewModel.reset();
    emailViewModel.reset();
    passwordViewModel.reset();
    hookViewModel.reset();
    setFormData({ name: '', email: '', password: '', hookField: '' });
  }, [nameViewModel, emailViewModel, passwordViewModel, hookViewModel]);

  return (
    <div style={{ maxWidth: 800, margin: '20px auto', padding: '20px' }}>
      <Title level={2}>MVVM Form Example - React</Title>
      <Paragraph>
        This example demonstrates the MVVM pattern using framework-agnostic ViewModels 
        with React-specific components that wrap Ant Design components.
      </Paragraph>

      <Card title="Using ViewModel with FormTextBox Component" style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* Name Field */}
          <FormTextBox
            dataContext={nameViewModel}
            size="middle"
            onValueChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
          />
          
          {/* Email Field */}
          <FormTextBox
            dataContext={emailViewModel}
            size="middle"
            onValueChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
          />
          
          {/* Password Field */}
          <FormTextBox
            dataContext={passwordViewModel}
            size="middle"
            onValueChange={(value) => setFormData(prev => ({ ...prev, password: value }))}
          />
          
          {/* Hook-based Field */}
          <HookFormTextBox
            size="middle"
            onValueChange={(value) => setFormData(prev => ({ ...prev, hookField: value }))}
          />
          
          {/* Form Actions */}
          <Space>
            <Button 
              type="primary"
              disabled={!isFormValid()} 
              onClick={handleSubmit}
            >
              Submit
            </Button>
            <Button 
              onClick={handleReset}
            >
              Reset
            </Button>
          </Space>
        </Space>
      </Card>

      <Card title="Form State Display">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Name:</Text> <Text>{formData.name || 'Not set'}</Text>
          </div>
          <div>
            <Text strong>Email:</Text> <Text>{formData.email || 'Not set'}</Text>
          </div>
          <div>
            <Text strong>Password:</Text> <Text>{formData.password ? '••••••••' : 'Not set'}</Text>
          </div>
          <div>
            <Text strong>Hook Field:</Text> <Text>{formData.hookField || 'Not set'}</Text>
          </div>
          <Divider />
          <div>
            <Text strong>Form Valid:</Text> <Text type={isFormValid() ? 'success' : 'danger'}>
              {isFormValid() ? 'Yes' : 'No'}
            </Text>
          </div>
          <div>
            <Text strong>Name Valid:</Text> <Text type={nameViewModel.isValid ? 'success' : 'danger'}>
              {nameViewModel.isValid ? 'Yes' : 'No'}
            </Text>
            {!nameViewModel.isValid && nameViewModel.isTouched && (
              <Text type="danger" style={{ display: 'block', marginTop: 4 }}>
                {nameViewModel.errorMessage}
              </Text>
            )}
          </div>
          <div>
            <Text strong>Email Valid:</Text> <Text type={emailViewModel.isValid ? 'success' : 'danger'}>
              {emailViewModel.isValid ? 'Yes' : 'No'}
            </Text>
            {!emailViewModel.isValid && emailViewModel.isTouched && (
              <Text type="danger" style={{ display: 'block', marginTop: 4 }}>
                {emailViewModel.errorMessage}
              </Text>
            )}
          </div>
          <div>
            <Text strong>Password Valid:</Text> <Text type={passwordViewModel.isValid ? 'success' : 'danger'}>
              {passwordViewModel.isValid ? 'Yes' : 'No'}
            </Text>
            {!passwordViewModel.isValid && passwordViewModel.isTouched && (
              <Text type="danger" style={{ display: 'block', marginTop: 4 }}>
                {passwordViewModel.errorMessage}
              </Text>
            )}
          </div>
        </Space>
      </Card>

      <Card title="MVVM Architecture Benefits" style={{ marginTop: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Title level={4}>✅ Framework-Agnostic ViewModels</Title>
            <Text>
              The same ViewModel logic works across React, Angular, and other frameworks. 
              Business logic is separated from UI concerns.
            </Text>
          </div>
          <div>
            <Title level={4}>✅ Consistent Validation</Title>
            <Text>
              Validation rules are defined once in the ViewModel and work consistently 
              across all framework implementations.
            </Text>
          </div>
          <div>
            <Title level={4}>✅ Reactive State Management</Title>
            <Text>
              ViewModels provide reactive state management with automatic change detection 
              and notification to the UI layer.
            </Text>
          </div>
          <div>
            <Title level={4}>✅ Component Registry</Title>
            <Text>
              Components are automatically registered and can be resolved dynamically 
              based on ViewModel types and target framework.
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  );
};

