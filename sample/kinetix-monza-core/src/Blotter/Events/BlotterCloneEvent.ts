import { PubSubEvent } from "@kinetix/core";
import { IBlotterClone } from "../IBlotterClone";

export class BlotterCloneEventPayload {
  constructor(clone: IBlotterClone) {
    this.clone = clone;
  }

  public readonly clone: IBlotterClone;
}

export class BlotterCloneEvent extends PubSubEvent<BlotterCloneEventPayload> {
  public static readonly Type = Symbol.for("BlotterCloneEvent");
}
