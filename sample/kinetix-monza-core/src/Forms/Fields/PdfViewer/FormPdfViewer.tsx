import { Field } from "@progress/kendo-react-form";
import { Subscription } from "rxjs";
import { FormPdfViewerField, PdfSelectionMode } from "./FormPdfViewerField";
import { IFormFieldTemplate, IFieldTemplateContext, FormFieldLayout } from "../FormFieldLayout";
import { IFormFieldComponentProps, useCommonProperties } from "../IFormField";
import { EditorSelectionEvent, EditorSelectionPayload, IEditorMenuItem, ISelection, useViewModelInstance, using } from "@kinetix/core";
import { PDFViewer, LoadEvent, PDFViewerHandle, PDFViewerTool } from "@progress/kendo-react-pdf-viewer";
import { Button, Toolbar, ToolbarItem, ToolbarProps, ToolbarSpacer } from "@progress/kendo-react-buttons";
import "./FormPdfViewer.scss";
import { ContextMenu, MenuItem, Splitter } from "@progress/kendo-react-layout";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { Pager } from "@progress/kendo-react-data-tools";
import { PdfCustomTools, PdfStandardTools, PdfViewerToolbar } from "./PdfViewerToolbar";
import React, { FC, useRef, useState, useEffect } from "react";

interface IFormHtmlEditorFieldProps extends IFormFieldComponentProps {
  dataContext: FormPdfViewerField;
  additionalTools?: { [id: string]: React.ReactNode };
  leftPanel?: any;
  rightPanel?: any;
  selectionMode?: PdfSelectionMode;
  activeTools?: PdfCustomTools[];
}

export interface IPdfViewerToolbarProps {
  dataContext: PdfViewerToolbar;
}
export const PdfViewerToolbarView: FC<IPdfViewerToolbarProps> = (props) => {
  const dataContext = useViewModelInstance(props.dataContext);
  return (
    <>
      {dataContext.model.activeTools.length > 0 && (
        <Toolbar className="pdf-toolbar">
          {dataContext.model.activeTools.map((x: PdfCustomTools,index) => {
            const standardTool = dataContext.toolsFactory[x];
            if (!standardTool && dataContext.additionalTools) {
              return <React.Fragment key={`${x}-${index}`}>{ dataContext.additionalTools[x]}</React.Fragment>;
            }
            return <React.Fragment key={`${x}-${index}`}>{standardTool}</React.Fragment>;
          })}
        </Toolbar>
      )}
    </>
  );
};

