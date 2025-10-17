import { Subject, Observable } from "rxjs";
import { ICommand, ICommandOf } from "./Interfaces";

export class DelegateCommand implements ICommand {
  private canExecuteSubject = new Subject<void>();
  public readonly onCanExecuteChanged: Observable<void> = this.canExecuteSubject.asObservable();

  constructor(
    private executeAction: (parameter?: any) => void,
    private canExecuteAction?: (parameter?: any) => boolean
  ) {}

  canExecute(commandParameter?: any): boolean {
    return this.canExecuteAction ? this.canExecuteAction(commandParameter) : true;
  }

  execute(commandParameter?: any): void {
    if (this.canExecute(commandParameter)) {
      this.executeAction(commandParameter);
    }
  }

  raiseCanExecuteChanged(): void {
    this.canExecuteSubject.next();
  }
}

export class DelegateCommandOf<T> implements ICommandOf<T> {
  private canExecuteSubject = new Subject<void>();
  public readonly onCanExecuteChanged: Observable<void> = this.canExecuteSubject.asObservable();

  constructor(
    private executeAction: (parameter: T) => void,
    private canExecuteAction?: (parameter: T) => boolean
  ) {}

  canExecute(commandParameter: T): boolean {
    return this.canExecuteAction ? this.canExecuteAction(commandParameter) : true;
  }

  execute(commandParameter: T): void {
    if (this.canExecute(commandParameter)) {
      this.executeAction(commandParameter);
    }
  }

  raiseCanExecuteChanged(): void {
    this.canExecuteSubject.next();
  }
}
