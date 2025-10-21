import { Action, IDisposable } from "../Core";

/**
 * Subscription token returned from EventBase  on subscribe.
 */
export class SubscriptionToken implements IDisposable {

  /**
   * Determines whether disposed is
   */
  private isDisposed: boolean = false;

  /**
   * Unsubscribe action of subscription token
   */
  private unsubscribeAction: Action<SubscriptionToken>;

  /**
   * Initializes a new instance of SubscriptionToken .
   * @param unsubscribe  
   */
  constructor(unsubscribe: Action<SubscriptionToken>) {
    this.unsubscribeAction = unsubscribe;
  }

  /**
   * Disposes the SubscriptionToken, removing the subscription from the corresponding EventBase .
   */
  dispose(): void {
    if (!this.isDisposed) {
      this.unsubscribeAction(this);
      this.isDisposed = true;
    }
  }
}
