// React-specific Ant Design component interfaces
// These extend the framework-agnostic types from @mlp/core

import { 
  AntDesignBaseProps, 
  AntDesignButtonType, 
  AntDesignButtonSize, 
  AntDesignTagColor, 
  AntDesignAlertType 
} from '@mlp/core';

// React-specific component props
export interface AntDesignButtonProps extends AntDesignBaseProps {
  type?: AntDesignButtonType;
  size?: AntDesignButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export interface AntDesignCardProps extends AntDesignBaseProps {
  title?: string;
  subtitle?: string;
  extra?: React.ReactNode;
  bordered?: boolean;
  hoverable?: boolean;
}

export interface AntDesignTagProps extends AntDesignBaseProps {
  color?: AntDesignTagColor;
  closable?: boolean;
  onClose?: () => void;
}

export interface AntDesignAlertProps extends AntDesignBaseProps {
  type?: AntDesignAlertType;
  message?: string;
  description?: string;
  showIcon?: boolean;
  closable?: boolean;
  onClose?: () => void;
}

export interface AntDesignInputProps extends AntDesignBaseProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  size?: AntDesignButtonSize;
}

export interface AntDesignSelectProps extends AntDesignBaseProps {
  placeholder?: string;
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  disabled?: boolean;
  multiple?: boolean;
  options?: Array<{ label: string; value: string }>;
}

export interface AntDesignTableProps extends AntDesignBaseProps {
  dataSource?: any[];
  columns?: Array<{
    title: string;
    dataIndex: string;
    key: string;
    render?: (value: any, record: any, index: number) => React.ReactNode;
  }>;
  pagination?: boolean | object;
  loading?: boolean;
}
