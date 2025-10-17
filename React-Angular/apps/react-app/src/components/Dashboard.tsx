import React, { useMemo } from 'react';
import { useViewModel } from '@mlp/react';
import { 
  Card, 
  Button, 
  Space, 
  Typography, 
  Alert, 
  Spin,
  PlusOutlined,
  MinusOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@mlp/react';
import { DashboardViewModel } from './DashboardViewModel';
import './Dashboard.scss';

const Dashboard: React.FC = () => {
  const viewModel = useViewModel(useMemo(() => new DashboardViewModel(), []))

  return (
    <div className="react-page-container">
      <Typography.Title level={2} className="react-page-title">
        Dashboard
      </Typography.Title>

      <Card 
        title="Counter Example" 
        extra="MLP Framework Demo"
        className="ant-card"
      >
        <div className="counter-display">
          <Typography.Title level={1} className="counter-value">
            Count: {viewModel.model.counter}
          </Typography.Title>
        </div>
        
        <Space size="middle" className="react-button-group">
          <Button 
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => viewModel.incrementCommand.execute()}
            disabled={!viewModel.incrementCommand.canExecute()}
            loading={viewModel.model.isLoading}
          >
            Increment
          </Button>
          
          <Button 
            size="large"
            icon={<MinusOutlined />}
            onClick={() => viewModel.decrementCommand.execute()}
            disabled={!viewModel.decrementCommand.canExecute()}
            loading={viewModel.model.isLoading}
          >
            Decrement
          </Button>
          
          <Button 
            type="dashed"
            size="large"
            icon={<ReloadOutlined />}
            onClick={() => viewModel.resetCommand.execute()}
            disabled={!viewModel.resetCommand.canExecute()}
            loading={viewModel.model.isLoading}
          >
            Reset
          </Button>
        </Space>
        
        {viewModel.model.message && (
          <Alert
            type="success"
            message={viewModel.model.message}
            icon={<CheckCircleOutlined />}
            showIcon
            className="ant-alert"
          />
        )}
        
        {viewModel.model.error && (
          <Alert
            type="error"
            message={viewModel.model.error}
            icon={<ExclamationCircleOutlined />}
            showIcon
            className="ant-alert"
          />
        )}
      </Card>
      
      <Card 
        title="Framework Information"
        className="ant-card"
      >
        <div className="info-list">
          <div className="info-item">
            <Typography.Text strong>Framework:</Typography.Text> React 18
          </div>
          <div className="info-item">
            <Typography.Text strong>UI Library:</Typography.Text> Ant Design
          </div>
          <div className="info-item">
            <Typography.Text strong>MVVM Library:</Typography.Text> @mlp/core + @mlp/react
          </div>
          <div className="info-item">
            <Typography.Text strong>Build Tool:</Typography.Text> Vite
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;