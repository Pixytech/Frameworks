export interface IApplicationPlugin{
    readonly name: string;
    onInitialized():Promise<void>;
}
