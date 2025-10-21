import { IocInject, IocInjectable } from "../../IoC";
import type { IContainer } from "../../IoC";
import { INavigationService } from "./INavigationService";
import {
  IApplicationRoutes,
  IApplicationRoutesType,
} from "./IApplicationRoutes";
import { INavigationRoute } from "./INavigationRoute";
import { CoreTypes } from "../../CoreTypes";
import { DefaultAppRoutes } from "./DefaultAppRoutes";

import { Navigate } from "react-router-dom";
import { IApplication, IApplicationType } from "../../IApplication";
import { INavigationRoutesProvider, INavigationRoutesProviderType } from "./NavigationRoutesProvider";

@IocInjectable()
export class NavigationService implements INavigationService {
  
  public appsRoutes: INavigationRoute[] = [];
  private readonly container: IContainer;
  application: IApplication;

  constructor(@IocInject(CoreTypes.IContainer) container: IContainer) {
    this.container = container;
  }
  
  public get currentAppRoute() : INavigationRoute {
    const appRoute = this.appsRoutes.find(x=>x.link == `/${this.application.cache.appState["app.name"]}`) as INavigationRoute || this.appsRoutes[0]
    return appRoute;
  }
  

  public async buildRoutes(): Promise<void> {
   
    if (!this.application) {
      this.application = this.container.build<IApplication>(IApplicationType);
      try {
        const routes = this.container.buildAll<IApplicationRoutes>(
          IApplicationRoutesType
        );
        const navigationRoutesProvider =
          this.container.build<INavigationRoutesProvider>(
            INavigationRoutesProviderType
          );
        console.debug("Application-routes", routes);
        const childRoutes = await Promise.all(routes.map(route=>navigationRoutesProvider.applyConfiguration(route)))
        
        this.appsRoutes = [...childRoutes, { path: "*", element: ()=>{
          return <Navigate to={`/${this.application.appManifest.default}`} />
        } },]
      } catch (e) {
        console.debug("Error building routes", e);
        this.appsRoutes =  this.container.build<DefaultAppRoutes>(DefaultAppRoutes).routes;
      }
    }
    console.debug("Navigation Service routes", this.appsRoutes);
  }
}
