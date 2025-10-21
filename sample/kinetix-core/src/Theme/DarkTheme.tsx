import { ITheme } from "./Themes";
import { LightTheme as LightThemeComponent } from "./light-theme/LightTheme";
import { DarkTheme as DarkThemeComponent } from "./dark-theme/DarkTheme";

export class DarkTheme implements ITheme {
  ApplyTheme(children: any): JSX.Element {
    return <DarkThemeComponent>{children}</DarkThemeComponent>;
  }
  Name: string = "darkTheme";
  Icon: string = "theme.lightLogo";//darkLogo";
  PartnersIcons: string[]=[];
}

export class LightTheme implements ITheme {
  ApplyTheme(children: any): JSX.Element {
    return <LightThemeComponent>{children}</LightThemeComponent>;
  }
  Name: string = "lightTheme";
  Icon: string = "theme.darkLogo";
  PartnersIcons: string[]=[];
}
