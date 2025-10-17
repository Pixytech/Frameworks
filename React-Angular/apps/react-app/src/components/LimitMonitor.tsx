import React, { useMemo } from 'react';
import { ReactViewModelBase } from '@mlp/react';
import { DelegateCommand } from '@mlp/core';
import { useViewModel } from '@mlp/react';

interface Alert {
  id: string;
  severity: 'warning' | 'error' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

interface LimitMonitorModel {
  isMonitoring: boolean;
  lastCheckTime?: Date;
  totalRequests: number;
  averageResponseTime: number;
  alerts: Alert[];
  currentUsage: any[];
}

class LimitMonitorViewModel extends ReactViewModelBase<LimitMonitorModel> {
  startCommand: DelegateCommand;
  stopCommand: DelegateCommand;
  clearAlertsCommand: DelegateCommand;

  private monitoringInterval: NodeJS.Timeout | null = null;

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

  protected async onInitializeOnce(): Promise<void> {
    this.addMockData();
  }

  protected async onCleanup(): Promise<void> {
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

const LimitMonitor: React.FC = () => {
  const viewModel = useViewModel(useMemo(() => new LimitMonitorViewModel(), []));

  return (
    <div className="page-container">
      <h2 className="page-title">API Limit Monitor</h2>
      
      <div className="ant-card">
        <div className="ant-card-head">
          <div className="ant-card-head-wrapper">
            <div className="ant-card-head-title">Monitor Controls</div>
          </div>
        </div>
        <div className="ant-card-body">
          <div className="button-group">
            <button 
              className="ant-btn ant-btn-primary ant-btn-lg"
              onClick={() => viewModel.startCommand.execute()}
              disabled={!viewModel.startCommand.canExecute()}>
              <span className="anticon">▶</span>
              Start Monitoring
            </button>
            <button 
              className="ant-btn ant-btn-default ant-btn-lg"
              onClick={() => viewModel.stopCommand.execute()}
              disabled={!viewModel.stopCommand.canExecute()}>
              <span className="anticon">⏹</span>
              Stop Monitoring
            </button>
            <button 
              className="ant-btn ant-btn-dashed ant-btn-lg"
              onClick={() => viewModel.clearAlertsCommand.execute()}
              disabled={!viewModel.clearAlertsCommand.canExecute()}>
              <span className="anticon">🗑</span>
              Clear Alerts
            </button>
          </div>
        </div>
      </div>
      
      {viewModel.model.isMonitoring && (
        <div className="ant-card">
          <div className="ant-card-head">
            <div className="ant-card-head-wrapper">
              <div className="ant-card-head-title">Monitor Status</div>
            </div>
          </div>
          <div className="ant-card-body">
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-title">Last Check</div>
                <div className="stat-value">
                  {viewModel.model.lastCheckTime ? viewModel.model.lastCheckTime.toLocaleString() : 'Never'}
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-title">Total Requests</div>
                <div className="stat-value">{viewModel.model.totalRequests}</div>
              </div>
              <div className="stat-item">
                <div className="stat-title">Avg Response Time</div>
                <div className="stat-value">{viewModel.model.averageResponseTime.toFixed(2)}ms</div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {viewModel.model.alerts.length > 0 && (
        <div className="ant-card">
          <div className="ant-card-head">
            <div className="ant-card-head-wrapper">
              <div className="ant-card-head-title">Alerts ({viewModel.model.alerts.length})</div>
            </div>
          </div>
          <div className="ant-card-body">
            <div className="alert-list">
              {viewModel.model.alerts.map((alert) => (
                <div key={alert.id} className="alert-item">
                  <div className="alert-content">
                    <div className="alert-header">
                      <span className={`ant-tag ant-tag-${viewModel.getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className="alert-time">
                        {alert.timestamp.toLocaleString()}
                      </span>
                    </div>
                    <div className="alert-message">{alert.message}</div>
                  </div>
                  {!alert.acknowledged && (
                    <div className="alert-actions">
                      <button 
                        className="ant-btn ant-btn-sm"
                        onClick={() => viewModel.acknowledgeAlert(alert.id)}>
                        <span className="anticon">✓</span>
                        Acknowledge
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LimitMonitor;