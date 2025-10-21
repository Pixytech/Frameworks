import { Button } from "@progress/kendo-react-buttons";
import { filePdfIcon, printIcon } from "@progress/kendo-svg-icons";
import { PDFExportProps, savePDF } from "@progress/kendo-react-pdf";
import { EditorView } from "./HtmlEditorViewModel";
import { AutomationHelper } from "../../AutomationHelper";

export interface IPrintHtmlProps  
{
    view:EditorView
}
  
export interface IPdfHtmlProps {
    view:EditorView
    savePdfOptions:PDFExportProps
}

function PdfDomElement(source:Element,options:PDFExportProps,sourceClass:string, ){
    const tempDocument = getDomCloneDocument(source,sourceClass);
    const finalHtml = tempDocument.documentElement.innerHTML;
    const hideFrame = document.createElement("iframe");
    hideFrame.className = "print-frame"

    function setPdf(this: any) {
      const cleanUpTarget = () => {
        document.body.removeChild(this);
      };
      this.contentWindow.onbeforeunload = cleanUpTarget;
      const editor =this.contentWindow.document.getElementById(source.id);
      console.debug("save as PDF",editor);
      savePDF(editor,options,()=>cleanUpTarget())
    }
    hideFrame.onload = setPdf;
    hideFrame.style.zIndex = "-1"; 
    hideFrame.srcdoc = finalHtml;
    document.body.appendChild(hideFrame);
     
}

export const PdfHtml = (props:IPdfHtmlProps) => {
    
    const PdfEditorContent = () => {
    //ProseMirror  /k-editor-content/   k-editor /    html-editor
    
    const targetEditor = props.view.dom.parentElement?.parentElement?.parentElement as HTMLElement;
    PdfDomElement(targetEditor,props.savePdfOptions,"element-print-target-html-editor");
    };
  
    return <Button data-automationid={AutomationHelper.GetId(`pdf-html`)} onClick={PdfEditorContent} svgIcon={filePdfIcon}/>;
  };


function getParentClassName(source:Element):{class:string,id:string,source:boolean}[]
{
  const parentClassNames:{class:string,id:string,source:boolean}[] = [];
      let  elem = source;
      if(elem){
        parentClassNames.push({class:elem.className,id:elem.id,source:true});
       while (elem.parentElement) {
        const data = {class:elem.parentElement.className,id:elem.parentElement.id,source:false};
        if(data.class || data.id && data.id != "root"){
          parentClassNames.push(data);
        }
           elem = elem.parentElement;
       }
     }
     return parentClassNames;
}

function getDomCloneDocument(source:Element,sourceClass:string):Document{
    const parentClassNames =  getParentClassName(source);
    const tempDocument =  new DOMParser().parseFromString(`<html><head></head>
      <body class="print-frame placeholders">      
      </body></html>`, "text/html");
  
      let currentNode = tempDocument.body;
      parentClassNames.reverse().forEach(nodeData => {
            const node = document.createElement("div");
            if(!nodeData.source){
              node.className = `${nodeData.class} placeholders`;
              node.id = `placeholders`;
            }else{
              node.className = `${nodeData.class} element-print-target ${sourceClass}`;
              node.id = source.id;
              for (let index = 0; index < source.children.length; index++) {
                const element = source.children[index];
                node.appendChild(element.cloneNode(true))
              }
            }
            
          
            currentNode.appendChild(node);
            currentNode = node;
      });
  
      document.head.querySelectorAll('link, style').forEach(htmlElement => {
            tempDocument.head.appendChild(htmlElement.cloneNode(true));
      });
  
      tempDocument.close();
      return tempDocument;
}

function setPrint(frame: any) {
    console.debug("setPrint DOM");
  const closePrint = () => {
    document.body.removeChild(frame);
  };
  frame.contentWindow.onbeforeunload = closePrint;
  frame.contentWindow.onafterprint = closePrint;
  frame.contentWindow.print();
}

function printDomElement(source:Element,sourceClass:string){
    console.debug("creating DOM");
    const tempDocument = getDomCloneDocument(source,sourceClass);
    const finalHtml = tempDocument.documentElement.innerHTML;
    const hideFrame = document.createElement("iframe");
    hideFrame.className = "print-frame"
  
    hideFrame.onload = ()=>setPrint(hideFrame);
    hideFrame.style.display = "none";
    hideFrame.srcdoc = finalHtml;
    document.body.appendChild(hideFrame);

}
  
  export const PrintHtml = (props:IPrintHtmlProps) => {
    
    const printEditorContent = () => {
        console.debug("printEditorContent");
        //ProseMirror  /k-editor-content/   k-editor /    html-editor
        let targetEditor = props.view?.dom.parentElement?.parentElement?.parentElement as Element;
        printDomElement(targetEditor,"element-print-target-html-editor");
    };
  
    return <Button data-automationid={AutomationHelper.GetId(`print-html`)}  onClick={printEditorContent} svgIcon={printIcon}/>;
  };