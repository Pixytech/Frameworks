import { PubSubEvent } from "@kinetix/core";

export class HeaderNamePayload {
  constructor(data: string) {
    this.data = data;
  }

  public readonly data: string;
}

export class HeaderNameEvents extends PubSubEvent<HeaderNamePayload> {
  public static readonly Type = Symbol.for("HeaderNameEvents");
}
