import { Directive, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import type { IViewModelBase, IPropertyChanged } from '@mlp/core';

@Directive({
  selector: '[dataContext]',
  standalone: true
})
export class ViewModelDirective implements OnInit, OnDestroy {
  private _dataContext!: IViewModelBase<any>;
  private _dataTrigger?: string | string[];

  @Input()
  set dataContext(value: IViewModelBase<any>) {
    this._dataContext = value;
  }
  get dataContext(): IViewModelBase<any> {
    return this._dataContext;
  }

  @Input()
  set dataTrigger(value: string | string[] | undefined) {
    this._dataTrigger = value;
  }
  get dataTrigger(): string | string[] | undefined {
    return this._dataTrigger;
  }

  private subscription?: Subscription;

  constructor() {}

  async ngOnInit(): Promise<void> {
    if (this.dataContext) {
      this.subscription = this.dataContext.onModelChanged.subscribe((change: IPropertyChanged) => {
        this.handleModelChange(change);
      });

      // Initialize the view model
      await this.dataContext.initialize();
    }
  }

  async ngOnDestroy(): Promise<void> {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.dataContext) {
      await this.dataContext.cleanup();
      this.dataContext.dispose();
    }
  }

  private handleModelChange(change: IPropertyChanged): void {
    // Let Angular's default change detection handle updates
    // This prevents conflicts with Ant Design's internal DI
    console.log('Model changed:', change);
  }
}
