import { Decoration, DecorationSet } from "@progress/kendo-editor-common";
import { Plugin, PluginKey } from "prosemirror-state";
import { IHtmlEditor, IHtmlEditorModel, ISelection } from "../HtmlEditorViewModel";

export class SelectionPlugin extends Plugin {
  public static readonly Key = new PluginKey("SelectionPlugin");

  constructor(editor: IHtmlEditor<IHtmlEditorModel>) {
    const selectionHighlightDeco = (doc: any, from: number, to: number) => {
      const decoration = Decoration.inline(from, to, {
        class: "selected-text",
      });
      return DecorationSet.create(doc, [decoration]);
    };
    super({
      key: SelectionPlugin.Key,
      view() {
        return {
          update(updatedEditorView) {
            const selection = updatedEditorView.state.selection;

            if (!selection.empty) {
              const docNode = updatedEditorView.state.doc.cut(selection.from, selection.to);

              const editorSelection: ISelection = {
                from: selection.from,
                to: selection.to,
                text: docNode.textContent,
              };
              console.debug("selection update from ", editor.model.selection, "to", editorSelection);
              editor.updateModel((x) => {
                x.selection = editorSelection;
              });
            } else {
              if (editor.model.selection?.text) {
                editor.updateModel((x) => {
                  console.debug("selection update empty");
                  x.selection = { from: 0, text: undefined, to: 0 };
                });
              }
            }
          },
        };
      },
      state: {
        init(_, { doc, selection }) {
          return selectionHighlightDeco(doc, editor.model.selection.from, editor.model.selection.to);
        },
        apply(tr, old) {
          return selectionHighlightDeco(tr.doc, tr.selection.from, tr.selection.to);
        },
      },
      props: {
        decorations(state) {
          return SelectionPlugin.Key.getState(state);
        },
      },
    });
  }
}
