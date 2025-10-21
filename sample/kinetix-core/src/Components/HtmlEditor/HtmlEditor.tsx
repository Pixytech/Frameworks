import { Editor, EditorMountEvent, EditorProps, EditorUtils } from "@progress/kendo-react-editor";
import { EditorView, Transaction } from "@progress/kendo-editor-common";
import { IEditorMenuItem, IHtmlEditor, IHtmlEditorModel } from "./HtmlEditorViewModel";
import { useViewModelInstance } from "../../Mvvm";
import { ContextMenu, MenuItem } from "@progress/kendo-react-layout";
import { EditorDispatchEvent, EditorSelectionEvent, EditorSelectionPayload } from "./Events";
import { IDisposable, using } from "../../Core";
import React, { useEffect, useState, CSSProperties } from "react";
import "./HtmlEditor.scss";
import { Guid } from "typescript-guid";
import { compileString } from "sass";

export interface IHtmlEditorProps extends EditorProps {
  dataContext: IHtmlEditor<IHtmlEditorModel>;
  fieldContainerStyle?: React.CSSProperties;
  contentStyle?: CSSProperties;
}
export interface IHtmlSnippetProps {
  contentHtml: string;
  className?: string;
  mode?: "iframe" | "div";
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLElement> | undefined;
}

export const HtmlSnippet = React.forwardRef<HTMLDivElement, IHtmlSnippetProps>((props: IHtmlSnippetProps, ref) => {
  const getScopedStyle = (editoId: string, style: string): string => {
    try {
      const cleanStyle = style.replaceAll("<!--", "").replaceAll("-->", "");
      const result = compileString(`#${editoId} .htmlSnippet-body { ${cleanStyle} }`);

      return result.css;
    } catch (e) {
      console.error(e, "Failed to scope style");
      return style;
    }
  };

  const createMarkup = () => {
    const editorId = `editor-${Guid.create()}`;
    const dom = new DOMParser().parseFromString(props.contentHtml, "text/html");
    let styles = "";
    const tempDocument = new DOMParser().parseFromString(
      `<html>
        <head>
        <style> body {max-width:unset !important; padding:0px !important} </style>
        </head>
        <body id="${editorId}-body" class="htmlSnippet-body">      
        </body></html>`,
      "text/html"
    );
    dom.head.querySelectorAll("link, style").forEach((htmlElement) => {
      styles = styles + " " + htmlElement.innerHTML;
    });
    tempDocument.body.innerHTML = dom.body.innerHTML;
    tempDocument.close();

    const scoppedStyles = getScopedStyle(editorId, styles);

    const finalHtml = `<html><head><style id="ext-doc-styles">${scoppedStyles}</style></head><body id="${editorId}"><div class="htmlSnippet-body">${tempDocument.body.innerHTML}</div></body></html>`;
    return { html: finalHtml, editorId: editorId };
  };

  const [htmlContext, sethtmlContext] = useState(createMarkup());

  useEffect(() => {
    sethtmlContext(createMarkup());
  }, [props.contentHtml, props.mode]);
  return (
    <div ref={ref} id={htmlContext.editorId} tabIndex={-1} className={`htmlSnippet ${props.className ? props.className : ""}`} role="presentation">
      {props.mode == "iframe" ? (
        <iframe className={`htmlSnippet-container`} onClick={props.onClick} style={props.style} srcDoc={htmlContext.html}></iframe>
      ) : (
        <>
          <div className={`htmlSnippet-container`} onClick={props.onClick} style={props.style} dangerouslySetInnerHTML={{ __html: htmlContext.html }} />
        </>
      )}
    </div>
  );
});

