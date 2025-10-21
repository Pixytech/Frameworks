import { FieldModelBase } from "../FieldModelBase";
import { ContextMenuOpenEvent, ContextMenuOpenPayload, EditorMenuSelectEvent, EventAggregator, IEditorMenuItem, IEventAggregator, ISelection, IWordEditorModel, WordEditorEditOptions } from "@kinetix/core";
import { FormField } from "../FormField";
import { MenuSelectEvent, SplitterOnChangeEvent, SplitterPaneProps } from "@progress/kendo-react-layout";
import React from "react";
import { Offset } from "@progress/kendo-react-popup";

import { WordViewerToolbar } from "./WordViewerToolbar";

export class FormWordViewerModel extends FieldModelBase implements IWordEditorModel {
  documentUrl: string;
  mode: WordEditorEditOptions = 'view';
  isLoaded: boolean = false;
  
  showContextMenu: boolean;
  contextMenus: IEditorMenuItem[] = [];
  contextMenuOffset: Offset;
  selectionMode?: WordSelectionMode;
  selection: ISelection = { from: 0, to: 0, text: "" };
  mainPanel: SplitterPaneProps[] =[];
  leftPanel?: SplitterPaneProps;
  rightPanel?: SplitterPaneProps;
}

export type WordSelectionMode = "pan" | "text";
export class FormWordViewerField extends FormField<FormWordViewerModel> {

  public readonly type: string = "FormWordViewerField";

  public readonly events: IEventAggregator = new EventAggregator();
  public readonly toolbar: WordViewerToolbar = new WordViewerToolbar();
  

  onContextMenu(e: React.MouseEvent<HTMLDivElement, MouseEvent>): void {
    console.debug("on WordEditor onContextMenu", e);
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

  protected createModel(): FormWordViewerModel {
    return new FormWordViewerModel();
  }

  tryGetSelectionRange(selection: Selection | null): Range | undefined {
    try {
      const range = selection?.getRangeAt(0);
      return range;
    } catch (e) {}
  }
}
