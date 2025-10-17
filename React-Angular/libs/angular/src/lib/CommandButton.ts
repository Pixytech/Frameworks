import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import type { ICommand } from '@mlp/core';

@Component({
  selector: 'mlp-command-button',
  template: `
    <button 
      [disabled]="!command?.canExecute(commandParameter)"
      (click)="executeCommand()"
      [class]="buttonClass"
      [type]="buttonType">
      <ng-content></ng-content>
    </button>
  `,
  standalone: true
})
export class CommandButtonComponent implements OnInit, OnDestroy {
  private _command?: ICommand;
  private _commandParameter?: any;
  private _buttonClass?: string = '';
  private _buttonType: 'button' | 'submit' | 'reset' = 'button';
  private _commandExecuted = new EventEmitter<any>();

  private subscription?: Subscription;

  @Output()
  get commandExecuted(): EventEmitter<any> {
    return this._commandExecuted;
  }

  @Input()
  set command(value: ICommand | undefined) {
    this._command = value;
  }
  get command(): ICommand | undefined {
    return this._command;
  }

  @Input()
  set commandParameter(value: any) {
    this._commandParameter = value;
  }
  get commandParameter(): any {
    return this._commandParameter;
  }

  @Input()
  set buttonClass(value: string | undefined) {
    this._buttonClass = value;
  }
  get buttonClass(): string | undefined {
    return this._buttonClass;
  }

  @Input()
  set buttonType(value: 'button' | 'submit' | 'reset') {
    this._buttonType = value;
  }
  get buttonType(): 'button' | 'submit' | 'reset' {
    return this._buttonType;
  }

  ngOnInit(): void {
    if (this.command) {
      this.subscription = this.command.onCanExecuteChanged.subscribe(() => {
        // Trigger change detection when command canExecute changes
        // This will be handled by Angular's change detection
      });
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  executeCommand(): void {
    if (this.command && this.command.canExecute(this.commandParameter)) {
      this.command.execute(this.commandParameter);
      this._commandExecuted.emit(this.commandParameter);
    }
  }
}
