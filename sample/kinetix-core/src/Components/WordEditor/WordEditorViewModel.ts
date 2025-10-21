import { IViewModelBase, ViewModelBase } from "../../Mvvm";
export type WordEditorEditOptions = 'edit' | `view`

export interface IWordEditorModel{
  mode:WordEditorEditOptions;
  documentUrl:string; 
  isLoaded:boolean;
}
export class WordEditorModel implements IWordEditorModel {
  isLoaded: boolean = false;
  documentUrl: string;
  mode:WordEditorEditOptions = "view"
    
  }


export interface IWordEditor extends IViewModelBase<IWordEditorModel>{

}

export class WordEditorViewModel extends ViewModelBase<WordEditorModel> implements IWordEditor{
    protected createModel(): WordEditorModel {
        return new WordEditorModel();
    }

}