export const FormPdfViewerFieldTemplate: IFormFieldTemplate<FormPdfViewerField> = (field: FormPdfViewerField, context: IFieldTemplateContext): any => {
  const fieldRef = useRef<any>(null);

  const viewerRef = React.useRef<HTMLDivElement>(null);
  let pdfViewerRef = React.useRef<PDFViewerHandle>(null);
  const [height, setHeight] = useState(0);
  const [initSelection, setInitSelection] = useState(false);
  const [data, setData] = useState<string | undefined>(undefined);
  const outOfBoxTools: PDFViewerTool[] = ["pager", "spacer", "zoomInOut", "zoom", "selection", "search", "open", "download", "print"];

  const setSize = () => {
    setTimeout(() => {
      if (viewerRef.current && viewerRef.current.scrollHeight > 0) {
        setHeight(viewerRef.current.scrollHeight - 16);
      }
    }, 100);
  };

  useEffect(() => {
    setTimeout(() => {
      setData(field.model.pdfContent);
      setSize();
    }, 100);
  }, [field.model.pdfContent]);

  useEffect(() => {
    let subscription: Subscription | undefined;
    if (fieldRef?.current) {
      subscription = context.onInit(fieldRef);
    }
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [context]);

  useEffect(() => {
    if (!initSelection && field.model.selectionMode) {
      setTimeout(() => {
        try {
          if (field.model.selectionMode == "pan") {
            const paneTool = field.toolbar.toolsFactory[PdfStandardTools.selectionPan] as any;
            if (paneTool?.props.children.props) {
              paneTool.props.children.props.onClick();
              setInitSelection(true);
            }
          } else {
            const textTool = field.toolbar.toolsFactory[PdfStandardTools.selectionText] as any;
            if (textTool?.props.children.props) {
              textTool.props.children.props.onClick();
              setInitSelection(true);
            }
          }
        } catch (e) {}
      }, 1000);
    }
  }, [field.toolbar.toolsFactory]);

  const loadingPanel = (
    <div className="loading-panel">
      <div className="k-loading-mask">
        <span className="k-loading-text">Loading document</span>
        <div className="k-loading-image"></div>
        <div className="k-loading-color"></div>
      </div>
    </div>
  );

  function onPdfLoaded(e: LoadEvent): void {
    if (e.target.element) {
      const textLayer = e.target.element;

      textLayer.onmouseup = (e) => {
        const range = field.tryGetSelectionRange(window.getSelection());

        if (range) {
          const fragment = range.cloneContents();
          const selection: ISelection = { from: range.startOffset | 0, to: range.endOffset | 0, text: `${fragment.textContent}` };
          if (selection && Math.abs(selection.from - selection.to) > 0) {
            const offset = { left: e.pageX, top: e.pageY };
            using(field.SuspendNotifications(), () => {
            field.updateModel((x) => {
              x.contextMenuOffset = offset;
              x.selection = selection;
            });
          });
            console.debug("selection update onmouseup", selection);

            field.events.getEvent<EditorSelectionEvent>(EditorSelectionEvent, EditorSelectionEvent.Type).publish(new EditorSelectionPayload(offset, selection));
          }
        }
      };

      setSize();
      window.onresize = setSize;
    }
  }

  const menuItemRender = (items: IEditorMenuItem[]) => {
    return items.map((menu) => {
      return (
        <MenuItem key={menu.id} text={menu.displayName} icon={menu.icon} disabled={menu.disabled} cssClass={menu.isSeparator === true ? "k-separator" : ""} data={{ id: menu.id }}>
          {menu.subItems && menu.subItems.length > 0} && <>{menuItemRender(menu.subItems ?? [])}</>
        </MenuItem>
      );
    });
  };

  const onRenderToolbar = React.useCallback((toolbarPdf: React.ReactElement<ToolbarProps>) => {
    const buttons = React.Children.toArray(toolbarPdf.props.children);
    // get all on click actions of button
    const pager = buttons[outOfBoxTools.indexOf("pager")] as any;
    const spacer = buttons[outOfBoxTools.indexOf("spacer")] as any;
    const zoomInOut = buttons[outOfBoxTools.indexOf("zoomInOut")] as any;
    const zoom = buttons[outOfBoxTools.indexOf("zoom")] as any;
    const selection = buttons[outOfBoxTools.indexOf("selection")] as any;
    const search = buttons[outOfBoxTools.indexOf("search")] as any;
    const open = buttons[outOfBoxTools.indexOf("open")] as any;
    const download = buttons[outOfBoxTools.indexOf("download")] as any;
    const print = buttons[outOfBoxTools.indexOf("print")] as any;

    
    
    const  tools: { [id: string]: any } = {
      [PdfStandardTools.pager]: pager,
      [PdfStandardTools.spacer]: spacer,
      [PdfStandardTools.zoomIn]: zoomInOut.props.children[0].props,
      [PdfStandardTools.zoom]: zoom,
      [PdfStandardTools.zoomOut]: zoomInOut.props.children[1].props,
      [PdfStandardTools.search]: search,
      [PdfStandardTools.open]: open,
      [PdfStandardTools.download]: download,
      [PdfStandardTools.print]: print,
    };

    field.toolbar.updateModel((m) => {
      field.toolbar.toolsFactory = {
        pager: (
          <ToolbarItem>
            {" "}
            <Pager {...pager.props} />{" "}
          </ToolbarItem>
        ),

        spacer: <ToolbarSpacer {...spacer.props} />,

        download: (
          <ToolbarItem>
            <Button {...download.props} />
          </ToolbarItem>
        ),

        open: (
          <ToolbarItem>
            <Button {...open.props.children[0].props} />
            <div {...open.props.children[1].props} />
          </ToolbarItem>
        ),

        print: (
          <ToolbarItem>
            <Button {...print.props} />
          </ToolbarItem>
        ),
        zoomIn: (
          <ToolbarItem>
            <Button {...zoomInOut.props.children[0].props} />
          </ToolbarItem>
        ),
        zoom: (
          <ToolbarItem>
            <DropDownList className="zoomList" {...zoom.props} />
          </ToolbarItem>
        ),

        zoomOut: (
          <ToolbarItem>
            <Button {...zoomInOut.props.children[1].props} />
          </ToolbarItem>
        ),

        selectionPan: (
          <ToolbarItem>
            <Button {...selection.props.children[1].props} />
          </ToolbarItem>
        ),
        selectionText: (
          <ToolbarItem>
            <Button {...selection.props.children[0].props} />
          </ToolbarItem>
        ),

        search: (
          <ToolbarItem>
            <Button {...search.props} />
          </ToolbarItem>
        ),
      };
      /**CUSTOM Search
       *  <ToolbarItem>
          
          <TextBox onChange={e=>{
             if(pdfViewerRef.current?.element && !field.search){
              const a = Array.from(pdfViewerRef.current?.element.querySelectorAll(".k-text-layer"));
              field.search = new SearchService({
                textContainers: a || [],
                highlightClass: "k-search-highlight",
                highlightMarkClass: "k-search-highlight-mark",
                charClass: "k-text-char"
              });
            }
            field.search.search({text:e.value,matchCase:false})
          }}/>
        </ToolbarItem>
       */
    });

    return <></>;
  }, []);

  return (
    <div ref={viewerRef} tabIndex={-1} className="pdf-viewer" role="presentation">
      <PdfViewerToolbarView dataContext={field.toolbar} />
      {field.model.isLoaded &&
      <Splitter className="pdf-container" panes={field.model.mainPanel} onChange={field.onMainPanelChange}>
      
        {field.model.isLoaded && context.others.leftPanel && <div className="editPanel editPanel-left">{context.others.leftPanel}</div>}
        <div
          className="pdf-container-inner"
          onContextMenu={(e) => {
            field.onContextMenu(e);
          }}
        >
          <PDFViewer ref={pdfViewerRef} onLoad={onPdfLoaded} onRenderToolbar={onRenderToolbar} style={{ height: height - 32 }} data={data} tools={outOfBoxTools} />
          <ContextMenu className="editorMenu" onSelect={(e) => field.onMenuSelect(e)} show={field.model.showContextMenu && field.model.contextMenus.length > 0} onClose={() => field.updateModel((m) => (m.showContextMenu = false))} offset={field.model.contextMenuOffset}>
            {menuItemRender(field.model.contextMenus)}
          </ContextMenu>
        </div>

        {field.model.isLoaded && context.others.rightPanel && <div className="editPanel editPanel-right">{context.others.rightPanel}</div>}
      
      </Splitter>
      }
      {(!field.model.isLoaded || !data) && loadingPanel}
    </div>
  );
};

export const FormPdfViewer: FC<IFormHtmlEditorFieldProps> = (props: IFormHtmlEditorFieldProps) => {
  useCommonProperties(props, () => {
    if (props.additionalTools) {
      props.dataContext.toolbar.additionalTools = props.additionalTools;
    }
    if (props.activeTools) {
      props.dataContext.toolbar.model.activeTools = props.activeTools;
    }
    if (props.selectionMode) {
      props.dataContext.model.selectionMode = props.selectionMode;
    }

  });
  return props.dataContext.model.hidden ? <></> : <Field {...props} className={props.className} component={FormFieldLayout} fieldTemplate={FormPdfViewerFieldTemplate} leftPanel={props.leftPanel} rightPanel={props.rightPanel} dataContext={props.dataContext} name={props.dataContext.name} label={props.dataContext.label} validator={props.dataContext.getValidators()} />;
};
