import { CoreTypes, IContainer,IModule, IThemeService } from "@kinetix/core";
import { Registry } from "./Registry";
import { icons } from "./Resources/Icons";

export class Module implements IModule{
    onInitialized(container: IContainer): void {
        container.includeRegistry<Registry>(Registry);
    }
    async onLoad?(container:IContainer):Promise<void>
    {
        var themeService= container.build<IThemeService>(CoreTypes.IThemeService);
        themeService.AddIcons(icons);
    }
}