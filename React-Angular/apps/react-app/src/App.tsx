import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Typography } from '@mlp/react';
import Dashboard from './components/Dashboard';
import LimitMonitor from './components/LimitMonitor';
import { FormExample } from './components/FormExample';
import { UserRegistration } from './components/UserRegistration';
import './App.scss';

function App() {
  const location = useLocation();

  return (
    <div className="app-container">
      <header className="app-header">
        <Typography.Title level={1} style={{ color: 'white', margin: 0 }}>
          MLP Framework Demo - React
        </Typography.Title>
        <Typography.Text style={{ color: 'white', opacity: 0.9, margin: 0 }}>
          Framework-agnostic MVVM with React bindings
        </Typography.Text>
      </header>
      
      <nav className="app-nav">
        <Link 
          to="/" 
          className={location.pathname === '/' ? 'active' : ''}
        >
          Dashboard
        </Link>
        <Link 
          to="/limit-monitor" 
          className={location.pathname === '/limit-monitor' ? 'active' : ''}
        >
          Limit Monitor
        </Link>
        <Link 
          to="/form-example" 
          className={location.pathname === '/form-example' ? 'active' : ''}
        >
          Form Example
        </Link>
        <Link 
          to="/user-registration" 
          className={location.pathname === '/user-registration' ? 'active' : ''}
        >
          User Registration
        </Link>
      </nav>
      
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/limit-monitor" element={<LimitMonitor />} />
          <Route path="/form-example" element={<FormExample />} />
          <Route path="/user-registration" element={<UserRegistration />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
