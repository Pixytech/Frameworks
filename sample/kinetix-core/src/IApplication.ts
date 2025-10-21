import type { Router } from "@remix-run/router";
import { IApmService } from "./Apm/IApmService";
import { IAuthenticationService } from "./Auth";
import { IContainer } from "./IoC";
import { INavigationAware, IViewModelBase } from "./Mvvm";
import { IThemeService } from "./Theme";
import { IApplicationCache } from "./ApplicationCache";
import { ITagLogger } from "./TagManager";
import { AppManifest, BuildManifest } from "./Components/AppManifest";
import type { INavigationService } from "./Components/NavigationService/INavigationService";
import type { ICrossTabSyncService } from "./IndexedDB";

export const IApplicationType = Symbol.for("IApplicationType");

export class ApplicationModel {
  isLoaded: boolean;
  helpUri? : string
}

export interface IApplication extends IViewModelBase<ApplicationModel>,INavigationAware {
  switchProfile(appName: string): void;
  readonly router: Router;
  readonly apm: IApmService;
  readonly tagger: ITagLogger;
  readonly themeService: IThemeService;
  readonly container: IContainer;
  readonly cache: IApplicationCache;
  readonly appManifest: AppManifest;
  readonly build: BuildManifest;
  readonly authenticationService: IAuthenticationService;
  readonly navigationService: INavigationService;
  readonly crossTabSyncService: ICrossTabSyncService;
}