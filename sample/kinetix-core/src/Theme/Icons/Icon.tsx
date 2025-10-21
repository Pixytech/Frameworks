import { IIcon } from "./IIcon";
import { useViewModel } from "../../Mvvm";
import { CoreTypes } from "../../CoreTypes";
import { IThemeService } from "../IThemeService";
import { ThemeModel } from "../ThemeModel";

import "./Icons.scss";
import { AutomationHelper } from "../../AutomationHelper";
import { SVGIcon } from "@progress/kendo-svg-icons";
import { SvgIcon } from "@progress/kendo-react-common";

interface IconsProps {
  color?: string;
  className?: string;
  icon: string;
}
export const Icon = ({ icon, className, color, ...props }: IconsProps) => {
  let themeService = useViewModel<ThemeModel, IThemeService>(
    CoreTypes.IThemeService
  );
  const svg_icon = themeService.Icons.find(
    (i: IIcon) => i.name === icon
  ) as IIcon;
  
  if (typeof svg_icon === "undefined" || !svg_icon) {
    console.warn(`Icon ${icon} not found. Make sure icons are registered with the theme service in this shells Module.ts`)
    return <></>
  }
  const kendoSvgIcon : SVGIcon =  svg_icon as any as SVGIcon;
  if(kendoSvgIcon && kendoSvgIcon.name && kendoSvgIcon.content){
    return <SvgIcon height="32" width="32" icon={kendoSvgIcon} className={`kx-icon ${className} ${color ? `${color}-icon` : ""}`}/>;
  }

  const SVGIcon = svg_icon.icon;
  return (
    <SVGIcon
      {...props}
      id={icon}
      data-automationid={AutomationHelper.GetId(icon)}
      className={`${className} ${color ? `${color}-icon` : ""}`}
    />
  );
};
