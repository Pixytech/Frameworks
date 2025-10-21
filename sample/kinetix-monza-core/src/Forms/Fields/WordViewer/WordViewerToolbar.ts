import { ViewModelBase } from "@kinetix/core";

export enum WordStandardTools {
  
}

export type WordCustomTools = WordStandardTools | string;

export class WordViewerToolbarModel {
  activeTools: WordCustomTools[] = [];
}

type PartialRecord<K extends WordCustomTools, T> = { [P in K]?: T };

export class WordViewerToolbar extends ViewModelBase<WordViewerToolbarModel> {
  protected createModel(): WordViewerToolbarModel {
    return new WordViewerToolbarModel();
  }

  toolsFactory: PartialRecord<WordCustomTools, React.ReactNode> = {};
  additionalTools?: { [id: string]: React.ReactNode };
}
