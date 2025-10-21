import { PubSubEvent } from "@kinetix/core";

export class DrawerTogglePayload {
  constructor(data: boolean) {
    this.data = data;
  }

  public readonly data: boolean;
}

export class DrawerToggleEvents extends PubSubEvent<DrawerTogglePayload> {
  public static readonly Type = Symbol.for("DrawerToggleEvents");
}
