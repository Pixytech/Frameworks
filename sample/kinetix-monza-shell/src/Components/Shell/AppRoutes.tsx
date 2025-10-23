import {
  CoreTypes,
  IApplicationRoutes,
  INavigationRoute,
  INavigationRouteType,
  IocInject,
  IocInjectable,
  RegionView,
  useContainer,
  useViewModelInstance,
} from "@kinetix/core";
import type { IContainer } from "@kinetix/core";
import { Navigate, useOutletContext } from "react-router-dom";
import { IWorkspace } from "../Workspace/IWorkspace";

import { IDefaultShellType } from "./IDefaultShell";
import type { IDefaultShell } from "./IDefaultShell";

import "./DefaultShellViewStyles.scss";
import { useEffect, useState } from "react";
import { ShellHost } from "@kinetix/monza-core";

@IocInjectable()
export class AppRoutes implements IApplicationRoutes {
  
  container: IContainer;
  path: string = "home/*";
  link: string = "/home";
  constructor(
    
    @IocInject(CoreTypes.IContainer) container: IContainer
  ) {
    
    this.container = container;
  }

  get routes(): INavigationRoute[] {
    
    return [
      { path: "", element:()=> <Navigate to="apps" replace /> },
      {
        path: "apps",
        link: "apps",
        text: "Apps",
        icon: "drawer.apps",
        element: ()=>{
          const dataContext = useOutletContext<IWorkspace>();
         return  <RegionView viewModel={dataContext.getContent("/apps")} />
        },
      },
      { path: "*", element: ()=><Navigate to={`apps`} /> },
      ...this.getChildRoutes(),
    ];
  }

  getChildRoutes(): INavigationRoute[] {
    try {
      return this.container.buildAll<INavigationRoute>(INavigationRouteType);
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  get element(): ()=>React.ReactNode {
    
    return ()=>{
      const dataContext = useViewModelInstance(this.container.build<IDefaultShell>(IDefaultShellType));
      
      return <ShellHost dataContext={dataContext}>
        <div className="kx-default-shell">
        {dataContext.Workspace && (
          <RegionView viewModel={dataContext.Workspace} />
        )}
      </div>
      </ShellHost> 
    };
  }
}
