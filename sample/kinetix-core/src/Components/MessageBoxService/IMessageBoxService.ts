import { MessageBoxButton } from "./MessageBoxButton";
import { MessageBoxImage } from "./MessageBoxImage";
import { MessageBoxResult } from "./MessageBoxResult";
import { MessageBoxViewModel } from "./MessageBoxViewModel";

export const IMessageBoxServiceType = Symbol.for("IMessageBoxService");

export interface IMessageBoxService{

    Show(text:string, caption?:string, button?:MessageBoxButton , icon?:MessageBoxImage , defaultResult?:MessageBoxResult,configure?:(vm:MessageBoxViewModel)=>void):Promise<MessageBoxResult>;
}

