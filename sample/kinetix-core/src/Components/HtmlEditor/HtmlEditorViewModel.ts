import { EditorUtils, PasteCleanupSettings, ProseMirror } from "@progress/kendo-react-editor";
import { Schema, Transaction, Node, NodeViewConstructor } from "@progress/kendo-editor-common";
import { EditorState, Plugin } from "prosemirror-state";
import { IViewModelBase, ViewModelBase } from "../../Mvvm";
import { using } from "../../Core";
import { Offset } from "@progress/kendo-react-popup";
import { MenuSelectEvent } from "@progress/kendo-react-layout";
import { EventAggregator, IEventAggregator } from "../../Messaging";
import { ContextMenuOpenEvent, ContextMenuOpenPayload } from "./Events/ContextMenuOpenEvent";
import { EditorMenuSelectEvent } from "./Events/EditorMenuSelectEvent";
import { SelectionPlugin } from "./Plugins/SelectionPlugin";
import React from "react";
import { Guid } from "typescript-guid";
import { DOMParser as PrDOMParser, ParseOptions } from "prosemirror-model";
import { compileString } from "sass";
const { pasteCleanup, sanitize, sanitizeClassAttr, sanitizeStyleAttr, removeAttribute } = EditorUtils;
export type DOMNode = InstanceType<typeof window.Node>;

export interface ISelection {
  from: number;
  to: number;
  text: string | undefined;
  html?: string | undefined;
}
export interface IHtmlEditorModel {
  selection: ISelection;
  contextMenuOffset: Offset;
  contentCss?: string;
  content?: string;
  value?: Node | string;
  editorState: EditorState;
  showContextMenu: boolean;
  contextMenus: IEditorMenuItem[];
  loading: boolean;
}

export class IEditorMenuItem {
  id: string;
  displayName?: string;
  icon?: string;
  isSeparator?: boolean;
  disabled?: boolean;
  subItems?: IEditorMenuItem[];
}

export class HtmlEditorModel implements IHtmlEditorModel {
  contextMenuOffset: Offset = { left: 0, top: 0 };
  contentCss?: string;
  editorState: EditorState;
  showContextMenu: boolean = false;
  contextMenus: IEditorMenuItem[] = [];
  content?: string = "";
  value?: Node | string;
  loading: boolean = false;
  selection: ISelection = { from: 0, text: undefined, to: 0 };
}

export class EditorView extends ProseMirror.EditorView {}

export interface IEditorReferenceProvider {
  readonly editorId: string;
  getEditorReference(): IEditorReference;
}

export interface IEditorReference {
  state: EditorState;
  applyTransaction: (transaction: Transaction) => void;
  nodeDOM(pos: number): DOMNode | null;
}

export interface IHtmlEditor<TModel extends IHtmlEditorModel> extends IViewModelBase<TModel>, IEditorReferenceProvider {
  applyTransaction: (transaction: Transaction) => void;
  nodeDOM(pos: number): DOMNode | null;
  readonly events: IEventAggregator;
  onMenuSelect(e: MenuSelectEvent): void;
  onContextMenu(e: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
  onMount(state: EditorState): void;
  onMountComplete(state: EditorState): void;
  onCreatePlugins(plugins: Plugin<any>[]): Plugin<any>[];
  onCreateSchema(schema: Schema<any, any>): Schema<any, any>;
  onPreprocessHtml(html: string): string;
  onCreateNodeViews(): { [node: string]: NodeViewConstructor } | undefined;
  onSetStyle(style?: string): void;
}

export class HtmlEditorViewModel<TModel extends IHtmlEditorModel> extends ViewModelBase<TModel> implements IHtmlEditor<TModel> {
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

  getEditorReference(): IEditorReference {
    return { state: this.model.editorState, nodeDOM: (pos) => this.nodeDOM(pos), applyTransaction: this.applyTransaction };
  }

  onMenuSelect(e: MenuSelectEvent): void {
    HtmlEditorHelpers.onMenuSelect(this, e);
  }

  onContextMenu(e: React.MouseEvent<HTMLDivElement, MouseEvent>): void {
    HtmlEditorHelpers.onContextMenu(this, e);
  }

