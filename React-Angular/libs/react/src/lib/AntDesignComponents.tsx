import React from 'react';

// Import Ant Design components
import { 
  Card, 
  Button, 
  Space, 
  Typography, 
  Alert, 
  Spin, 
  Tag, 
  Statistic, 
  Row, 
  Col, 
  List, 
  Badge 
} from 'antd';

// Import Ant Design icons
import { 
  PlusOutlined, 
  MinusOutlined, 
  ReloadOutlined,
  PlayCircleOutlined,
  StopOutlined,
  ClearOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

// Note: Core Ant Design types are available in @mlp/core if needed

// Re-export all Ant Design components
export {
  Card,
  Button,
  Space,
  Typography,
  Alert,
  Spin,
  Tag,
  Statistic,
  Row,
  Col,
  List,
  Badge
};

// Re-export all icons
export {
  PlusOutlined,
  MinusOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  StopOutlined,
  ClearOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
};

// React-specific Ant Design utilities
export class ReactAntDesignUtils {
  // React-specific icon mapping
  static getReactIcon(iconName: string): React.ComponentType<any> | null {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      'plus': PlusOutlined,
      'minus': MinusOutlined,
      'reload': ReloadOutlined,
      'play': PlayCircleOutlined,
      'stop': StopOutlined,
      'clear': ClearOutlined,
      'check': CheckCircleOutlined
    };
    
    return iconMap[iconName] || null;
  }

  // Generate React-specific CSS classes
  static getReactButtonClass(type: string = 'default', size: string = 'middle'): string {
    const baseClass = 'ant-btn';
    const typeClass = type !== 'default' ? `ant-btn-${type}` : '';
    const sizeClass = size !== 'middle' ? `ant-btn-${size}` : '';
    
    return [baseClass, typeClass, sizeClass].filter(Boolean).join(' ');
  }

  static getReactCardClass(): string {
    return 'ant-card';
  }

  static getReactTagClass(color: string = 'default'): string {
    return color !== 'default' ? `ant-tag ant-tag-${color}` : 'ant-tag';
  }

  static getReactAlertClass(type: string = 'info'): string {
    return `ant-alert ant-alert-${type}`;
  }

  // React-specific component props helpers
  static getReactButtonProps(type: string = 'default', size: string = 'middle'): any {
    return {
      type: type as any,
      size: size as any,
      className: this.getReactButtonClass(type, size)
    };
  }

  static getReactCardProps(title?: string, extra?: React.ReactNode): any {
    return {
      title,
      extra,
      className: this.getReactCardClass()
    };
  }

  static getReactTagProps(color: string = 'default'): any {
    return {
      color: color as any,
      className: this.getReactTagClass(color)
    };
  }

  static getReactAlertProps(type: string = 'info', message?: string): any {
    return {
      type: type as any,
      message,
      className: this.getReactAlertClass(type)
    };
  }
}

// Create a comprehensive Ant Design component library
export const AntDesignComponents = {
  Card,
  Button,
  Space,
  Typography,
  Alert,
  Spin,
  Tag,
  Statistic,
  Row,
  Col,
  List,
  Badge
};

// Create a comprehensive icon library
export const AntDesignIcons = {
  PlusOutlined,
  MinusOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  StopOutlined,
  ClearOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
};
