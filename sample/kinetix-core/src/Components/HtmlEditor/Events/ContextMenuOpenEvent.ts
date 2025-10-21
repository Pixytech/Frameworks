import { Offset } from "@progress/kendo-react-popup";
import { PubSubEvent } from "../../../Messaging";

export class ContextMenuOpenPayload {
  constructor(offset: Offset) {
    this.offset = offset;
  }

  public readonly offset: Offset;
}

export class ContextMenuOpenEvent extends PubSubEvent<ContextMenuOpenPayload> {
  public static readonly Type = Symbol.for("ContextMenuOpenEvent");
}
