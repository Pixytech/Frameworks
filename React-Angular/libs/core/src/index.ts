// Core MVVM System
export { ViewModelBase } from './lib/ViewModelBase';
export { 
  FormTextField, 
  createTextField, 
  createNameField, 
  createEmailField, 
  createPasswordField,
  isFormValid,
  resetForm,
  touchAllFields
} from './lib/MonzaInspiredViewModel';
export { UserRegistrationFormViewModel } from './lib/UserRegistrationFormViewModel';

// Core Interfaces
export * from './lib/Interfaces';

// Command System
export { DelegateCommand, DelegateCommandOf } from './lib/Command';

// UI Framework Support
export * from './lib/AntDesignTypes';
export * from './lib/AntDesignComponents';

// Export SCSS theme file path for framework-specific implementations
export const ANT_DESIGN_THEME_PATH = './lib/antd-theme.scss';
