import { ProseMirror } from "@progress/kendo-react-editor";
const { Plugin, PluginKey } = ProseMirror;

export const ReadOnlyPlugin = new Plugin({
  key: new PluginKey("ReadOnlyPlugin"),
  filterTransaction: (tr, _st) => true,
  props: { editable: () => false },
});
