import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import type { IViewModelBase, IPropertyChanged } from '@mlp/core';

@Component({
  selector: 'mlp-reactive',
  template: '<ng-content></ng-content>',
  standalone: true
})
export class ReactiveComponent implements OnInit, OnDestroy {
  private _dataContext!: IViewModelBase<any>;
  private _trigger?: string | string[];

  @Input()
  set dataContext(value: IViewModelBase<any>) {
    this._dataContext = value;
  }
  get dataContext(): IViewModelBase<any> {
    return this._dataContext;
  }

  @Input()
  set dataTrigger(value: string | string[] | undefined) {
    this._trigger = value;
  }
  get dataTrigger(): string | string[] | undefined {
    return this._trigger;
  }

  private subscription?: Subscription;

  constructor(private cdr: ChangeDetectorRef) {}

  async ngOnInit(): Promise<void> {
    if (this.dataContext) {
      this.subscription = this.dataContext.onModelChanged.subscribe((change: IPropertyChanged) => {
        this.handleModelChange(change);
      });
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
    if (!this.dataTrigger) {
      this.cdr.detectChanges();
      return;
    }

    const triggers = Array.isArray(this.dataTrigger) ? this.dataTrigger : [this.dataTrigger];
    const hasRelevantChange = triggers.some(trigger => change.names.includes(trigger));

    if (hasRelevantChange) {
      this.cdr.detectChanges();
    }
  }
}
