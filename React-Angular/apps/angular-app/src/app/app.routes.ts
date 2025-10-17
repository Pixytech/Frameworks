import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LimitMonitorComponent } from './limit-monitor/limit-monitor.component';
import { FormExampleComponent } from './form-example/form-example.component';
import { UserRegistrationComponent } from './user-registration/user-registration.component';
import { WorkingDemoComponent } from './working-demo/working-demo.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'limit-monitor', component: LimitMonitorComponent },
  { path: 'form-example', component: FormExampleComponent },
  { path: 'user-registration', component: UserRegistrationComponent },
  { path: 'working-demo', component: WorkingDemoComponent },
  { path: '**', redirectTo: '/dashboard' }
];
