import { ITheme, IThemeAdapter } from "./Themes";
import { IocInjectable } from "../IoC/Injectables";
import { IEventAggregator } from "../Messaging";

import { icons } from "./Icons/icons";
import { DarkTheme, LightTheme } from "./DarkTheme";
import { ViewModelBase } from "../Mvvm";
import { IThemeService } from "./IThemeService";
import { ThemeModel } from "./ThemeModel";
import { IIcon } from "./Icons/IIcon";
import { SVGIcon } from "@progress/kendo-react-common";

@IocInjectable()
export class ThemeService
  extends ViewModelBase<ThemeModel>
  implements IThemeService
{
  protected createModel(): ThemeModel {
    return new ThemeModel();
  }

  Themes: ITheme[] = [];
  Adapters: IThemeAdapter[] = [];
  events: IEventAggregator;
  Icons: any[] = icons;

  public AddTheme(theme: ITheme) {
    this.Themes.push(theme);
  }

  constructor() {
    super();
    this.Themes.push(new LightTheme());
    this.Themes.push(new DarkTheme());
  }
  

  async ApplyTheme(theme: ITheme): Promise<void> {
    this.updateModel(async (m) => {
      m.Theme = theme;
      this.RefreshAdapters(true);
    });
  }

  protected async onInitializeOnce(): Promise<void> {
    const theme = this.model.Theme ?? this.Themes[1];
    console.debug("ThemeService onInitializeOnce - ApplyTheme: ", theme.Name);
    await this.ApplyTheme(theme);
    console.debug(
      "ThemeService onInitializeOnce - Theme Applied: ",
      theme.Name
    );
  }

  CustomizeTheme(theme: ITheme): boolean {
    return true;
  }

  RefreshAdapters(isChanged: boolean): void {
    this.Adapters.forEach((adapter) => {
      adapter.ApplyTheme(this.model.Theme, isChanged);
    });
  }

  AddIcons(icons: IIcon[]): void {
    this.Icons = [...icons,...this.Icons, ];
  }

  AddSvgIcons(icons: SVGIcon[]): void {
    this.Icons = [...icons,...this.Icons, ];
  }
}
