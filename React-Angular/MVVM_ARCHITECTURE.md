# MVVM-Driven Component Library Architecture

## Overview

This document describes the MVVM (Model-View-ViewModel) architecture implemented in the MLP (Multi-Language Platform) framework. The architecture provides framework-agnostic ViewModels that can be used across different UI frameworks (React, Angular, Vue, etc.) while maintaining consistent business logic and state management.

## Architecture Principles

### 1. Framework-Agnostic ViewModels
- **Location**: `@mlp/core`
- **Purpose**: Business logic, validation, state management, and data binding
- **Benefits**: Same ViewModel works across all frameworks

### 2. Framework-Specific Components
- **Angular**: `@mlp/angular` - Components that wrap Angular/Ant Design components
- **React**: `@mlp/react` - Components that wrap React/Ant Design components
- **Purpose**: Handle framework-specific UI concerns and lifecycle management

### 3. Component Registry System
- **Location**: `@mlp/core`
- **Purpose**: Maps ViewModels to framework-specific components
- **Benefits**: Dynamic component resolution and consistent API

## Core Components

### ViewModelBase (`@mlp/core`)
```typescript
export abstract class ViewModelBase<TModel extends object> {
  public model: TModel;
  public readonly onModelChanged: Observable<IPropertyChanged>;
  
  // State management, validation, rules engine
  public batchUpdate(callback: (model: TModel) => void): void;
  public notifyModelChanged(change: IPropertyChanged): void;
  public validate(): boolean;
}
```

### FormFieldTextBoxViewModel (`@mlp/core`)
```typescript
export class FormFieldTextBoxViewModel extends FormFieldViewModelBase {
  // Validation rules, state management, commands
  protected validateValue(value: string): boolean;
  protected getValidationMessage(value: string): string;
  
  // Commands
  public clearCommand: ICommand;
  public validateCommand: ICommand;
}
```

## Framework Integration

### Angular Integration
```typescript
// Component wraps Ant Design Input
@Component({
  selector: 'mlp-form-text-box',
  template: `<input nz-input [value]="dataContext.value" (input)="onInputChange($event)">`
})
export class FormTextBoxComponent implements ControlValueAccessor {
  @Input() dataContext!: IFormFieldViewModel;
  
  // Implements ControlValueAccessor for reactive forms
  writeValue(value: string): void;
  registerOnChange(fn: (value: string) => void): void;
}
```

### React Integration
```typescript
// Component wraps Ant Design Input
export const FormTextBox: React.FC<FormTextBoxProps> = ({ dataContext }) => {
  const viewModel = useViewModel(dataContext);
  
  return (
    <Input
      value={viewModel.value}
      onChange={(e) => viewModel.setValue(e.target.value)}
    />
  );
};
```

## Usage Examples

### Angular Usage
```typescript
// Create ViewModel
const nameField = createFormTextBox({
  label: 'Full Name',
  required: true,
  minLength: 2
});

// Use in template
<mlp-form-text-box [dataContext]="nameField"></mlp-form-text-box>
```

### React Usage
```typescript
// Using hook approach
const { FormTextBox, viewModel } = useFormTextBox({
  label: 'Full Name',
  required: true,
  minLength: 2
});

// Use in JSX
<FormTextBox />
```

## Component Registry

### Registration
```typescript
// Auto-registration in ComponentRegistrations.ts
registerComponent(
  FormFieldTextBoxViewModel,
  FormTextBoxComponent,
  'angular',
  { selector: 'mlp-form-text-box' }
);
```

### Dynamic Resolution
```typescript
// Get component for specific framework
const Component = getComponent(FormFieldTextBoxViewModel, 'react');
```

## Benefits

### 1. **Code Reusability**
- Same ViewModel logic works across frameworks
- Business rules defined once, used everywhere
- Consistent validation and state management

### 2. **Separation of Concerns**
- ViewModels handle business logic
- Components handle UI concerns
- Clear boundaries between layers

### 3. **Framework Flexibility**
- Easy to add new framework support
- Components can be swapped without changing ViewModels
- Gradual migration between frameworks

### 4. **Type Safety**
- Full TypeScript support
- Compile-time validation of ViewModel-Component mappings
- IntelliSense support across frameworks

### 5. **Testing**
- ViewModels can be tested independently
- Mock components for unit testing
- Integration tests with real components

## File Structure

```
libs/
├── core/                           # Framework-agnostic ViewModels
│   ├── ViewModelBase.ts           # Base ViewModel class
│   ├── FormFieldViewModel.ts      # Form field ViewModels
│   ├── ComponentRegistry.ts       # Component mapping system
│   └── index.ts
├── angular/                        # Angular-specific components
│   ├── FormTextBox.ts             # Angular FormTextBox component
│   ├── ViewModelDirective.ts      # Angular directive for ViewModels
│   ├── ComponentRegistrations.ts  # Auto-registration
│   └── index.ts
└── react/                          # React-specific components
    ├── FormTextBox.tsx            # React FormTextBox component
    ├── UseViewModel.ts            # React hook for ViewModels
    ├── ComponentRegistrations.ts  # Auto-registration
    └── index.ts
```

## Best Practices

### 1. **ViewModel Design**
- Keep ViewModels framework-agnostic
- Use composition over inheritance
- Implement proper disposal patterns

### 2. **Component Design**
- Wrap native framework components
- Implement framework-specific interfaces (ControlValueAccessor, etc.)
- Handle lifecycle management properly

### 3. **Registration**
- Auto-register components on import
- Use consistent naming conventions
- Provide metadata for dynamic resolution

### 4. **Testing**
- Test ViewModels independently
- Mock framework components in ViewModel tests
- Test component integration separately

## Future Enhancements

### 1. **Additional Form Controls**
- FormFieldSelect
- FormFieldCheckbox
- FormFieldDatePicker
- FormFieldFileUpload

### 2. **Advanced Features**
- Form validation groups
- Conditional field visibility
- Dynamic form generation
- Form state persistence

### 3. **Framework Support**
- Vue.js components
- Svelte components
- Web Components

### 4. **Developer Experience**
- CLI tools for component generation
- Visual form builder
- Hot reloading for ViewModels
- Debug tools and devtools integration

## Conclusion

The MVVM architecture provides a robust foundation for building framework-agnostic component libraries. By separating business logic (ViewModels) from UI concerns (Components), we achieve:

- **Consistency**: Same behavior across frameworks
- **Maintainability**: Single source of truth for business logic
- **Flexibility**: Easy to add new frameworks or components
- **Testability**: Clear separation enables better testing strategies

This architecture scales well and provides a solid foundation for building complex, multi-framework applications.

