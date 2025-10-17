// Common UI Types and Interfaces for Framework-Agnostic Components
// These types can be used across any framework (React, Angular, Vue, etc.)

// Generic types for any framework
export type AnyNode = any; // Framework-agnostic node type
export type AnyEventHandler = (...args: any[]) => void;

export interface ButtonProps {
  type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
  size?: 'small' | 'middle' | 'large';
  disabled?: boolean;
  loading?: boolean;
  danger?: boolean;
  ghost?: boolean;
  block?: boolean;
  icon?: AnyNode;
  onClick?: AnyEventHandler;
  children?: AnyNode;
}

export interface CardProps {
  title?: string;
  bordered?: boolean;
  hoverable?: boolean;
  loading?: boolean;
  size?: 'default' | 'small';
  cover?: AnyNode;
  actions?: AnyNode[];
  extra?: AnyNode;
  children?: AnyNode;
}

export interface InputProps {
  placeholder?: string;
  disabled?: boolean;
  size?: 'small' | 'middle' | 'large';
  prefix?: AnyNode;
  suffix?: AnyNode;
  addonBefore?: AnyNode;
  addonAfter?: AnyNode;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onPressEnter?: () => void;
}

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface SelectProps {
  placeholder?: string;
  disabled?: boolean;
  size?: 'small' | 'middle' | 'large';
  mode?: 'multiple' | 'tags';
  options: SelectOption[];
  value?: string | number | (string | number)[];
  defaultValue?: string | number | (string | number)[];
  onChange?: (value: string | number | (string | number)[]) => void;
  onSearch?: (value: string) => void;
  onSelect?: (value: string | number, option: SelectOption) => void;
  onDeselect?: (value: string | number, option: SelectOption) => void;
}

export interface TableColumn {
  key: string;
  title: string;
  dataIndex: string;
  width?: number;
  fixed?: 'left' | 'right';
  sorter?: boolean | ((a: any, b: any) => number);
  filterable?: boolean;
  render?: (value: any, record: any, index: number) => AnyNode;
}

export interface TableProps {
  columns: TableColumn[];
  dataSource: any[];
  loading?: boolean;
  pagination?: boolean | object;
  rowKey?: string | ((record: any) => string);
  size?: 'small' | 'middle' | 'large';
  bordered?: boolean;
  scroll?: { x?: number; y?: number };
  onRow?: (record: any, index: number) => { onClick?: AnyEventHandler };
}

export interface ModalProps {
  title?: string;
  visible: boolean;
  width?: number | string;
  centered?: boolean;
  maskClosable?: boolean;
  closable?: boolean;
  footer?: AnyNode;
  onOk?: () => void;
  onCancel?: () => void;
  confirmLoading?: boolean;
  children?: AnyNode;
}

export interface FormItemProps {
  label?: string;
  name: string;
  rules?: any[];
  required?: boolean;
  children: AnyNode;
}

export interface FormProps {
  layout?: 'horizontal' | 'vertical' | 'inline';
  labelCol?: object;
  wrapperCol?: object;
  onFinish?: (values: any) => void;
  onFinishFailed?: (errorInfo: any) => void;
  children: AnyNode;
}

export interface AlertProps {
  message: string;
  description?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  showIcon?: boolean;
  closable?: boolean;
  onClose?: () => void;
}

export interface SpinProps {
  spinning: boolean;
  tip?: string;
  size?: 'small' | 'default' | 'large';
  children?: AnyNode;
}

export interface MessageConfig {
  content: string;
  type?: 'success' | 'error' | 'info' | 'warning' | 'loading';
  duration?: number;
  onClose?: () => void;
}

export interface NotificationConfig {
  message: string;
  description?: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  placement?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  onClose?: () => void;
}

export interface ThemeConfig {
  primaryColor: string;
  borderRadius: number;
  fontFamily?: string;
  fontSize?: number;
}

export interface LayoutProps {
  children: AnyNode;
  style?: object;
  className?: string;
}

export interface HeaderProps extends LayoutProps {
  height?: number;
  fixed?: boolean;
  transparent?: boolean;
}

export interface SidebarProps extends LayoutProps {
  width?: number;
  collapsed?: boolean;
  collapsible?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

export interface MenuItem {
  key: string;
  icon?: AnyNode;
  label: string;
  children?: MenuItem[];
  disabled?: boolean;
  onClick?: () => void;
}

export interface PaginationConfig {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  onChange?: (page: number, pageSize?: number) => void;
  onShowSizeChange?: (current: number, size: number) => void;
}

export interface ApiResponse<T = any> {
  data: T;
  statusCode: number;
  message?: string;
  error?: string;
  timestamp?: string;
}

export interface ListResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Common type definitions
export type SizeType = 'small' | 'middle' | 'large';
export type ButtonType = 'primary' | 'default' | 'dashed' | 'link' | 'text';
export type AlertType = 'success' | 'info' | 'warning' | 'error';
export type MessageType = 'success' | 'error' | 'info' | 'warning' | 'loading';
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

// Framework-specific type mappings (to be used by framework libraries)
export interface FrameworkTypeMappings {
  React: {
    Node: any; // React.ReactNode
    EventHandler: any; // React event handlers
  };
  Angular: {
    Node: any; // Angular template nodes
    EventHandler: any; // Angular event handlers
  };
  Vue: {
    Node: any; // Vue VNode
    EventHandler: any; // Vue event handlers
  };
}