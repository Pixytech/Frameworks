import { FC } from "react";
import { useViewModelInstance } from "../../Mvvm/ViewComponentBase";

import { DialogComponentView } from "./DialogComponent";
import { IDialogHost } from "./IDialogHost";

interface IDialogHostViewProps {
    dataContext: IDialogHost; 
  }
  
  export const DialogHostView: FC<IDialogHostViewProps> = (props:IDialogHostViewProps) => {
    const dataContext = useViewModelInstance(props.dataContext);

    return (
        <>
          {dataContext.Dialogs.map((dialog,index) => (
            <div key={`dialogComponent___${index}`}>
              <DialogComponentView  dataContext={dialog}/>
            </div>
          ))}
        </>
      );
  }

  

