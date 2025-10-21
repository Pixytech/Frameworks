// reflect-metadata is required for IOC
import "reflect-metadata";
import { IDisposable } from "../Core";
import { IEventAggregator, EventAggregator } from "./EventAggregator";
import { PubSubEvent } from "./PubSubEvent";
import { SubscriptionToken } from "./SubscriptionToken";

// Base Package
describe("Kinetix Core", () => {
  // Scoped module
  let eventAggregator: IEventAggregator;

  // Execute once before all tests
  // To create single module for all tests
  beforeAll(() => {
    eventAggregator = new EventAggregator();
  });

  class TestEvent extends PubSubEvent<TestPayload> {
    public static readonly Type = Symbol.for("TestEvent");
  }

  class TestPayload {
    constructor(data: any) {
      this.name = data.name;
    }

    private name: string = "";

    get Name(): string {
      return this.name;
    }

    set Name(value: string) {
      this.name = value;
    }
  }

  // Testing Component
  describe("EventAggregator", () => {
    // TEST:  Kinetix Core > EventAggregator > should be defined upon event subscription
    it("should be defined upon event subscription", () => {
      /*
       *   Arrange
       */
      // create sample subscriber class
      class Subscriber implements IDisposable {
        subscription: SubscriptionToken;
        name: string = "DefaultName";
        eventAggregator: IEventAggregator;

        constructor(eventAggregator: IEventAggregator) {
          this.eventAggregator = eventAggregator;
        }

        dispose(): void {
          if (this.subscription) this.subscription.dispose();
        }
        /**
         * subscribe
         */
        public subscribe() {
          const event = this.eventAggregator.getEvent<TestEvent>(
            TestEvent,
            TestEvent.Type
          );
        }

        private onMessage(payload: TestPayload) {
          this.name = payload.Name;
        }
      }

      /*
       *   Act
       */

      // instantiate subscriber
      const subscriber = new Subscriber(eventAggregator);

      // instantiate event
      const event = eventAggregator.getEvent<TestEvent>(
        TestEvent,
        TestEvent.Type
      );

      // subscribe
      subscriber.subscribe();

      /*
       *   Assert
       */

      expect(subscriber.name).toBe("DefaultName");

      const payload = new TestPayload({ name: "AfterSubscriptionEvent" });

      event.publish(payload);

      expect(subscriber.name).toBe("DefaultName");

      subscriber.dispose();
    });

    // TEST:  Kinetix Core > EventAggregator > should trigger the event
    it("should trigger the event", () => {
      /*
       *   Arrange
       */
      const event = eventAggregator.getEvent<TestEvent>(
        TestEvent,
        TestEvent.Type
      );
      let isEventTriggered: boolean = false;

      /*
       *   Act
       */
      const subscription = event.subscribe((payload) => {
        isEventTriggered = true;
      });

      event.publish(new TestPayload({ name: "event subscription test" }));
      subscription.dispose();

      /*
       *   Assert
       */
      expect(isEventTriggered).toBe(true);
    });
  });
});
