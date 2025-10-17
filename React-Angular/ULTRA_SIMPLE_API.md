# ⚡ Ultra Simple MVVM API

## 🎯 **Goal: Minimal Boilerplate Code**

The MVVM framework now provides the simplest possible API for creating forms with validation, state management, and framework-agnostic ViewModels.

## 🚀 **Ultra Simple Usage**

### **Angular - Just 2 Lines!**
```typescript
// Create form fields
nameField = createNameField();
emailField = createEmailField();

// Use in template
<mlp-form-text-box [dataContext]="nameField"></mlp-form-text-box>
<mlp-form-text-box [dataContext]="emailField"></mlp-form-text-box>
```

### **React - Just 2 Lines!**
```typescript
// Create form fields
const [nameField] = useState(() => createNameField());
const [emailField] = useState(() => createEmailField());

// Use in JSX
<FormTextBox dataContext={nameField} />
<FormTextBox dataContext={emailField} />
```

## 🏭 **Factory Functions**

### **Pre-built Field Factories**
```typescript
// Name field with validation
const nameField = createNameField();

// Email field with pattern validation
const emailField = createEmailField();

// Password field with min length
const passwordField = createPasswordField();

// Custom text field
const customField = createTextField('Phone', {
  required: true,
  pattern: /^\+?[\d\s-()]+$/,
  helpText: 'Enter phone number'
});
```

### **Helper Functions**
```typescript
// Check if all fields are valid
const isValid = isFormValid(nameField, emailField, passwordField);

// Reset all fields
resetForm(nameField, emailField, passwordField);

// Mark all fields as touched (show validation errors)
touchAllFields(nameField, emailField, passwordField);
```

## 📋 **Complete Example**

### **Angular Component**
```typescript
import { Component } from '@angular/core';
import { createNameField, createEmailField, isFormValid, resetForm, touchAllFields } from '@mlp/core';
import { FormTextBoxComponent } from '@mlp/angular';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [FormTextBoxComponent],
  template: `
    <mlp-form-text-box [dataContext]="nameField"></mlp-form-text-box>
    <mlp-form-text-box [dataContext]="emailField"></mlp-form-text-box>
    <button (click)="submit()" [disabled]="!isValid()">Submit</button>
    <button (click)="reset()">Reset</button>
  `
})
export class FormComponent {
  nameField = createNameField();
  emailField = createEmailField();

  isValid() { return isFormValid(this.nameField, this.emailField); }
  submit() { 
    if (this.isValid()) {
      alert(`Name: ${this.nameField.value}, Email: ${this.emailField.value}`);
    } else {
      touchAllFields(this.nameField, this.emailField);
    }
  }
  reset() { resetForm(this.nameField, this.emailField); }
}
```

### **React Component**
```typescript
import React, { useState } from 'react';
import { createNameField, createEmailField, isFormValid, resetForm, touchAllFields } from '@mlp/core';
import { FormTextBox } from '@mlp/react';

export const FormComponent = () => {
  const [nameField] = useState(() => createNameField());
  const [emailField] = useState(() => createEmailField());

  const isValid = () => isFormValid(nameField, emailField);

  const handleSubmit = () => {
    if (isValid()) {
      alert(`Name: ${nameField.value}, Email: ${emailField.value}`);
    } else {
      touchAllFields(nameField, emailField);
    }
  };

  const handleReset = () => resetForm(nameField, emailField);

  return (
    <>
      <FormTextBox dataContext={nameField} />
      <FormTextBox dataContext={emailField} />
      <button onClick={handleSubmit} disabled={!isValid()}>Submit</button>
      <button onClick={handleReset}>Reset</button>
    </>
  );
};
```

## ✨ **Features Included**

### **Automatic Validation**
- ✅ Required field validation
- ✅ Min/max length validation
- ✅ Pattern validation (email, phone, etc.)
- ✅ Real-time validation feedback
- ✅ Custom error messages

### **State Management**
- ✅ Track field state (dirty, touched, valid)
- ✅ Automatic change detection
- ✅ Form-level validation
- ✅ Reset functionality

### **Framework Integration**
- ✅ Angular: Uses Ant Design Input with `nz-input` directive
- ✅ React: Uses Ant Design Input component
- ✅ Consistent API across frameworks
- ✅ TypeScript support

## 🎯 **Benefits**

1. **Minimal Code**: Just 2 lines to create a complete form field
2. **Framework Agnostic**: Same ViewModel works in Angular and React
3. **Type Safe**: Full TypeScript support with IntelliSense
4. **Validation Built-in**: No need to write validation logic
5. **Consistent UI**: Ant Design styling across frameworks
6. **State Management**: Automatic dirty/touched/valid tracking

## 🚀 **How to Access**

**Angular App**: http://localhost:4200/mvvm-demo
**React App**: http://localhost:4202/mvvm-demo

Both demos show the ultra-simple API in action with minimal boilerplate code!

