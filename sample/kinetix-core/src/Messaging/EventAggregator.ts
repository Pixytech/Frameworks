import { type IApplicationCache, IApplicationCacheType } from "../ApplicationCache";
import { Type, TypeDescriptor } from "../Core";
import { IocInject, IocInjectable } from "../IoC/Injectables";
import { EventBase } from "./EventBase";

/**
 * Defines an interface to get instances of an event type.
 */
export interface IEventAggregator {
  /**
   * Gets an instance of an event type.
   * @template TEventType typeoof EventBase
   * @param type represent the class
   * @returns event of TEventType
   */

  getEvent<TEventType extends EventBase>(type: Type<TEventType>, name: symbol,appName?:string): TEventType;
}

/**
 * Event aggregator Implements IEventAggregator .
 */

@IocInjectable()
export class EventAggregator implements IEventAggregator {
  /**
   * Events  of event aggregator
   */
  private readonly events: Map<string, EventBase> = new Map<string, EventBase>();
  appCache: IApplicationCache | undefined;

  constructor();
  constructor(@IocInject(IApplicationCacheType) appCache?: IApplicationCache) {
        this.appCache = appCache;
      }
      
  /**
   * Gets instance of event type
   * @template TEventType typeoof EventBase
   * @param type represent the class
   * @param appName (optional) app name to allow cross app events
   * @returns event of TEventType
   */
  getEvent<TEventType extends EventBase>(type: Type<TEventType>, name: symbol,appName?:string): TEventType {
    let result: TEventType;
    // allow events not to be leaked to other apps
    
    const callerAppName = appName || this.appCache?.appState["app.name"];
    var key = `${callerAppName}-${name.toString()}` ;
    if (!this.events.has(key)) {
      var tEventType: TEventType = TypeDescriptor.create(type);
      this.events.set(key, tEventType);
      result = tEventType;
    } else {
      var eventBase = this.events.get(key);
      result = eventBase as TEventType;
    }

    return result;
  }
}
