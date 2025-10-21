import { SVGIcon } from "@progress/kendo-react-common";
import { IViewModelBase } from "../Mvvm/IViewModel";
import { IIcon } from "./Icons/IIcon";
import { ThemeModel } from "./ThemeModel";
import { ITheme } from "./Themes";

export interface IThemeService extends IViewModelBase<ThemeModel> {
  Themes: ITheme[];
  Icons: any[];

  ApplyTheme(theme: ITheme): Promise<void>;
  AddTheme(theme: ITheme): void;
  AddIcons(icons: IIcon[]): void;
  AddSvgIcons(icons: SVGIcon[]): void;
  CustomizeTheme(props: ITheme): boolean;
  RefreshAdapters(isChanged: boolean): void;
}
