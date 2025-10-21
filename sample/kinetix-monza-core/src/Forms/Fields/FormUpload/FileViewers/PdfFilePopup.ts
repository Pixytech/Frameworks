import { CompositeDisposable, ContextMenuOpenEvent, CoreTypes, EditorMenuSelectEvent, EditorSelectionEvent, IContainer, IDialogService } from "@kinetix/core";

import { FormModel } from "../../../FormModel";
import { FormViewModel } from "../../../FormViewModel";
import { FormPdfViewerField } from "../../PdfViewer/FormPdfViewerField";
import { PdfStandardTools } from "../../PdfViewer/PdfViewerToolbar";

export class PdfFilePopupModel extends FormModel {
    uploadedFile: string;
  fieldName: string;
    
  }
  
  export class PdfFilePopup extends FormViewModel<PdfFilePopupModel>
  {
    pdfViewer: FormPdfViewerField= new FormPdfViewerField(this);
    pageSubscriptions: CompositeDisposable;
    protected async onFormInitialize(): Promise<void> {
        this.titleBar.model.title = this.model.fieldName;
        this.ticketDialog.initialWidth = 800;
        this.ticketDialog.initialHeight = 800;
        this.ticketDialog.canMaximize = true;
        this.ticketDialog.canMinimize = false;
        this.ticketDialog.canClose = true;
        this.showSubmit = false;
        this.ticketDialog.isModel=true;
    }

   async  onInitializeOnce(): Promise<void> {
      this.pdfViewer.toolbar.updateModel((x) => {
        x.activeTools = [PdfStandardTools.download,PdfStandardTools.print, PdfStandardTools.spacer, PdfStandardTools.zoomIn, PdfStandardTools.zoom, PdfStandardTools.zoomOut, PdfStandardTools.spacer, PdfStandardTools.search, PdfStandardTools.selectionText, PdfStandardTools.selectionPan];
      });
  
    
      this.pdfViewer.model.contextMenus = [{ id: "Copy text", displayName: "Copy text" }];
  
      
      const url = this.model.uploadedFile;
    if (url) {
      const fileName = url.split("/").pop();
      if (fileName) {
        const file_download_path = "/api/file_services/download_base64";
        this.api.get<{ status: string; description: string; value: string }>(`${file_download_path}?fileUrl=${encodeURIComponent(url)}`).subscribe((x) => {
          this.pdfViewer.updateModel((m) => {
            m.pdfContent = x.value;
            m.isLoaded = true;
          });
        });
      }
    } else {
      this.pdfViewer.updateModel((m) => {
        m.isLoaded = true;
      });
    }
    }

    protected async onInitialize(): Promise<void> {
        this.pageSubscriptions = new CompositeDisposable([
          this.pdfViewer.events.getEvent<ContextMenuOpenEvent>(ContextMenuOpenEvent, ContextMenuOpenEvent.Type).subscribe((e) => {
            this.pdfViewer.updateModel((x) => (x.showContextMenu = false));
          }),
      
          this.pdfViewer.events.getEvent<EditorMenuSelectEvent>(EditorMenuSelectEvent, EditorMenuSelectEvent.Type).subscribe((x) => {
            this.onContextMenuSelect(x.id);
          }),
      
          this.pdfViewer.events.getEvent<EditorSelectionEvent>(EditorSelectionEvent, EditorSelectionEvent.Type).subscribe((e) => {
            this.pdfViewer.updateModel((x) => {
              x.showContextMenu = true;
            });
          })
    
        ]);
    }

    protected async onCleanup(): Promise<void> {
      this.pageSubscriptions?.dispose();
    }
    
    async onContextMenuSelect(menu: string): Promise<void> {
      switch (menu) {
        case "Copy text":
          console.debug("Copy selection text", this.pdfViewer.model.selection);
          await navigator.clipboard.writeText(this.pdfViewer.model.selection.text!);
          break;
      }
    }

    protected createModel(): PdfFilePopupModel {
      return new PdfFilePopupModel();
    }

  }

  export const launchDocumentViewer = async (container:IContainer,url:string) : Promise<void>=>{
    const name = `${url}`
    const fileName = name.split(/(\\|\/)/g).pop() || name;
    const fileExtension = name.toLowerCase().split('.').pop()
        if(fileExtension =="pdf"){
            
            const pdfViewerPopup = container.build<PdfFilePopup>(PdfFilePopup);
            const dialogService = container.build<IDialogService>(CoreTypes.IDialogService);
            pdfViewerPopup.model.fieldName = fileName;
            pdfViewerPopup.model.uploadedFile = name;
            await pdfViewerPopup.formInitialize();
            await dialogService.ShowDialog(pdfViewerPopup, {className: "pdf-viewer-popup" });
          }
  }