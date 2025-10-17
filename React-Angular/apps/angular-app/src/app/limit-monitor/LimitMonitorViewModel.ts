import { ViewModelBase } from '@mlp/core';
import { DelegateCommand } from '@mlp/core';

export interface Alert {
  id: string;
  severity: 'warning' | 'error' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

export interface LimitMonitorModel {
  isMonitoring: boolean;
  lastCheckTime?: Date;
  totalRequests: number;
  averageResponseTime: number;
  alerts: Alert[];
  currentUsage: any[];
}

export class LimitMonitorViewModel extends ViewModelBase<LimitMonitorModel> {
  startCommand: DelegateCommand;
  stopCommand: DelegateCommand;
  clearAlertsCommand: DelegateCommand;

  private monitoringInterval: any;

  constructor() {
    super();
    
    this.startCommand = new DelegateCommand(
      () => this.startMonitoring(),
      () => !this.model.isMonitoring
    );
    
    this.stopCommand = new DelegateCommand(
      () => this.stopMonitoring(),
      () => this.model.isMonitoring
    );
    
    this.clearAlertsCommand = new DelegateCommand(
      () => this.clearAlerts(),
      () => this.model.alerts.length > 0
    );
  }

  protected createModel(): LimitMonitorModel {
    return {
      isMonitoring: false,
      lastCheckTime: undefined,
      totalRequests: 0,
      averageResponseTime: 0,
      alerts: [],
      currentUsage: []
    };
  }

  protected override async onInitializeOnce(): Promise<void> {
    this.addMockData();
  }

  protected override async onCleanup(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
  }

  private addMockData(): void {
    this.batchUpdate(model => {
      model.alerts = [
        {
          id: '1',
          severity: 'warning',
          message: 'API rate limit approaching 80%',
          timestamp: new Date(Date.now() - 300000),
          acknowledged: false
        },
        {
          id: '2',
          severity: 'error',
          message: 'Connection timeout to external service',
          timestamp: new Date(Date.now() - 180000),
          acknowledged: false
        }
      ];
    });
  }

  private addRandomAlert(): void {
    const severities: ('warning' | 'error' | 'critical')[] = ['warning', 'error', 'critical'];
    const messages = [
      'High response time detected',
      'API rate limit exceeded',
      'Service unavailable',
      'Authentication failed',
      'Database connection error'
    ];
    
    const newAlert: Alert = {
      id: Date.now().toString(),
      severity: severities[Math.floor(Math.random() * severities.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      timestamp: new Date(),
      acknowledged: false
    };
    
    this.batchUpdate(model => {
      model.alerts = [newAlert, ...model.alerts.slice(0, 9)]; // Keep only last 10 alerts
    });
  }

  private startMonitoring(): void {
    this.batchUpdate(model => {
      model.isMonitoring = true;
      model.lastCheckTime = new Date();
    });
    
    // Start mock monitoring
    this.monitoringInterval = setInterval(() => {
      this.batchUpdate(model => {
        model.lastCheckTime = new Date();
        model.totalRequests += Math.floor(Math.random() * 10) + 1;
        model.averageResponseTime = Math.floor(Math.random() * 200) + 50;
      });
      
      // Occasionally add alerts
      if (Math.random() < 0.1) {
        this.addRandomAlert();
      }
    }, 2000);
    
    this.updateCommandStates();
  }

  private stopMonitoring(): void {
    this.batchUpdate(model => {
      model.isMonitoring = false;
    });
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    this.updateCommandStates();
  }

  private clearAlerts(): void {
    this.batchUpdate(model => {
      model.alerts = [];
    });
    
    this.updateCommandStates();
  }

  acknowledgeAlert(alertId: string): void {
    this.batchUpdate(model => {
      const alert = model.alerts.find(a => a.id === alertId);
      if (alert) {
        alert.acknowledged = true;
      }
    });
  }

  getSeverityColor(severity: string): string {
    switch (severity.toLowerCase()) {
      case 'warning': return 'warning';
      case 'error': 
      case 'critical': return 'error';
      case 'success': return 'success';
      case 'info': return 'processing';
      default: return 'default';
    }
  }

  private updateCommandStates(): void {
    this.startCommand.raiseCanExecuteChanged();
    this.stopCommand.raiseCanExecuteChanged();
    this.clearAlertsCommand.raiseCanExecuteChanged();
  }
}