export const HtmlEditor = React.forwardRef<Editor, IHtmlEditorProps>((props: IHtmlEditorProps, ref) => {
  const dataContext = useViewModelInstance(props.dataContext);
  const [contentHtml, setContentHtml] = useState(dataContext.model.content || "");
  const [editorDispatchEvent, setEditorDispatchEvent] = useState<IDisposable>();
  let internalRef: React.MutableRefObject<Editor | null>;

  const loadingPanel = (
    <div className="loading-panel">
      <div className="k-loading-mask">
        <span className="k-loading-text">Preparing documents</span>
        <div className="k-loading-image"></div>
        <div className="k-loading-color"></div>
      </div>
    </div>
  );
  useEffect(() => {
    if (internalRef?.current?.view) {
      const view = internalRef.current.view;
      if (view && dataContext.model.content) {
        if (contentHtml !== dataContext.model.content) {
          setContentHtml(dataContext.model.content);
          EditorUtils.setHtml(view, dataContext.model.content);
        }
      }
    }
  }, [contentHtml, dataContext.editorId, dataContext.model.content]);

  useEffect(() => {
    const windowRef: any = window;
    if (typeof windowRef.MathJax !== "undefined") {
      const item = document.querySelector("mjx-container");

      if (item) {
        windowRef.MathJax.typeset();
      }
    }
  }, [dataContext.model.loading]);

  const onMount = (e: EditorMountEvent): void | EditorView => {
    const state = e.viewProps.state;
    dataContext.onMount(state);
    editorDispatchEvent?.dispose();
    setEditorDispatchEvent(dataContext.events.getEvent<EditorDispatchEvent>(EditorDispatchEvent, EditorDispatchEvent.Type).subscribe((x) => e.dom.dispatchEvent(x.event)));
    e.dom.onmouseup = (ex) => {
      console.debug("HtmlEditor-onmouseup", e, dataContext.model.selection);
      const selection = dataContext.model.selection;
      if (selection && Math.abs(selection.from - selection.to) > 0) {
        const offset = { left: ex.pageX, top: ex.pageY };
        using(dataContext.SuspendNotifications(), () => {
          dataContext.updateModel((x) => {
            x.contextMenuOffset = offset;
          });
        });
        console.debug("selection update onmouseup", selection);
        dataContext.events.getEvent<EditorSelectionEvent>(EditorSelectionEvent, EditorSelectionEvent.Type).publish(new EditorSelectionPayload(offset, selection));
      }
    };

    const view = new EditorView(
      { mount: e.dom },
      {
        ...e.viewProps,
        state: dataContext.model.editorState || state,
        nodeViews: dataContext.onCreateNodeViews(),
        attributes: {
          id: dataContext.editorId,
        },
      }
    );

    updateReferences(view);
    dataContext.onMountComplete(state);

    return view;
  };

  const updateReferences = (view: EditorView) => {
    dataContext.applyTransaction = (transaction: Transaction) => {
      using(dataContext.SuspendNotifications(), () => {
        try {
          dataContext.updateModel((x) => (x.editorState = view.state.apply(transaction)));
          view.updateState(dataContext.model.editorState);
        } catch (e) {
          console.warn("Unable to update state", e);
        }
      });
    };

    dataContext.model.editorState = view.state;
    dataContext.nodeDOM = (pos: number) => view.nodeDOM(pos);
  };

  const menuItemRender = (items: IEditorMenuItem[]) => {
    return items.map((menu) => {
      return (
        <MenuItem key={menu.id} text={menu.displayName} icon={menu.icon} disabled={menu.disabled} cssClass={menu.isSeparator === true ? "k-separator" : ""} data={{ id: menu.id }}>
          {menu.subItems && menu.subItems.length > 0} && <>{menuItemRender(menu.subItems ?? [])}</>
        </MenuItem>
      );
    });
  };

  return (
    <div
      id={dataContext.editorId}
      tabIndex={-1}
      className="html-editor"
      role="presentation"
      onFocus={(e) => {
        if (props.onFocus) {
          props.onFocus({ target: internalRef.current as Editor, nativeEvent: e.nativeEvent });
        }
      }}
      onBlur={(e) => {
        if (props.onBlur) {
          props.onBlur({ target: internalRef.current as Editor, nativeEvent: e.nativeEvent });
        }
      }}
      onContextMenu={(e) => {
        dataContext.onContextMenu(e);
      }}
    >
      {dataContext.model.contentCss && <style id="ext-doc-styles">{`${dataContext.model.contentCss}`}</style>}
      {dataContext.model.loading ? (
        loadingPanel
      ) : (
        <div className="html-editor-wrapper">
          <Editor
            {...props}
            ref={(e) => {
              internalRef = { current: e };
              const view = e?.view;
              if (view) {
                updateReferences(view);
              }
            }}
            onFocus={(e) => {
              if (props.onFocus) {
                props.onFocus(e);
              }
            }}
            onMount={onMount}
            defaultEditMode="div"
            className={`${props.className ?? ""} editorComponent`}
            defaultContent={contentHtml}
          />
          <ContextMenu className="editorMenu" onSelect={(e) => dataContext.onMenuSelect(e)} show={dataContext.model.showContextMenu && dataContext.model.contextMenus.length > 0} onClose={() => dataContext.updateModel((m) => (m.showContextMenu = false))} offset={dataContext.model.contextMenuOffset}>
            {menuItemRender(dataContext.model.contextMenus)}
          </ContextMenu>
        </div>
      )}

      {dataContext.model.loading && loadingPanel}
    </div>
  );
});
