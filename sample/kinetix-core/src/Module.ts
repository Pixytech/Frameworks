import { IContainer } from "./IoC";
import { IModule } from "./Modularity";
import { Registry } from "./Registry";

export class Module implements IModule{
    onInitialized(container: IContainer): void {
        container.includeRegistry<Registry>(Registry);
    }
}