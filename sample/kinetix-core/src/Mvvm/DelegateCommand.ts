import { Subject, Observable } from "rxjs";
import { ICommandOf } from "./ICommand";

export class DelegateCommandOf<T> implements ICommandOf<T> {
  protected readonly executeDef: (commandParameter: T) => void;
  protected readonly canexecute: (commandParameter: T) => boolean;
  onCanExecuteChanged: Observable<void>;
  canExecuteChangedSubject: Subject<void>;
  constructor(execute: (commandParameter: T) => void, canexecute: (commandParameter: T) => boolean) {
    this.executeDef = execute;
    this.canexecute = canexecute;
    this.canExecuteChangedSubject = new Subject<void>();
    this.onCanExecuteChanged = this.canExecuteChangedSubject;
  }

  raiseCanExecuteChanged(): void {
    this.canExecuteChangedSubject.next();
  }

  canExecute(commandParameter: T): boolean {
    return this.canexecute(commandParameter);
  }

  execute(commandParameter: T): void {
    if (this.canExecute(commandParameter)) {
      this.executeDef(commandParameter);
    }
  }
}

export class DelegateCommand extends DelegateCommandOf<void> {
  canExecute(commandParameter?: void): boolean {
    return super.canExecute(commandParameter);
  }

  execute(commandParameter?: void): void {
    super.execute(commandParameter);
  }
}
