import { ViewModelBase } from '@mlp/core';
import { DelegateCommand } from '@mlp/core';

export interface DashboardModel {
  counter: number;
  message: string;
  isLoading: boolean;
  error: string | null;
}

export class DashboardViewModel extends ViewModelBase<DashboardModel> {
  incrementCommand: DelegateCommand;
  decrementCommand: DelegateCommand;
  resetCommand: DelegateCommand;
 currentTime: number = Date.now();
  constructor() {
    super();
    
    this.incrementCommand = new DelegateCommand(
      () => this.increment(),
      () => !this.model.isLoading
    );
    
    this.decrementCommand = new DelegateCommand(
      () => this.decrement(),
      () => !this.model.isLoading && this.model.counter > 0
    );
    
    this.resetCommand = new DelegateCommand(
      () => this.reset(),
      () => !this.model.isLoading && this.model.counter !== 0
    );
  }

  protected createModel(): DashboardModel {
    return {
      counter: 0,
      message: 'Welcome to the MLP Framework!',
      isLoading: false,
      error: null
    };
  }

  private async increment(): Promise<void> {
    this.batchUpdate(model => {
      model.isLoading = true;
      model.error = null;
    });
    
    
    this.batchUpdate(model => {
      model.counter++;
      model.message = `Incremented to ${model.counter}`;
      model.isLoading = false;
    });
    
    this.updateCommandStates();
  }

  private async decrement(): Promise<void> {
    if (this.model.counter <= 0) return;
    
    this.batchUpdate(model => {
      model.isLoading = true;
      model.error = null;
    });
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    this.batchUpdate(model => {
      model.counter--;
      model.message = `Decremented to ${model.counter}`;
      model.isLoading = false;
    });
    
    this.updateCommandStates();
  }

  private async reset(): Promise<void> {
    this.batchUpdate(model => {
      model.isLoading = true;
      model.error = null;
    });
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    this.batchUpdate(model => {
      model.counter = 0;
      model.message = 'Counter reset to 0';
      model.isLoading = false;
    });
    
    this.updateCommandStates();
  }

  private updateCommandStates(): void {
    this.incrementCommand.raiseCanExecuteChanged();
    this.decrementCommand.raiseCanExecuteChanged();
    this.resetCommand.raiseCanExecuteChanged();
  }
}
