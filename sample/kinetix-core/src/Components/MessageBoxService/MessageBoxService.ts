import { CoreTypes } from "../../CoreTypes";
import { IocInject, IocInjectable } from "../../IoC";
import type { IDialogService } from "../DialogService";
import { IMessageBoxService } from "./IMessageBoxService";
import { MessageBoxButton } from "./MessageBoxButton";
import { MessageBoxImage } from "./MessageBoxImage";
import { MessageBoxResult } from "./MessageBoxResult";
import { MessageBoxViewModel } from "./MessageBoxViewModel";

@IocInjectable()
export class MessageBoxService implements IMessageBoxService
{
    dialogService: IDialogService;
    constructor(@IocInject(CoreTypes.IDialogService) dialogService: IDialogService){
        this.dialogService=dialogService;
    }

    Show(text:string, caption:string="", button:MessageBoxButton = MessageBoxButton.Ok, icon:MessageBoxImage=MessageBoxImage.None , defaultResult:MessageBoxResult = MessageBoxResult.None,configure?:(vm:MessageBoxViewModel)=>void):Promise<MessageBoxResult> {
        return this.ShowInternal(text,caption,button,icon,defaultResult,configure);
    }

    private ShowInternal(text:string, caption:string, button:MessageBoxButton, icon:MessageBoxImage, defaultResult:MessageBoxResult,configure?:(vm:MessageBoxViewModel)=>void):Promise<MessageBoxResult>
        {
            return new Promise((resolve, reject) => {
            const onClose:((result:MessageBoxResult)=>void)=(r=>{resolve(r)})
            var messageBoxViewModel = new MessageBoxViewModel(this.dialogService, text, onClose,button, icon, defaultResult,configure);
            
            this.dialogService.ShowDialog(messageBoxViewModel, 
                {
                    title: caption, 
                    cyclicTab:true,
                    canMaximize:false,
                    canMinimize:false,
                    draggable:true,
                    canClose:true,
                    isModel:true,
                    resizable:false,
                    initialHeight: 200,
                    initialWidth:400
                });
            });
        }
    
}
