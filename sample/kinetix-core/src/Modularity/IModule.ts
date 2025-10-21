
import { IContainer } from "../IoC/IContainer";

export interface IModule{
    onInitialized(container:IContainer):void;
    onLoad?(container:IContainer):Promise<void>;
};