  getHtml = () => {
    return HtmlEditorHelpers.getHtml(this);
  };

  protected createModel(): TModel {
    return new HtmlEditorModel() as TModel;
  }

  onMount(state: EditorState): void {
    HtmlEditorHelpers.onMount(this, state);
  }

  onMountComplete(state: EditorState): void {}

  public onCreatePlugins(plugins: Plugin<any>[]): Plugin<any>[] {
    return plugins;
  }

  public onCreateSchema(schema: Schema<any, any>): Schema<any, any> {
    return schema;
  }

  public onPreprocessHtml(html: string): string {
    return html;
  }

  public onCreateNodeViews(): { [node: string]: NodeViewConstructor } | undefined {
    return undefined;
  }

  public onSetStyle = (style?: string) => {
    this.updateModel((m) => (m.contentCss = style ? HtmlEditorHelpers.getScopedStyle(this, style) : undefined));
  };
}

export abstract class HtmlEditorHelpers {
  static readonly proseMirrorClassName = "ProseMirror";

  static onMenuSelect<TModel extends IHtmlEditorModel>(editor: IHtmlEditor<TModel>, e: MenuSelectEvent): void {
    editor.updateModel((x) => (x.showContextMenu = false));
    const selectedMenu = editor.model.contextMenus.find((x) => x.id == e.item.data.id);
    selectedMenu && editor.events.getEvent<EditorMenuSelectEvent>(EditorMenuSelectEvent, EditorMenuSelectEvent.Type).publish(selectedMenu);
  }

  static getScopedStyle<TModel extends IHtmlEditorModel>(editor: IHtmlEditor<TModel>, style: string): string {
    try {
      const cleanStyle = style.replaceAll("<!--", "").replaceAll("-->", "");
      const result = compileString(`#${editor.editorId} .${HtmlEditorHelpers.proseMirrorClassName} { ${cleanStyle} }`);

      return result.css;
    } catch (e) {
      console.error(e, "Failed to scope style");
      return style;
    }
  }

