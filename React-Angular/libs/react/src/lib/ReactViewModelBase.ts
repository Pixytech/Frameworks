import { ViewModelBase } from '@mlp/core';

/**
 * React-specific base class for ViewModels
 * This is essentially the same as the core ViewModelBase but provides
 * React-specific naming and potential future React-specific functionality
 */
export abstract class ReactViewModelBase<TModel extends object> extends ViewModelBase<TModel> {
  
  /**
   * React-specific initialization that can be called from useEffect
   */
  async useInitialization(): Promise<void> {
    await this.initialize();
  }

  /**
   * React-specific cleanup that can be called from useEffect cleanup
   */
  async useCleanup(): Promise<void> {
    await this.cleanup();
  }
}
