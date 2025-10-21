import { FC } from "react";
import { IThemeService } from "./IThemeService";

interface IThemeProviderProps {
  dataContext: IThemeService;
  children: any;
}

export const ThemeProvider: FC<IThemeProviderProps> = (
  props: IThemeProviderProps
) => {
  console.debug("ThemeProvider-render");
  //var dataContext = useViewModelInstance(props.dataContext);

  return props.dataContext.model.Theme?.ApplyTheme(props.children);
};
