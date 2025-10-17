import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpaceModule, NzSpaceItemDirective } from 'ng-zorro-antd/space';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { LimitMonitorViewModel } from './LimitMonitorViewModel';

@Component({
  selector: 'app-limit-monitor',
  standalone: true,
  imports: [
    DatePipe,
    NzCardModule,
    NzButtonModule,
    NzSpaceModule,
    NzSpaceItemDirective,
    NzStatisticModule,
    NzListModule,
    NzTagModule
  ],
  styleUrls: ['./limit-monitor.component.scss'],
  template: `
    <div class="page-container">
      <h2 class="page-title">API Limit Monitor</h2>
      
      <nz-card nzTitle="Monitor Controls" class="ant-card">
        <nz-space nzSize="middle" class="button-group">
          <button 
            *nzSpaceItem
            nz-button 
            nzType="primary"
            nzSize="large"
            nz-icon="play-circle"
            (click)="viewModel.startCommand.execute()"
            [disabled]="!viewModel.startCommand.canExecute()"
            [nzLoading]="viewModel.model.isLoading">
            Start Monitoring
          </button>
          <button 
            *nzSpaceItem
            nz-button 
            nzSize="large"
            nz-icon="stop"
            (click)="viewModel.stopCommand.execute()"
            [disabled]="!viewModel.stopCommand.canExecute()"
            [nzLoading]="viewModel.model.isLoading">
            Stop Monitoring
          </button>
          <button 
            *nzSpaceItem
            nz-button 
            nzSize="large"
            nz-icon="clear"
            (click)="viewModel.clearAlertsCommand.execute()"
            [disabled]="!viewModel.clearAlertsCommand.canExecute()"
            [nzLoading]="viewModel.model.isLoading">
            Clear Alerts
          </button>
        </nz-space>
      </nz-card>
      
      <nz-card 
        [style.display]="viewModel.model.isMonitoring ? 'block' : 'none'"
        nzTitle="Monitor Status" 
        class="ant-card">
        
        <div class="stats-grid">
          <nz-statistic 
            nzTitle="Last Check"
            [nzValue]="viewModel.model.lastCheckTime ? (viewModel.model.lastCheckTime | date:'medium') : 'Never'"
            class="stat-item">
          </nz-statistic>
          
          <nz-statistic 
            nzTitle="Total Requests"
            [nzValue]="viewModel.model.totalRequests"
            class="stat-item">
          </nz-statistic>
          
          <nz-statistic 
            nzTitle="Avg Response Time"
            [nzValue]="viewModel.model.averageResponseTime.toFixed(2)"
            nzSuffix="ms"
            class="stat-item">
          </nz-statistic>
        </div>
      </nz-card>
      
      <nz-card 
        [style.display]="viewModel.model.alerts.length > 0 ? 'block' : 'none'"
        [nzTitle]="'Alerts (' + viewModel.model.alerts.length + ')'"
        class="ant-card">
        
        <nz-list 
          nzSize="small" 
          [nzDataSource]="viewModel.model.alerts"
          nzBordered
          class="alert-list">
          <nz-list-item *nzListItem="let alert">
            <div class="alert-content">
              <div class="alert-header">
                <nz-tag nzColor="warning">WARNING</nz-tag>
                <span class="alert-time">{{ alert.timestamp | date:'medium' }}</span>
              </div>
              <div class="alert-message">{{ alert.message }}</div>
            </div>
            <div class="alert-actions">
              <button nz-button nzSize="small" nz-icon="check">
                Acknowledge
              </button>
            </div>
          </nz-list-item>
        </nz-list>
      </nz-card>
    </div>
  `
})
export class LimitMonitorComponent {
  viewModel = new LimitMonitorViewModel();
}