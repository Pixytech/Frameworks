import { PubSubEvent } from "../../../Messaging";
import { IEditorMenuItem } from "../HtmlEditorViewModel";

export class EditorMenuSelectEvent extends PubSubEvent<IEditorMenuItem> {
  public static readonly Type = Symbol.for("EditorMenuSelectEvent");
}
