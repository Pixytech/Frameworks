import {
  IDefaultDataProvider,
  ConfigurationItem,
  GetConfigurationItemRequest,
} from "../../Configuration";
import { CoreTypes } from "../../CoreTypes";
import { IocInjectable, IocInject } from "../../IoC";
import {
  IApplicationRoutes,
  IApplicationRoutesType,
} from "./IApplicationRoutes";
import type { IContainer } from "../../IoC";
import type { IConfigurationService } from "../../Configuration";
import { INavigationRoute } from "./INavigationRoute";
import type { IRouteConfig } from "../PermissionService";
import { UserPermissionService, IUserPermissionServiceType } from "../PermissionService";
import type { IAuthenticationService } from "../../Auth";
import { IAuthenticationServiceType } from "../../Auth";

export interface INavigationConfiguration {
  path: string;
  text?: string;
  icon?: string;
  link?: string;
  routes?: INavigationConfiguration[];
  allow: boolean;
  allowedUsers?: string[];
  restrictedUsers?: string[];
  roles?: string[];
}

export const INavigationRoutesProviderType = Symbol.for(
  "INavigationRoutesProviderType"
);
export interface INavigationRoutesProvider {
  applyConfiguration(route: INavigationRoute): Promise<INavigationRoute>;
}

@IocInjectable()
export class NavigationRoutesProvider
  implements IDefaultDataProvider, INavigationRoutesProvider
{
  container: IContainer;
  configuraionService: IConfigurationService;
  userPermissionService: UserPermissionService;
  authenticationService: IAuthenticationService;
  
  constructor(
    @IocInject(CoreTypes.IContainer) container: IContainer,
    @IocInject(CoreTypes.IConfigurationService)
    configuraionService: IConfigurationService,
    @IocInject(IUserPermissionServiceType)
    userPermissionService: UserPermissionService,
    @IocInject(IAuthenticationServiceType)
    authenticationService: IAuthenticationService
  ) {
    this.container = container;
    this.configuraionService = configuraionService;
    this.userPermissionService = userPermissionService;
    this.authenticationService = authenticationService;
  }

  async getDefaultConfigurations(): Promise<ConfigurationItem<any>[]> {

    const routes = this.container.buildAll<IApplicationRoutes>(
      IApplicationRoutesType
    );

    const routeConfig = this.getNavigationConfigurations(routes);
    console.debug("NavigationRoutesProvider", routeConfig);
    const appRouteConfigs: ConfigurationItem<any>[] = routeConfig.map((app) => {
      const config = new ConfigurationItem<any>();
      config.application = "Monza";
      config.category = "App";
      config.section = "Navigation";
      config.item = `${app.link}`;
      config.value = app;
      return config;
    });

    return appRouteConfigs;
  }

  getNavigationConfigurations(
    routes: INavigationRoute[]
  ): INavigationConfiguration[] {
    return routes.map((item) => this.getNavigationConfiguration(item));
  }

  getNavigationConfiguration(
    route: INavigationRoute
  ): INavigationConfiguration {
    return {
      path: route.path,
      text: route.text,
      icon: route.icon,
      link: route.link,
      routes: route.routes
        ? this.getNavigationConfigurations(route.routes)
        : undefined,
      allow: true,
    };
  }

  async applyConfiguration(route: INavigationRoute): Promise<INavigationRoute> {
    const getConfigReq: GetConfigurationItemRequest = {
      application: "Monza",
      category: "App",
      section: "Navigation",
      item: `${route.link}`,
    };
    const navigationConfig =
      await this.configuraionService.getConfiguration<INavigationConfiguration>(
        getConfigReq
      );
    
    if (navigationConfig && navigationConfig.value) {
      // Get current user information
      const userId = this.authenticationService.GetUserId();
      const token = this.authenticationService.GetParsedToken();
      const userRoles = token?.UserRole ? [token.UserRole] : [];
      
      // Check user permissions using the new service
      const hasAccess = this.userPermissionService.hasRouteAccess(
        userId,
        userRoles,
        navigationConfig.value as IRouteConfig
      );
      
      if (hasAccess) {
        return this.applyRoutingConfig(navigationConfig.value, route);
      }
    }
    return route;
  }

  getchildRoutes(
    routes: INavigationRoute[],
    configs?: INavigationConfiguration[]
  ): INavigationRoute[] {
    const childRoutes: INavigationRoute[] = [];
    if (routes) {
      // Get current user information
      const userId = this.authenticationService.GetUserId();
      const token = this.authenticationService.GetParsedToken();
      const userRoles = token?.UserRole ? [token.UserRole] : [];
      
      for (const source of routes) {
        const routeConfig = configs
          ? configs.find((y) => y.path === source.path)
          : undefined;
        if (routeConfig) {
          // Check user permissions using the new service
          const hasAccess = this.userPermissionService.hasRouteAccess(
            userId,
            userRoles,
            routeConfig as IRouteConfig
          );
          
          if (hasAccess) {
            childRoutes.push(this.applyRoutingConfig(routeConfig, source));
          }
        } else {
          childRoutes.push(source);
        }
      }
    }
    return childRoutes;
  }

  applyRoutingConfig(
    value: INavigationConfiguration,
    route: INavigationRoute
  ): INavigationRoute {
    return {
      /* path: value.path, */
      path: route.path,
      icon: value.icon,
      text: value.text,
      link: value.link,
      element: route.element,
      exclude: route.exclude,
      routes: route.routes
        ? this.getchildRoutes(route.routes, value.routes)
        : undefined,
    };
  }
}
