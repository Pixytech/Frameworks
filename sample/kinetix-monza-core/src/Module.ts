import { CoreTypes, IContainer, IModule, IThemeService } from "@kinetix/core";
import { icons } from "./Icons/Icons";
import { Registry } from "./Registry";
import { TicketHook } from "./TicketHooks";
import type { IUserSettings } from ".";
import { UserSettings } from ".";

export class Module implements IModule {
  onInitialized(container: IContainer): void {
    container.includeRegistry<Registry>(Registry);
  }

  async onLoad(container: IContainer): Promise<void> {
    var themeService = container.build<IThemeService>(CoreTypes.IThemeService);
    let userSetting = container.build<IUserSettings>(UserSettings);
    userSetting.initialize();
    themeService.AddIcons(icons);
  }
}
