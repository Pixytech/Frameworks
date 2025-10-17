import { Injectable, OnDestroy } from '@angular/core';

/**
 * Angular-specific base class for ViewModels that integrates with Angular's lifecycle
 * This is a standalone implementation that doesn't depend on @mlp/core
 */
@Injectable()
export abstract class AngularViewModelBase<TModel extends object> implements OnDestroy {
  public model: TModel;
  
  constructor() {
    this.model = this.createModel();
  }

  protected abstract createModel(): TModel;

  ngOnDestroy(): void {
    // Angular-specific cleanup
  }

  /**
   * Angular-specific initialization that can be called from component ngOnInit
   */
  async ngOnInit(): Promise<void> {
    // Angular-specific initialization
  }
}
