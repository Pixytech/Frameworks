import { BuildManifest, INavigationRoute, LogLevel } from "..";

export const IApmAdapterType = Symbol.for("IApmAdapter");

export interface IRouteElementProps {
  route: INavigationRoute;
  parent: string;
}

export interface IApmAdapter {
  name: string;
  initialize(
    profile: string,
    buildInfo: Partial<BuildManifest>,
    loglevel?: LogLevel
  ): Promise<void>;
  router: React.ComponentType<IRouteElementProps>;
}
