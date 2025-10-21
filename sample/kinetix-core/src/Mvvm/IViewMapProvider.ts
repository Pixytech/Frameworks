import { IViewResolver } from "./IViewResolver";


export interface IViewMapProvider {
    provideMap(resolver: IViewResolver): void;
}
