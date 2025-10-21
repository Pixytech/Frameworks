import { FieldModelBase } from "../FieldModelBase";
import { DOMNode, EventAggregator, HtmlEditorHelpers, IEditorMenuItem, IEventAggregator, IHtmlEditor, IHtmlEditorModel, IEditorReference, ISelection } from "@kinetix/core";
import { EditorState, Plugin } from "prosemirror-state";
import { Schema, Transaction, Node, NodeViewConstructor } from "@progress/kendo-editor-common";
import { Offset } from "@progress/kendo-react-popup";
import { FormField } from "../FormField";
import { Guid } from "typescript-guid";
import { MenuSelectEvent } from "@progress/kendo-react-layout";
import React from "react";

export class FormHtmlEditorModel extends FieldModelBase implements IHtmlEditorModel {
  contextMenuOffset: Offset = { left: 0, top: 0 };
  contentCss?: string;
  originalCss?: string;
  editorState: EditorState;
  showContextMenu: boolean = false;
  contextMenus: IEditorMenuItem[] = [];
  selection: ISelection = { from: 0, text: undefined, to: 0 };
  content?: string = "";
  loading: boolean = false;
}

export class FormHtmlEditorField extends FormField<FormHtmlEditorModel> implements IHtmlEditor<FormHtmlEditorModel> {
  public readonly type: string = "FormHtmlEditorField";
  public readonly editorId: string = `editor-${Guid.create()}`;

  nodeDOM(pos: number): DOMNode | null {
    console.debug("nodeDOM");
    return null;
  }

  applyTransaction(transaction: Transaction) {
    console.debug("applyTransaction", transaction);
    throw new Error("View is not ready to apply transactions");
  }

  public readonly events: IEventAggregator = new EventAggregator();

  onContextMenu(e: React.MouseEvent<HTMLDivElement, MouseEvent>): void {
    HtmlEditorHelpers.onContextMenu(this, e);
  }

  getEditorReference(): IEditorReference {
    return { state: this.model.editorState, nodeDOM: (pos) => this.nodeDOM(pos), applyTransaction: this.applyTransaction };
  }

  getHtml = (skipWraping: boolean = false) => {
    return HtmlEditorHelpers.getHtml(this, skipWraping);
  };

  onMenuSelect(e: MenuSelectEvent): void {
    HtmlEditorHelpers.onMenuSelect(this, e);
  }

  protected createModel(): FormHtmlEditorModel {
    return new FormHtmlEditorModel();
  }

  public get value(): Node | string | undefined {
    return this.model.value;
  }

  public set value(value: Node | string | undefined) {
    super.setValue(value);
  }

  onMount(state: EditorState): void {
    HtmlEditorHelpers.onMount(this, state);
  }

  onMountComplete(state: EditorState): void {}

  public onCreateSchema(schema: Schema<any, any>): Schema<any, any> {
    return schema;
  }

  public onCreatePlugins(plugins: Plugin<any>[]): Plugin<any>[] {
    return plugins;
  }

  onPreprocessHtml(html: string): string {
    return html;
  }

  onCreateNodeViews(): { [node: string]: NodeViewConstructor } | undefined {
    return undefined;
  }

  onSetStyle(style?: string): void {
    this.updateModel((m) => {
      m.contentCss = style ? HtmlEditorHelpers.getScopedStyle(this, style) : undefined;
      m.originalCss = style;
    });
  }
}