  /**
   * Normalizes document-level styles for snippet usage by removing excessive margins and spacing
   * @param style The CSS style string
   * @returns Normalized CSS style string
   */
  public static sanitizeStyle(style: string): string {
    try {
      let normalizedStyle = style;

      // Remove or reduce excessive top and bottom margins that are meant for full documents
      // Handle any margin values, not just specific ones like 12pt
      normalizedStyle = normalizedStyle.replace(/margin-top:\s*[0-9.]+pt;/gi, "margin-top: 0;");
      normalizedStyle = normalizedStyle.replace(/margin-bottom:\s*[0-9.]+pt;/gi, "margin-bottom: 0;");
      normalizedStyle = normalizedStyle.replace(/margin-left:\s*[0-9.]+pt;/gi, "margin-left: 0;");
      normalizedStyle = normalizedStyle.replace(/margin-right:\s*[0-9.]+pt;/gi, "margin-right: 0;");

      // Handle margin values with other units (in, cm, mm, px)
      normalizedStyle = normalizedStyle.replace(/margin-top:\s*[0-9.]+(in|cm|mm|px);/gi, "margin-top: 0;");
      normalizedStyle = normalizedStyle.replace(/margin-bottom:\s*[0-9.]+(in|cm|mm|px);/gi, "margin-bottom: 0;");
      normalizedStyle = normalizedStyle.replace(/margin-left:\s*[0-9.]+(in|cm|mm|px);/gi, "margin-left: 0;");
      normalizedStyle = normalizedStyle.replace(/margin-right:\s*[0-9.]+(in|cm|mm|px);/gi, "margin-right: 0;");

      // Reduce excessive padding that might be meant for document layout
      normalizedStyle = normalizedStyle.replace(/padding-top:\s*[0-9.]+pt;/gi, "padding-top: 0;");
      normalizedStyle = normalizedStyle.replace(/padding-bottom:\s*[0-9.]+pt;/gi, "padding-bottom: 0;");
      normalizedStyle = normalizedStyle.replace(/padding-left:\s*[0-9.]+pt;/gi, "padding-left: 0;");
      normalizedStyle = normalizedStyle.replace(/padding-right:\s*[0-9.]+pt;/gi, "padding-right: 0;");

      // Handle padding values with other units
      normalizedStyle = normalizedStyle.replace(/padding-top:\s*[0-9.]+(in|cm|mm|px);/gi, "padding-top: 0;");
      normalizedStyle = normalizedStyle.replace(/padding-bottom:\s*[0-9.]+(in|cm|mm|px);/gi, "padding-bottom: 0;");
      normalizedStyle = normalizedStyle.replace(/padding-left:\s*[0-9.]+(in|cm|mm|px);/gi, "padding-left: 0;");
      normalizedStyle = normalizedStyle.replace(/padding-right:\s*[0-9.]+(in|cm|mm|px);/gi, "padding-right: 0;");

      // Keep line-height as is - don't normalize it
      // normalizedStyle = normalizedStyle.replace(/line-height:\s*108%;/gi, 'line-height: 1.4;');
      // normalizedStyle = normalizedStyle.replace(/line-height:\s*150%;/gi, 'line-height: 1.5;');
      // normalizedStyle = normalizedStyle.replace(/line-height:\s*180%;/gi, 'line-height: 1.6;');

      // Remove excessive text-indent that might be meant for document formatting
      normalizedStyle = normalizedStyle.replace(/text-indent:\s*-?[0-9.]+(in|cm|mm|pt|px);/gi, "text-indent: 0;");

      // Keep font sizes as is - don't normalize them
      // normalizedStyle = normalizedStyle.replace(/font-size:\s*28pt;/gi, 'font-size: 18px;');
      // normalizedStyle = normalizedStyle.replace(/font-size:\s*10pt;/gi, 'font-size: 12px;');
      // normalizedStyle = normalizedStyle.replace(/font-size:\s*10\.5pt;/gi, 'font-size: 13px;');

      // Keep pt units as is - don't convert to px
      // normalizedStyle = normalizedStyle.replace(/font-size:\s*(\d+(?:\.\d+)?)pt/gi, (match, size) => {
      //   const ptSize = parseFloat(size);
      //   const pxSize = Math.round(ptSize * 1.33); // Convert pt to px
      //   return `font-size: ${pxSize}px`;
      // });

      // Remove any page-break related properties
      normalizedStyle = normalizedStyle.replace(/page-break-[^;]+;/gi, "");

      // Remove any widows/orphans properties
      normalizedStyle = normalizedStyle.replace(/widows:\s*[^;]+;/gi, "");
      normalizedStyle = normalizedStyle.replace(/orphans:\s*[^;]+;/gi, "");

      // Add some basic normalization for better editor experience
      normalizedStyle += `
        /* Normalize basic elements for editor snippet usage */
        p { margin: 0 0 0.5em 0; }
        h1, h2, h3, h4, h5, h6 { margin: 0.5em 0; }
        table { margin: 0.5em 0; }
        ul, ol { margin: 0.5em 0; padding-left: 1.5em; }
        li { margin: 0.2em 0; }
      `;

      // Normalize Word-generated classes specifically
      normalizedStyle = HtmlEditorHelpers.normalizeWordClasses(normalizedStyle);

      console.debug("Document styles normalized for snippet usage");

      return normalizedStyle;
    } catch (error) {
      console.error("Error normalizing document styles:", error);
      return style; // Return original if normalization fails
    }
  }

