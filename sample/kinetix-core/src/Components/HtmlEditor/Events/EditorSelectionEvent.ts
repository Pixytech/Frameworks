import { Offset } from "@progress/kendo-react-popup";
import { PubSubEvent } from "../../../Messaging";
import { ISelection } from "../HtmlEditorViewModel";

export class EditorSelectionPayload {
  constructor(offset: Offset, selection: ISelection) {
    this.offset = offset;
    this.selection = selection;
  }

  public readonly offset: Offset;
  public readonly selection: ISelection;
}

export class EditorSelectionEvent extends PubSubEvent<EditorSelectionPayload> {
  public static readonly Type = Symbol.for("EditorSelectionEvent");
}
