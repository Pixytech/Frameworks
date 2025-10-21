import { Outlet } from "react-router-dom";
import { CoreTypes } from "../../CoreTypes";
import { IocInject, IocInjectable } from "../../IoC";
import type { IContainer } from "../../IoC";
import { IApplicationRoutes } from "./IApplicationRoutes";
import { INavigationRoute, INavigationRouteType } from "./INavigationRoute";
@IocInjectable()
export class DefaultAppRoutes implements IApplicationRoutes {
  container: IContainer;
  constructor(@IocInject(CoreTypes.IContainer) container: IContainer) {
    this.container = container;
  }

  exclude?: boolean | undefined;
  text?: string | undefined;
  icon?: string | undefined;

  get routes(): INavigationRoute[] {
    try {
      return this.container.buildAll<INavigationRoute>(INavigationRouteType);
    } catch {
      return [];
    }
  }
  element: ()=>React.ReactNode = ()=>(<Outlet />);
  path: string = "/*";
  link: string = "/";
}
