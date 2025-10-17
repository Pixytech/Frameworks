// Framework-agnostic Ant Design utilities and helpers

import { ANT_DESIGN_COLORS } from './AntDesignTypes';

// Common Ant Design Types and Interfaces (Framework-agnostic)
export interface AntDesignTheme {
  primaryColor: string;
  successColor: string;
  warningColor: string;
  errorColor: string;
  infoColor: string;
  textColor: string;
  textColorSecondary: string;
  borderColor: string;
  backgroundColor: string;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
  };
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
}

// Base component properties (framework-agnostic)
export interface AntDesignBaseProps {
  className?: string;
  style?: Record<string, any>;
}

// Button types and sizes (framework-agnostic)
export type AntDesignButtonType = 'primary' | 'default' | 'dashed' | 'link' | 'text';
export type AntDesignButtonSize = 'small' | 'middle' | 'large';
export type AntDesignTagColor = 'default' | 'success' | 'processing' | 'error' | 'warning';
export type AntDesignAlertType = 'success' | 'info' | 'warning' | 'error';

export class AntDesignUtils {
  // Default theme configuration
  static readonly DEFAULT_THEME: AntDesignTheme = {
    primaryColor: '#1890ff',
    successColor: '#52c41a',
    warningColor: '#faad14',
    errorColor: '#ff4d4f',
    infoColor: '#1890ff',
    textColor: '#262626',
    textColorSecondary: '#8c8c8c',
    borderColor: '#d9d9d9',
    backgroundColor: '#ffffff',
    spacing: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
      xxl: 32
    },
    borderRadius: {
      sm: 4,
      md: 6,
      lg: 8
    },
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24
    }
  };

  /**
   * Get severity color for alerts and tags
   */
  static getSeverityColor(severity: string): string {
    switch (severity.toLowerCase()) {
      case 'warning': return 'warning';
      case 'error': 
      case 'critical': return 'error';
      case 'success': return 'success';
      case 'info': return 'processing';
      default: return 'default';
    }
  }

  /**
   * Get status code color for HTTP status codes
   */
  static getStatusCodeColor(statusCode: number): string {
    if (statusCode >= 200 && statusCode < 300) return 'success';
    if (statusCode >= 300 && statusCode < 400) return 'processing';
    if (statusCode >= 400 && statusCode < 500) return 'warning';
    return 'error';
  }

  // Generate CSS class names for Ant Design components
  static getButtonClass(type: string = 'default', size: string = 'middle'): string {
    const baseClass = 'ant-btn';
    const typeClass = type !== 'default' ? `ant-btn-${type}` : '';
    const sizeClass = size !== 'middle' ? `ant-btn-${size}` : '';
    
    return [baseClass, typeClass, sizeClass].filter(Boolean).join(' ');
  }

  static getCardClass(): string {
    return 'ant-card';
  }

  static getTagClass(color: string = 'default'): string {
    return color !== 'default' ? `ant-tag ant-tag-${color}` : 'ant-tag';
  }

  static getAlertClass(type: string = 'info'): string {
    return `ant-alert ant-alert-${type}`;
  }

  // Generate inline styles for dynamic theming
  static getThemeStyles(theme: Partial<AntDesignTheme> = {}): any {
    const mergedTheme = { ...this.DEFAULT_THEME, ...theme };
    
    return {
      '--ant-primary-color': mergedTheme.primaryColor,
      '--ant-success-color': mergedTheme.successColor,
      '--ant-warning-color': mergedTheme.warningColor,
      '--ant-error-color': mergedTheme.errorColor,
      '--ant-info-color': mergedTheme.infoColor,
      '--ant-text-color': mergedTheme.textColor,
      '--ant-text-color-secondary': mergedTheme.textColorSecondary,
      '--ant-border-color': mergedTheme.borderColor,
      '--ant-background-color': mergedTheme.backgroundColor,
    };
  }

  // Format file sizes
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Generate unique IDs for components
  static generateId(prefix: string = 'ant'): string {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get button type based on action
   */
  static getButtonType(action: string): 'primary' | 'default' | 'dashed' | 'link' | 'text' | 'ghost' {
    switch (action.toLowerCase()) {
      case 'start':
      case 'submit':
      case 'save':
      case 'create':
        return 'primary';
      case 'delete':
      case 'remove':
      case 'stop':
        return 'default';
      case 'cancel':
      case 'reset':
        return 'dashed';
      default:
        return 'default';
    }
  }

  /**
   * Get button danger state
   */
  static isDangerButton(action: string): boolean {
    const dangerActions = ['delete', 'remove', 'stop', 'clear'];
    return dangerActions.includes(action.toLowerCase());
  }

  /**
   * Format date for display
   */
  static formatDate(date: Date | undefined): string {
    if (!date) return 'Never';
    return date.toLocaleString();
  }

  /**
   * Format number with precision
   */
  static formatNumber(num: number, precision: number = 2): string {
    return num.toFixed(precision);
  }

  /**
   * Get icon name for action
   */
  static getActionIcon(action: string): string {
    switch (action.toLowerCase()) {
      case 'start':
      case 'play':
        return 'play-circle';
      case 'stop':
        return 'stop';
      case 'pause':
        return 'pause';
      case 'reset':
        return 'reload';
      case 'clear':
        return 'clear';
      case 'delete':
        return 'delete';
      case 'edit':
        return 'edit';
      case 'save':
        return 'save';
      case 'add':
        return 'plus';
      case 'remove':
        return 'minus';
      default:
        return 'question';
    }
  }
}

// Common Ant Design component configurations
export const ANT_DESIGN_CONFIG = {
  button: {
    primary: {
      background: ANT_DESIGN_COLORS.primary,
      borderColor: ANT_DESIGN_COLORS.primary,
      color: '#fff'
    },
    default: {
      background: '#fff',
      borderColor: ANT_DESIGN_COLORS.border,
      color: ANT_DESIGN_COLORS.text
    },
    danger: {
      background: ANT_DESIGN_COLORS.error,
      borderColor: ANT_DESIGN_COLORS.error,
      color: '#fff'
    }
  },
  card: {
    background: '#fff',
    border: `1px solid ${ANT_DESIGN_COLORS.border}`,
    borderRadius: ANT_DESIGN_COLORS.border,
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)'
  },
  tag: {
    success: {
      background: '#f6ffed',
      borderColor: '#b7eb8f',
      color: '#52c41a'
    },
    warning: {
      background: '#fffbe6',
      borderColor: '#ffe58f',
      color: '#faad14'
    },
    error: {
      background: '#fff2f0',
      borderColor: '#ffccc7',
      color: '#ff4d4f'
    },
    info: {
      background: '#e6f7ff',
      borderColor: '#91d5ff',
      color: '#1890ff'
    }
  }
} as const;
