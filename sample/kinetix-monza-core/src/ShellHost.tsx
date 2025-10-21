import { FC, useLayoutEffect, useMemo } from "react";
import { TicketHook } from "./TicketHooks";
import { get, set } from "lodash";
import { IShellBase, useContainer, IApplication, IApplicationType } from "@kinetix/core";

interface IShellHostProps {
  children: React.ReactNode;
  dataContext: IShellBase;
}

export const ShellHost: FC<IShellHostProps> = (props: IShellHostProps) => {
    const container = useContainer();
    const application = container.build<IApplication>(IApplicationType);
    
    const data = useMemo (()=>{
      const data = {};
        if(application.cache.appState["app.name"] !== props.dataContext.appName){
           set(data, "appName", props.dataContext.appName);
        }

        if(application.themeService.model.Theme?.Name !== props.dataContext.themeName){
            
            const theme = application.themeService.Themes.find((theme) => theme.Name === props.dataContext.themeName);
            if(theme){
              set(data, "theme", theme);
            }
        }
        
        return {appName:get(data,"appName"), theme:get(data,"theme")};
        
    },[props.dataContext.appName]);

useLayoutEffect(()=>{
  if(data.appName){
    console.debug("switch app", data.appName);
    application.switchProfile(props.dataContext.appName);
  }

  if(data.theme){
    console.debug("switch theme", props.dataContext.themeName);
    application.themeService.ApplyTheme(data.theme)
  }
if(props.dataContext.appName){
  TicketHook.Instance.onLoad(container);
}
},[data.appName,data.theme,props.dataContext.appName])

   

    return <>{props.children}</>
}