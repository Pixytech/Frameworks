import { ComponentType,useState } from "react";
import { BuildManifest, ComponentBoundary, LogLevel, RouterUtils } from "../..";
import { IApmAdapter, IRouteElementProps } from "../IApmAdapter";

export const DefaultRouterWrapper = (props: IRouteElementProps) => {
  return <RouterUtils>{props.route.element()}</RouterUtils>;
};

export class DefaultApmAdapter implements IApmAdapter {
  async initialize(
    profile: string,
    buildInfo: Partial<BuildManifest>,
    loglevel?: LogLevel | undefined
  ): Promise<void> {
    console.debug("initialized Default APM", profile, loglevel, buildInfo);
  }
  router: ComponentType<IRouteElementProps> = DefaultRouterWrapper;

  name: string = "none";
}
