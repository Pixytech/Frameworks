// Common Ant Design types and interfaces

export interface AntDesignStatisticProps {
  title?: string;
  value?: string | number;
  precision?: number;
  valueStyle?: any;
  prefix?: string;
  suffix?: string;
  loading?: boolean;
}

export interface AntDesignListProps {
  dataSource?: any[];
  renderItem?: (item: any, index: number) => any;
  loading?: boolean;
  pagination?: any;
  size?: 'default' | 'large' | 'small';
}

export interface AntDesignSpaceProps {
  size?: 'small' | 'middle' | 'large' | number;
  direction?: 'vertical' | 'horizontal';
  align?: 'start' | 'end' | 'center' | 'baseline';
  wrap?: boolean;
  split?: any;
  children?: any;
}

// Common color mappings
export const ANT_DESIGN_COLORS = {
  primary: '#1890ff',
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
  info: '#1890ff',
  text: 'rgba(0, 0, 0, 0.85)',
  textSecondary: 'rgba(0, 0, 0, 0.45)',
  textDisabled: 'rgba(0, 0, 0, 0.25)',
  border: '#d9d9d9',
  background: '#fafafa',
  backgroundLight: '#ffffff'
} as const;

// Common spacing values
export const ANT_DESIGN_SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
} as const;

// Common border radius values
export const ANT_DESIGN_BORDER_RADIUS = {
  sm: 2,
  md: 4,
  lg: 6,
  xl: 8
} as const;
