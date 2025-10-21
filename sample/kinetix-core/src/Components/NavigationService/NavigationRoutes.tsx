import { FC } from "react";
import { Route, Routes, Location } from "react-router-dom";
import { IApmService, IApmServiceType } from "../../Apm/IApmService";
import { INavigationRoute } from "./INavigationRoute";
import { DefaultRouterWrapper } from "../../Apm/Adapters/DefaultAdapter";
import { UnAuthorized } from "./NavigationServiceView";
import { useContainer } from "../../IoC";

interface INavigationRoutesProps {
  routes: INavigationRoute[];
}

const renderNavigationRoute = (
  parentPath: string,
  route: INavigationRoute,
  apmService: IApmService
): JSX.Element => {
  const RouterWrapper = apmService?.Apm
    ? apmService.Apm.router
    : DefaultRouterWrapper;
  return (
    <Route
      key={`${parentPath}-${route.path}`}
      path={`${route.path}`}
      element={
        !route.exclude ? (
             <RouterWrapper parent={parentPath} route={route} />
        ) : (
          <UnAuthorized />
        )
      }
    >
      {route.routes &&
        route.routes.map((childRoute) => {
          return renderNavigationRoute(
            `${parentPath}-${route.path}`,
            childRoute,
            apmService
          );
        })}
    </Route>
  );
};

export const NavigationRoutes: FC<INavigationRoutesProps> = (
  props: INavigationRoutesProps
) => {
  
  const approutes = props.routes;
  const container = useContainer();
  const apmService = container.build<IApmService>(IApmServiceType);
  console.debug("Render NavigationRoutes",props)
  return (
    <Routes key="navigation-routes">
      {approutes &&
        approutes.map((route) => {
          return renderNavigationRoute("", route, apmService);
        })}
    </Routes>
  );
};

export const isRouteActive = (location: Location, path?: string): boolean => {
  var result: boolean = false;
  if (path) {
    result =
      location.pathname.endsWith(path) ||
      location.pathname.includes(`/${path}/`);
  }

  return result;
};
