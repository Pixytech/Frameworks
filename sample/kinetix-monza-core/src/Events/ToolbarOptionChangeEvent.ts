import { PubSubEvent } from "@kinetix/core";

export class ToolbarOptionChangePayload {
  constructor(action: string) {
    this.action = action;
  }

  public readonly action: string;
}

export class ToolbarOptionChangeEvent extends PubSubEvent<ToolbarOptionChangePayload> {
  public static readonly Type = Symbol.for("ToolbarOptionChangeEvent");
}
