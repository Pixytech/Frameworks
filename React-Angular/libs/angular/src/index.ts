// Core Angular MVVM Components
export * from './lib/ReactiveComponent';
export * from './lib/AngularViewModelBase';
export * from './lib/ViewModelDirective';

// UI Adapters (Simple bindings between Angular and MVVM)
export * from './lib/FormFieldAdapter';
export * from './lib/FormAdapter';

// Legacy components (to be phased out)
export * from './lib/CommandButton';
export * from './lib/FormTextBox';
export * from './lib/ComponentRegistrations';

// Export SCSS styles for Angular Ant Design components
export const ANGULAR_ANTD_STYLES = './lib/antd-components.scss';