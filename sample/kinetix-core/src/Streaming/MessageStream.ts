import { Observable, Subject, Subscription } from "rxjs";
import { IocInjectable } from "../IoC";
import { IDisposable } from "../Core";

export const IMessageStreamType = Symbol.for("IMessageStreamType");

export abstract class StreamBase {}
export interface IStreamAdapter<T extends StreamBase>{
  get stream (): Observable<T[]>;
  get name():string;
  enabled:boolean;
}

@IocInjectable()
export abstract class MessageStream<T extends StreamBase> implements IStreamAdapter<T> {
  private _enabled: boolean = true;
  
  abstract initialize(): Promise<void>;
  public abstract get name (): string;
  
  protected readonly subject: Subject<T[]> = new Subject<T[]>();

  subscription: IDisposable | undefined;

  public abstract get stream (): Observable<T[]>;

  public abstract forceRefresh(): void;

  public process(data: T): void {
    if(this._enabled){
      this.subject.next([data]);
    }
  }

    get enabled(): boolean {
    return this._enabled;
  }

  set enabled(value: boolean) {
    this._enabled = value;
    if (value) {
      this.forceRefresh()
    }
  }

  public isObserved(): boolean {
    return this.subject.observed;
  }
}
