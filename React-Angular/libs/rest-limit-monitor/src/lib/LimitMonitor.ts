import { ViewModelBase } from '@mlp/core';
import { ApiUsage, LimitAlert, MonitorConfig } from './Models';
import { RestClient } from './RestClient';
import { AntDesignUtils } from '@mlp/core';

export interface LimitMonitorModel {
  isMonitoring: boolean;
  alerts: LimitAlert[];
  currentUsage: ApiUsage[];
  config: MonitorConfig;
  lastCheckTime?: Date;
  totalRequests: number;
  averageResponseTime: number;
}

export class LimitMonitorViewModel extends ViewModelBase<LimitMonitorModel> {
  private restClient: RestClient;
  private monitoringInterval?: NodeJS.Timeout;

  constructor(restClient: RestClient, config: MonitorConfig) {
    super();
    this.restClient = restClient;
  }

  protected createModel(): LimitMonitorModel {
    return {
      isMonitoring: false,
      alerts: [],
      currentUsage: [],
      config: {
        checkInterval: 30000, // 30 seconds
        warningThreshold: 80,
        criticalThreshold: 95,
        maxAlerts: 100,
        endpoints: []
      },
      totalRequests: 0,
      averageResponseTime: 0
    };
  }

  async startMonitoring(): Promise<void> {
    if (this.model.isMonitoring) {
      return;
    }

    this.batchUpdate(model => {
      model.isMonitoring = true;
    });

    this.monitoringInterval = setInterval(() => {
      this.checkLimits();
    }, this.model.config.checkInterval);

    // Initial check
    await this.checkLimits();
  }

  async stopMonitoring(): Promise<void> {
    if (!this.model.isMonitoring) {
      return;
    }

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }

    this.batchUpdate(model => {
      model.isMonitoring = false;
    });
  }

  private async checkLimits(): Promise<void> {
    try {
      const usageHistory = this.restClient.getUsageHistory();
      const recentUsage = usageHistory.filter(usage => {
        const timeDiff = Date.now() - usage.timestamp.getTime();
        return timeDiff <= this.model.config.checkInterval;
      });

      this.batchUpdate(model => {
        model.currentUsage = recentUsage;
        model.lastCheckTime = new Date();
        model.totalRequests = usageHistory.length;
        model.averageResponseTime = this.calculateAverageResponseTime(usageHistory);
      });

      // Check for limit violations
      await this.checkForViolations(recentUsage);
    } catch (error) {
      console.error('Error checking limits:', error);
    }
  }

  private async checkForViolations(usage: ApiUsage[]): Promise<void> {
    const violations: LimitAlert[] = [];

    for (const apiUsage of usage) {
      if (apiUsage.limitInfo) {
        const usagePercentage = ((apiUsage.limitInfo.limit - apiUsage.limitInfo.remaining) / apiUsage.limitInfo.limit) * 100;
        
        if (usagePercentage >= this.model.config.criticalThreshold) {
          violations.push({
            id: this.generateAlertId(),
            endpoint: apiUsage.endpoint,
            message: `Critical: API limit usage at ${usagePercentage.toFixed(1)}% for ${apiUsage.endpoint}`,
            severity: 'critical',
            timestamp: new Date(),
            acknowledged: false
          });
        } else if (usagePercentage >= this.model.config.warningThreshold) {
          violations.push({
            id: this.generateAlertId(),
            endpoint: apiUsage.endpoint,
            message: `Warning: API limit usage at ${usagePercentage.toFixed(1)}% for ${apiUsage.endpoint}`,
            severity: 'warning',
            timestamp: new Date(),
            acknowledged: false
          });
        }
      }
    }

    if (violations.length > 0) {
      this.batchUpdate(model => {
        model.alerts = [...model.alerts, ...violations].slice(-model.config.maxAlerts);
      });
    }
  }

  private calculateAverageResponseTime(usage: ApiUsage[]): number {
    if (usage.length === 0) return 0;
    
    const totalTime = usage.reduce((sum, u) => sum + u.responseTime, 0);
    return totalTime / usage.length;
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  acknowledgeAlert(alertId: string): void {
    this.batchUpdate(model => {
      const alert = model.alerts.find(a => a.id === alertId);
      if (alert) {
        alert.acknowledged = true;
      }
    });
  }

  clearAlerts(): void {
    this.batchUpdate(model => {
      model.alerts = [];
    });
  }

  updateConfig(newConfig: Partial<MonitorConfig>): void {
    this.batchUpdate(model => {
      model.config = { ...model.config, ...newConfig };
    });

    // Restart monitoring with new interval if it changed
    if (newConfig.checkInterval && this.model.isMonitoring) {
      this.stopMonitoring();
      this.startMonitoring();
    }
  }

  protected override async onCleanup(): Promise<void> {
    await this.stopMonitoring();
  }

  // Use core Ant Design utilities for consistent styling
  getSeverityColor(severity: string): string {
    return AntDesignUtils.getSeverityColor(severity);
  }

  getStatusCodeColor(statusCode: number): string {
    return AntDesignUtils.getStatusCodeColor(statusCode);
  }

  // Additional utility methods using core Ant Design utilities
  getButtonType(action: string): string {
    return AntDesignUtils.getButtonType(action);
  }

  isDangerButton(action: string): boolean {
    return AntDesignUtils.isDangerButton(action);
  }

  getActionIcon(action: string): string {
    return AntDesignUtils.getActionIcon(action);
  }

  formatDate(date: Date | undefined): string {
    return AntDesignUtils.formatDate(date);
  }

  formatNumber(num: number, precision: number = 2): string {
    return AntDesignUtils.formatNumber(num, precision);
  }
}