  /**
   * Normalizes Word-generated classes to remove excessive spacing for snippet usage
   * @param style The CSS style string
   * @returns Normalized CSS style string
   */
  private static normalizeWordClasses(style: string): string {
    try {
      let normalizedStyle = style;

      // Find all Word-generated class selectors and normalize their margins/padding
      const wordClassPattern = /\.pt-[a-zA-Z0-9-]+/g;
      const wordClasses = [];
      let match;

      while ((match = wordClassPattern.exec(style)) !== null) {
        wordClasses.push(match[0]);
      }

      // For each Word class, ensure it has normalized spacing
      wordClasses.forEach((wordClass) => {
        // Remove excessive margins and padding from Word classes
        normalizedStyle = normalizedStyle.replace(new RegExp(`${wordClass.replace(".", "\\.")}\\s*\\{[^}]*\\}`, "g"), (match) => {
          // Remove margin and padding properties, keep other styling
          let cleanedRule = match.replace(/margin[^;]*;/g, "");
          cleanedRule = cleanedRule.replace(/padding[^;]*;/g, "");

          // Add normalized spacing
          cleanedRule = cleanedRule.replace("{", "{ margin: 0; padding: 0; ");

          return cleanedRule;
        });
      });

      // Add specific overrides for common Word class patterns
      normalizedStyle += `
        /* Override Word-generated classes for snippet usage */
        .pt-Body, .pt-Body2, .pt-Body3, .pt-Body4 { margin: 0 0 0.5em 0 !important; }
        .pt-Normal { margin: 0 0 0.3em 0 !important; }
        .pt-Heading1, .pt-Heading2, .pt-Heading3 { margin: 0.5em 0 0.3em 0 !important; }
        .pt-DefaultParagraphFont { margin: 0 !important; padding: 0 !important; }
      `;

      return normalizedStyle;
    } catch (error) {
      console.error("Error normalizing Word classes:", error);
      return style; // Return original if normalization fails
    }
  }

  static sanitizeHtml(htmlSource: string): string {
    const pasteSettings: PasteCleanupSettings = {
      convertMsLists: true,
      // stripTags: 'span|font'
      attributes: {
        class: sanitizeClassAttr,
        style: sanitizeStyleAttr,

        // keep `width`, `height` and `src` attributes
        width: () => {},
        height: () => {},

        src: () => {},

        // Removes `lang` attribute
        // lang: removeAttribute,

        // removes other (unspecified above) attributes
        "*": removeAttribute,
      },
    };
    let html = pasteCleanup(sanitize(htmlSource), pasteSettings);
    console.debug("sanitizeHtml", html);
    return html;
  }

  static onContextMenu<TModel extends IHtmlEditorModel>(editor: IHtmlEditor<TModel>, e: React.MouseEvent<HTMLDivElement, MouseEvent>): void {
    console.debug("on HtmlEditor onContextMenu", e);
    e.preventDefault();
    editor.events.getEvent<ContextMenuOpenEvent>(ContextMenuOpenEvent, ContextMenuOpenEvent.Type).publish(new ContextMenuOpenPayload({ left: e.pageX, top: e.pageY }));
  }

  static getTextFromHtml(html: string): string {
    const dom = new DOMParser().parseFromString(html, "text/html");
    return `${dom.body.textContent}`;
  }

  static getHtml<TModel extends IHtmlEditorModel>(editor: IHtmlEditor<TModel>, skipWraping: boolean = false): string {
    console.debug("getHtml", editor.model.editorState);
    const content = editor.model.editorState ? EditorUtils.getHtml(editor.model.editorState) : "";
    console.debug("getHtml-Content", content);
    return !skipWraping
      ? `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><meta content="text/html; charset=utf-8" http-equiv="Content-Type"/><title>output</title></head><body>
    ${content}</body></html>`
      : content;
  }

  static createDocument(schema: Schema<any, any>, html: string): Node {
    const dom = new DOMParser().parseFromString(html, "text/html");
    const options: ParseOptions = { preserveWhitespace: true };
    return PrDOMParser.fromSchema(schema).parse(dom, options);
  }

  static getEditorPlugins<TModel extends IHtmlEditorModel>(editor: IHtmlEditor<TModel>): Plugin<any>[] {
    return [new SelectionPlugin(editor)];
  }

  static onMount<TModel extends IHtmlEditorModel>(editor: IHtmlEditor<TModel>, state: EditorState): void {
    //console.debug("on HtmlEditor Mount", state);

    using(editor.SuspendNotifications(), () => {
      editor.updateModel((x) => {
        const schema = editor.onCreateSchema(state.schema);
        const plugins = editor.onCreatePlugins([...state.plugins, ...HtmlEditorHelpers.getEditorPlugins(editor)]);

        const html = editor.model.content ? editor.onPreprocessHtml(editor.model.content) : "";
        x.editorState = EditorState.create({ doc: HtmlEditorHelpers.createDocument(schema || state.schema, html), plugins: plugins || [...state.plugins] });
      });
    });
  }
}
