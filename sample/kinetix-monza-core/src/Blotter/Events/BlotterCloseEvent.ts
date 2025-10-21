import { PubSubEvent } from "@kinetix/core";
import { IBlotterClose } from "../IBlotterClose";

export class BlotterCloseEventPayload {
  constructor(close: IBlotterClose) {
    this.close = close;
  }

  public readonly close: IBlotterClose;
}

export class BlotterCloseEvent extends PubSubEvent<BlotterCloseEventPayload> {
  public static readonly Type = Symbol.for("BlotterCloseEvent");
}
