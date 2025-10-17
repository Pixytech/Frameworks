// Data models for the REST limit monitor

export interface ApiLimit {
  limit: number;
  remaining: number;
  resetTime: Date;
  windowSize: number; // in seconds
}

export interface ApiUsage {
  endpoint: string;
  method: string;
  timestamp: Date;
  responseTime: number;
  statusCode: number;
  limitInfo?: ApiLimit;
}

export interface LimitAlert {
  id: string;
  endpoint: string;
  message: string;
  severity: 'warning' | 'error' | 'critical';
  timestamp: Date;
  acknowledged: boolean;
}

export interface MonitorConfig {
  checkInterval: number; // in milliseconds
  warningThreshold: number; // percentage (0-100)
  criticalThreshold: number; // percentage (0-100)
  maxAlerts: number;
  endpoints: string[];
}
