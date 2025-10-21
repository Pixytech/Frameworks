import { PubSubEvent } from "../../../Messaging";

export class EditorDispatchEventnPayload {
  
  constructor(event: Event) {
    this.event = event;
  }

  public readonly event: Event;
}

export class EditorDispatchEvent extends PubSubEvent<EditorDispatchEventnPayload> {
  public static readonly Type = Symbol.for("EditorDispatchEvent");
}
