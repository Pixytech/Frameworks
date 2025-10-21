import { Field } from "@progress/kendo-react-form";
import { Subscription } from "rxjs";
import { FormWordViewerField, WordSelectionMode } from "./FormWordViewerField";
import { IFormFieldTemplate, IFieldTemplateContext, FormFieldLayout } from "../FormFieldLayout";
import { IFormFieldComponentProps, useCommonProperties } from "../IFormField";
import { IEditorMenuItem, useViewModelInstance, WordEditor } from "@kinetix/core";

import { Toolbar } from "@progress/kendo-react-buttons";
import "./FormWordViewer.scss";
import { ContextMenu, MenuItem, Splitter } from "@progress/kendo-react-layout";
import { WordCustomTools, WordViewerToolbar } from "./WordViewerToolbar";
import React, { FC, useRef, useState, useEffect } from "react";

interface IFormHtmlEditorFieldProps extends IFormFieldComponentProps {
  dataContext: FormWordViewerField;
  additionalTools?: { [id: string]: React.ReactNode };
  leftPanel?: any;
  rightPanel?: any;
  selectionMode?: WordSelectionMode;
  activeTools?: WordCustomTools[];
}

export interface IWordViewerToolbarProps {
  dataContext: WordViewerToolbar;
}
export const WordViewerToolbarView: FC<IWordViewerToolbarProps> = (props) => {
  const dataContext = useViewModelInstance(props.dataContext);
  return (
    <>
      {dataContext.model.activeTools.length > 0 && (
        <Toolbar className="Word-toolbar">
          {dataContext.model.activeTools.map((x: WordCustomTools,index) => {
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

export const FormWordViewerFieldTemplate: IFormFieldTemplate<FormWordViewerField> = (field: FormWordViewerField, context: IFieldTemplateContext): any => {
  const fieldRef = useRef<any>(null);

  const viewerRef = React.useRef<HTMLDivElement>(null);
  
  
  const [initSelection, setInitSelection] = useState(false);
  
  


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



  const loadingPanel = (
    <div className="loading-panel">
      <div className="k-loading-mask">
        <span className="k-loading-text">Loading document</span>
        <div className="k-loading-image"></div>
        <div className="k-loading-color"></div>
      </div>
    </div>
  );

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
    <div ref={viewerRef} tabIndex={-1} className="word-viewer" role="presentation">
      <WordViewerToolbarView dataContext={field.toolbar} />
      {field.model.isLoaded &&
      <Splitter className="Word-container" panes={field.model.mainPanel} onChange={field.onMainPanelChange}>
      
        {field.model.isLoaded && context.others.leftPanel && <div className="editPanel editPanel-left">{context.others.leftPanel}</div>}
        <div
          className="Word-container-inner"
          onContextMenu={(e) => {
            field.onContextMenu(e);
          }}
        >
          <WordEditor dataContext={field} />
          <ContextMenu className="editorMenu" onSelect={(e) => field.onMenuSelect(e)} show={field.model.showContextMenu && field.model.contextMenus.length > 0} onClose={() => field.updateModel((m) => (m.showContextMenu = false))} offset={field.model.contextMenuOffset}>
            {menuItemRender(field.model.contextMenus)}
          </ContextMenu>
        </div>

        {field.model.isLoaded && context.others.rightPanel && <div className="editPanel editPanel-right">{context.others.rightPanel}</div>}
      
      </Splitter>
      }
      {(!field.model.isLoaded) && loadingPanel}
    </div>
  );
};

export const FormWordViewer: FC<IFormHtmlEditorFieldProps> = (props: IFormHtmlEditorFieldProps) => {
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
  return props.dataContext.model.hidden ? <></> : <Field {...props} className={props.className} component={FormFieldLayout} fieldTemplate={FormWordViewerFieldTemplate} leftPanel={props.leftPanel} rightPanel={props.rightPanel} dataContext={props.dataContext} name={props.dataContext.name} label={props.dataContext.label} validator={props.dataContext.getValidators()} />;
};
