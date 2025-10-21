import { ApmBase, init as initApm } from "@elastic/apm-rum";
import { ComponentType } from "react";
import { BuildManifest } from "../../..";
import { type IAuthenticationService, IAuthenticationServiceType } from "../../../Auth";
import { IocInjectable, IocInject } from "../../../IoC";
import { IApmAdapter, IRouteElementProps } from "../../IApmAdapter";
import { RouteElement } from "./RouteElement";


@IocInjectable()
export class ElasticApmAdapter implements IApmAdapter {
  name: string = "elastic";
  router: ComponentType<IRouteElementProps> = RouteElement;
  apm: ApmBase;
  authenticationService: IAuthenticationService;

  constructor(
    @IocInject(IAuthenticationServiceType)
    authenticationService: IAuthenticationService
  ) {
    this.authenticationService = authenticationService;
  }

  async initialize(
    profile: string,
    buildInfo: Partial<BuildManifest>,
    loglevel?: LogLevel | undefined
  ): Promise<void> {
    this.apm = initApm({
      serviceName: buildInfo.apmServiceName,
      serverUrl: "/apm",
      serviceVersion: buildInfo.version,
      logLevel: loglevel,
      environment: buildInfo.environmentName,
    });

    this.apm.setInitialPageLoadName(profile);

    this.apm.setUserContext({
      id: this.authenticationService.GetUserId(),
      username: this.authenticationService.GetUsername(),
    });

    console.debug("initialized Elastic APM", profile, loglevel, buildInfo);
  }
}
