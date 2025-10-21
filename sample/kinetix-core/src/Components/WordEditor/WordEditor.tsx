import { IWordEditor } from "./WordEditorViewModel";
import "./WordEditor.scss";
import { useViewModelInstance } from "../../Mvvm/ViewComponentBase";

export interface IWordEditorProps  {
  dataContext: IWordEditor;
}

export const WordEditor = (props: IWordEditorProps) => {
  const dataContext = useViewModelInstance(props.dataContext);
  const loadingPanel = (
    <div className="loading-panel">
      <div className="k-loading-mask">
        <span className="k-loading-text">Preparing documents</span>
        <div className="k-loading-image"></div>
        <div className="k-loading-color"></div>
      </div>
    </div>
  );

  
   let url = decodeURIComponent(dataContext.model.documentUrl);
   if(url.includes("&action=default") ){
    url = url.replace("&action=default","")
   }
   if(dataContext.model.mode == "edit"){
    url = `${url}&action=edit`
   }else{
    url = `${url}&action=embedview`
   }
   const proxyUrl = url
   
    return <iframe className="ms-word-frame" src={proxyUrl} >{loadingPanel}</iframe>
}