import { EventBase } from './EventBase';
import { Subject } from 'rxjs'
import { SubscriptionToken } from './SubscriptionToken';
import { Action, IDisposable } from '../Core';

/**
 * Pub sub event base
 * @template TPayload
 */
export abstract class PubSubEvent<TPayload = void> extends EventBase {

  private readonly subject:Subject<TPayload> = new Subject<TPayload>();
  /**
   * Subscribes a delegate to an event that will be published on the PublisherThread .
   * @param action 
   * @returns subscribe 
   */
  public subscribe(action: Action<TPayload>): IDisposable {
    let token = this.subject.subscribe(payload=>{ 
      action(payload) 
    });
    return new SubscriptionToken(()=>{ token.unsubscribe();}) ;
  }

  /**
   * Publishes the PubSubEvent .
   * @param payload 
   */
  public publish(payload: TPayload): void {
    this.subject.next(payload);
  }

}
