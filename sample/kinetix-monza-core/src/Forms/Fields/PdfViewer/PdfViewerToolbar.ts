import { ViewModelBase } from "@kinetix/core";

export enum PdfStandardTools {
  pager = "pager",
  spacer = "spacer",
  zoomIn = "zoomIn",
  zoomOut = "zoomOut",
  zoom = "zoom",
  selectionText = "selectionText",
  selectionPan = "selectionPan",
  search = "search",
  open = "open",
  download = "download",
  print = "print",
}

export type PdfCustomTools = PdfStandardTools | string;

export class PdfViewerToolbarModel {
  activeTools: PdfCustomTools[] = [];
}

type PartialRecord<K extends PdfCustomTools, T> = { [P in K]?: T };

export class PdfViewerToolbar extends ViewModelBase<PdfViewerToolbarModel> {
  protected createModel(): PdfViewerToolbarModel {
    return new PdfViewerToolbarModel();
  }

  toolsFactory: PartialRecord<PdfCustomTools, React.ReactNode> = {};
  additionalTools?: { [id: string]: React.ReactNode };
}
