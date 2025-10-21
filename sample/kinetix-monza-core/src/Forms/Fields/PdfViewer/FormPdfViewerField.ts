import { FieldModelBase } from "../FieldModelBase";
import { ContextMenuOpenEvent, ContextMenuOpenPayload, EditorMenuSelectEvent, EventAggregator, IEditorMenuItem, IEventAggregator, ISelection } from "@kinetix/core";
import { FormField } from "../FormField";
import { MenuSelectEvent, SplitterOnChangeEvent, SplitterPaneProps } from "@progress/kendo-react-layout";
import React from "react";
import { Offset } from "@progress/kendo-react-popup";

import { PdfViewerToolbar } from "./PdfViewerToolbar";

export class FormPdfViewerModel extends FieldModelBase {
  isLoaded: boolean = false;
  pdfContent: string;
  showContextMenu: boolean;
  contextMenus: IEditorMenuItem[] = [];
  contextMenuOffset: Offset;
  selectionMode?: PdfSelectionMode;
  selection: ISelection = { from: 0, to: 0, text: "" };
  mainPanel: SplitterPaneProps[] =[];
  leftPanel?: SplitterPaneProps;
  rightPanel?: SplitterPaneProps;
}

export type PdfSelectionMode = "pan" | "text";
export class FormPdfViewerField extends FormField<FormPdfViewerModel> {

  public readonly type: string = "FormPdfViewerField";

  public readonly events: IEventAggregator = new EventAggregator();
  public readonly toolbar: PdfViewerToolbar = new PdfViewerToolbar();
  

  onContextMenu(e: React.MouseEvent<HTMLDivElement, MouseEvent>): void {
    console.debug("on PdfEditor onContextMenu", e);
    e.preventDefault();
    this.events.getEvent<ContextMenuOpenEvent>(ContextMenuOpenEvent, ContextMenuOpenEvent.Type).publish(new ContextMenuOpenPayload({ left: e.pageX, top: e.pageY }));
  }

  onMainPanelChange = (event: SplitterOnChangeEvent): void => {
    this.updateModel((m) => {
      m.mainPanel = event.newState;
    });
  };

  protected async onInitializeOnce(): Promise<void> {
      this.updateModel(x=>{
        if(x.leftPanel){
          x.mainPanel.push(x.leftPanel)
        }
        x.mainPanel.push({})
        if(x.rightPanel){
          x.mainPanel.push(x.rightPanel)
        }
      })
  }

  onMenuSelect(e: MenuSelectEvent): void {
    this.updateModel((x) => (x.showContextMenu = false));
    const selectedMenu = this.model.contextMenus.find((x) => x.id == e.item.data.id);
    selectedMenu && this.events.getEvent<EditorMenuSelectEvent>(EditorMenuSelectEvent, EditorMenuSelectEvent.Type).publish(selectedMenu);
  }

  protected createModel(): FormPdfViewerModel {
    return new FormPdfViewerModel();
  }

  tryGetSelectionRange(selection: Selection | null): Range | undefined {
    try {
      const range = selection?.getRangeAt(0);
      return range;
    } catch (e) {}
  }
}
