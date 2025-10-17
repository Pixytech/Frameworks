import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  styleUrls: ['./app.component.scss'],
  template: `
    <div class="app-container">
      <header class="app-header">
        <h1>MLP Framework Demo - Angular</h1>
        <p>Framework-agnostic MVVM with Angular bindings</p>
      </header>
      
      <nav class="app-nav">
        <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
        <a routerLink="/limit-monitor" routerLinkActive="active">Limit Monitor</a>
        <a routerLink="/form-example" routerLinkActive="active">Form Example</a>
        <a routerLink="/user-registration" routerLinkActive="active">User Registration</a>
      </nav>
      
      <main class="app-main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AppComponent {
  title = 'angular-app';
}
