import { Observable } from "rxjs";

export interface ICommandOf<T> {
  canExecute(commandParameter?: T): boolean;
  execute(commandParameter?: T): void;
  raiseCanExecuteChanged(): void;
  readonly onCanExecuteChanged: Observable<void>;
}

export interface ICommand extends ICommandOf<any> {}
