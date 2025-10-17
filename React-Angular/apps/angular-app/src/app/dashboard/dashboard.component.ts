import { Component } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpaceModule, NzSpaceItemDirective } from 'ng-zorro-antd/space';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzListModule } from 'ng-zorro-antd/list';
import { DashboardViewModel } from './DashboardViewModel';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    NzCardModule,
    NzButtonModule,
    NzSpaceModule,
    NzSpaceItemDirective,
    NzAlertModule,
    NzListModule
  ],
  styleUrls: ['./dashboard.component.scss'],
  template: `
    <div class="page-container">
      <div  style="display: none;"></div>
      <h2 class="page-title">Dashboard</h2>

      <nz-card 
        nzTitle="Counter Example" 
        nzExtra="MLP Framework Demo"
        class="ant-card">
        
        <div class="counter-display">
          <h1 class="counter-value">
            <span>Count:{{Date.now()}}</span>
            Count: {{ viewModel.model.counter }}
          </h1>
        </div>
        
        <nz-space nzSize="middle" class="button-group">
          <button 
            *nzSpaceItem
            nz-button 
            nzType="primary"
            nzSize="large"
            nz-icon="plus"
            (click)="viewModel.incrementCommand.execute()"
            [disabled]="!viewModel.incrementCommand.canExecute()"
            [nzLoading]="viewModel.model.isLoading">
            Increment
          </button>
          
          <button 
            *nzSpaceItem
            nz-button 
            nzSize="large"
            nz-icon="minus"
            (click)="viewModel.decrementCommand.execute()"
            [disabled]="!viewModel.decrementCommand.canExecute()"
            [nzLoading]="viewModel.model.isLoading">
            Decrement
          </button>
          
          <button 
            *nzSpaceItem
            nz-button 
            nzSize="large"
            nz-icon="reload"
            (click)="viewModel.resetCommand.execute()"
            [disabled]="!viewModel.resetCommand.canExecute()"
            [nzLoading]="viewModel.model.isLoading">
            Reset
          </button>
        </nz-space>
        
        <nz-alert 
          [style.display]="viewModel.model.message ? 'block' : 'none'"
          nzType="success"
          nzMessage="{{ viewModel.model.message }}"
          nzIcon="check-circle"
          class="ant-alert">
        </nz-alert>
        
        <nz-alert 
          [style.display]="viewModel.model.error ? 'block' : 'none'"
          nzType="error"
          nzMessage="{{ viewModel.model.error }}"
          nzIcon="exclamation-circle"
          class="ant-alert">
        </nz-alert>
      </nz-card>
      
      <nz-card 
        nzTitle="Framework Information"
        class="ant-card">
        
        <nz-list nzSize="small" class="info-list">
          <nz-list-item>
            <strong>Framework:</strong> Angular 18
          </nz-list-item>
          <nz-list-item>
            <strong>UI Library:</strong> Ant Design (ng-zorro-antd)
          </nz-list-item>
          <nz-list-item>
            <strong>MVVM Library:</strong> &#64;mlp/core + &#64;mlp/angular
          </nz-list-item>
          <nz-list-item>
            <strong>Build Tool:</strong> Angular DevKit Build-Angular
          </nz-list-item>
        </nz-list>
      </nz-card>
    </div>
  `
})
export class DashboardComponent {
  viewModel = new DashboardViewModel();
} 