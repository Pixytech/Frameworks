import { BuildManifest } from "../Components/AppManifest";


export const ITagAdapterType = Symbol.for("ITagAdapter");

export interface ITagLogger{
    createEvent(eventName:string,data:any):void
}

export interface ITagAdapter extends ITagLogger{
    readonly name : string
    initialize(
        profile: string,
        buildInfo: BuildManifest,
      ): Promise<void>;
}

