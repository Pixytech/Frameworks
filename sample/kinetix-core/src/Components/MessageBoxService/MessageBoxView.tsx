import { TextArea } from "@progress/kendo-react-inputs";
import { FC } from "react";
import { useViewModelInstance } from "../../Mvvm";
import { MessageBoxViewModel } from "./MessageBoxViewModel";
import "./MessageBox.scss"
import { Button } from "@progress/kendo-react-buttons";
import { MessageBoxButton } from "./MessageBoxButton";
import { MessageBoxResult } from "./MessageBoxResult";
import { HtmlEditor } from "../HtmlEditor/HtmlEditor";


interface IMessageBoxProps {
    dataContext: MessageBoxViewModel;
  }
  
  export const MessageBoxView: FC<IMessageBoxProps> = (props: IMessageBoxProps) => {
    const dataContext = useViewModelInstance(props.dataContext);
    
    return<div className="messageBox">
              <div className="messageBox-contents">
                <div className="messageBox-icon">
                  <div className={dataContext.getIconClassName(dataContext.IconType)}></div>
                </div>
                <div className="messageBox-message">
                {dataContext.IsHtmlContents? <HtmlEditor className="html-message" dataContext={dataContext.MessgaeBoxHtml} />:<TextArea 
                className="textarea"
                fillMode={'flat'}
                readOnly={true}
                value={dataContext.MessgaeBoxText} />}
                </div>
                
              </div>

              <div className="messageBox-actions">
                  {dataContext.Buttons === MessageBoxButton.Ok && <Button className="okButton" onClick={()=>dataContext.Command.execute(MessageBoxResult.Ok)}>{dataContext.footerText.ok}</Button>}
                  {dataContext.Buttons === MessageBoxButton.OkCancel && <Button className="okButton" onClick={()=>dataContext.Command.execute(MessageBoxResult.Ok)}>{dataContext.footerText.ok}</Button> }

                  {dataContext.Buttons === MessageBoxButton.OkCancel && <Button className="cancelButton" onClick={()=>dataContext.Command.execute(MessageBoxResult.Cancel)}>{dataContext.footerText.cancel}</Button>}

                  {dataContext.Buttons === MessageBoxButton.YesNo && <Button className="yesButton" onClick={()=>dataContext.Command.execute(MessageBoxResult.Yes)}>{dataContext.footerText.yes}</Button> }
                  {dataContext.Buttons === MessageBoxButton.YesNo && <Button className="noButton" onClick={()=>dataContext.Command.execute(MessageBoxResult.No)}>{dataContext.footerText.no}</Button>}


                  {dataContext.Buttons === MessageBoxButton.YesNoCancel && <Button className="yesButton" onClick={()=>dataContext.Command.execute(MessageBoxResult.Yes)}>{dataContext.footerText.yes }</Button> }
                  {dataContext.Buttons === MessageBoxButton.YesNoCancel && <Button className="noButton" onClick={()=>dataContext.Command.execute(MessageBoxResult.No)}>{dataContext.footerText.no}</Button>}
                  {dataContext.Buttons === MessageBoxButton.YesNoCancel && <Button className="cancelButton" onClick={()=>dataContext.Command.execute(MessageBoxResult.Cancel)}>{dataContext.footerText.cancel}</Button>}
              </div>
    </div>
  }