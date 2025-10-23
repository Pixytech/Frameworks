import { IContainer,IModule } from "@kinetix/core";
import { Registry } from "./Registry";

export class Module implements IModule{
    onInitialized(container: IContainer): void {
        container.includeRegistry<Registry>(Registry);
    }
}