

import { CoreTypes } from "./CoreTypes";
import { IInteropClient, IInteropProvider, InteropContainerType } from "./Interop";
import { IocInjectable } from "./IoC";
import type { IContainer } from "./IoC";
import { IShellBase } from "./IShell";
import { IApplicationPlugin, IModule } from "./Modularity";
import { INavigationAware, IViewResolver, ViewModelBase } from "./Mvvm";
import { type IThemeService } from "./Theme";
import type { IAuthenticationService } from "./Auth";
import type { IApmService } from "./Apm/IApmService";
import { ApplicationModel, IApplication } from "./IApplication";
import { SVGIcon } from "@progress/kendo-svg-icons";
import { ITagLogger, type ITagManagerService } from "./TagManager";
import { type IApplicationCache,IApplicationCacheType } from "./ApplicationCache";
import { Location,Params, NavigateFunction } from "react-router-dom";
import { Router } from "@remix-run/router";
import { IStreamingService, IStreamingServiceType } from "./Streaming";
import { AppManifest, BuildManifest, ProfileType } from "./Components/AppManifest";
import { INavigationService, INavigationServiceType } from "./Components/NavigationService/INavigationService";
import { type ICrossTabSyncService, ICrossTabSyncServiceType } from "./IndexedDB";

@IocInjectable()
export class Application extends ViewModelBase<ApplicationModel> implements IApplication,INavigationAware {
  QueryParams: Readonly<Params<string>>;
  navigator: NavigateFunction;
  location: Location;
  private readonly moduleFactory: (module: string) => Promise<{ entry: IModule; name: string } | null>;
  container: IContainer;
  
  build: BuildManifest;
  apm: IApmService;
  authenticationService: IAuthenticationService;
  apmService: IApmService;
  tagService: ITagManagerService;
  cache: IApplicationCache;
  router: Router;
  crossTabSyncService: ICrossTabSyncService;
  private _appManifest: AppManifest;
  constructor(container: IContainer, moduleFactory: (module: string) => Promise<{ entry: IModule; name: string } | null>, 
  themeService: IThemeService, authenticationService: IAuthenticationService, apmService: IApmService,tagService: ITagManagerService,cache:IApplicationCache) {
    super();
    this.cache = cache;
    this.themeService = themeService;
    this.apmService = apmService;
    this.container = container;
    this.tagService = tagService;
    this.authenticationService = authenticationService;
    this.moduleFactory = moduleFactory;
  }

  
  public get appManifest() : AppManifest {
    return this._appManifest;
  }
  

  
  public get tagger() : ITagLogger {
    return this.tagService.Tag;
  }
  
  navigationService: INavigationService;
  themeService: IThemeService;

  protected createModel(): ApplicationModel {
    return new ApplicationModel();
  }
  

  protected async onInitializeOnce(): Promise<void> {
    try{
      await this.authenticationService.initialize();
    const currentProfile = await this.startApplication();

    await this.apmService.initialize(currentProfile, this.build, this.appManifest.logLevel);
    await this.tagService.initialize(currentProfile, this.build);
    
    // Initialize CrossTabSyncService
    this.crossTabSyncService = this.container.build<ICrossTabSyncService>(ICrossTabSyncServiceType);
    await this.crossTabSyncService.initialize().toPromise();

    const navigationService = this.container.build<INavigationService>(INavigationServiceType);
    this.navigationService = navigationService;

    
    const profile = this.appManifest.profiles.find((x) => `${x.name}`.toLowerCase() === `${currentProfile}`.toLowerCase());
    const appName =`${ profile ? profile.name : ""}`.toLowerCase();
    this.switchProfile(appName);
    
    await navigationService.buildRoutes();
    this.updateModel((m) => {
      m.isLoaded = true;});
  }catch(e){
    console.error("Error Bootstraping app", e);
    this.navigator("./maintainace")
  }
  }


  switchProfile(appName: string): void {
   
    const previousProfileName = this.cache.appState["app.name"];
    if(previousProfileName)
      {
        const previousProfile= this.appManifest.profiles.find(x=>x.name === previousProfileName);
        if(previousProfile?.features){
          Object.keys(previousProfile?.features).forEach(key=>{
             delete this.cache.appState[key];
        })
        }
      }
    const currentProfile = this.appManifest.profiles.find(x=>x.name === appName);
    this.cache.appState = {...this.cache.appState,...currentProfile?.features}
    this.cache.appState["app.name"] = appName;
    this.cache.appState["app.title"] = currentProfile?.displayName || "";
    this.cache.appState["user.id"] = this.authenticationService.GetUserId();
    this.cache.appState["user.name"] = this.authenticationService.GetUsername();
    this.cache.appState["user.token"] = this.authenticationService.GetParsedToken();
    console.debug("switched app", appName,this.cache.appState);
    /* this.container.deregister(CoreTypes.IEventAggregator);
    this.container.register(CoreTypes.IEventAggregator, EventAggregator, ObjectLifecycle.Singleton); */
    
    this.notifyModelChanged();
  }

  protected async startApplication(): Promise<string> {
    const location = this.router.state.location;
    let appProfile = location.pathname.split("/").find((x) => x && x !== "component");
    console.debug("ProfileFromURL", appProfile);

    // until we have proper bundling and deployment of isolated modules
    // web pack see fedrated modules we can use this module loader
    console.debug("Bootstraping modules");
    const result = await this.bootstrap(this.container, appProfile);
    let appstateCache = this.container.build<IApplicationCache>(IApplicationCacheType);
    appstateCache.appState = result.appState;
    console.debug("Initializing interopProvider ");
    let interopContainerType = location.pathname.startsWith("/component") ? InteropContainerType.Component : InteropContainerType.Application;
    let interopProvider = this.container.build<IInteropProvider>(CoreTypes.IInteropProvider);
    try {
      let interopclients = this.container.buildAll<IInteropClient>(CoreTypes.IInteropClient);

      console.debug("Interop container type", interopContainerType);

      for (const interopclient of interopclients) {
        try {
          await interopProvider.initialize(interopclient, interopContainerType);
          if (interopProvider.isPlatformAvailable) {
            break;
          }
        } catch (e) {
          console.debug("no interop adapter available", interopclient.PlatformMessage);
        }
      }
      if (!interopProvider.isPlatformAvailable) {
        await interopProvider.initialize(undefined, InteropContainerType.Application);
      }
    } catch (e) {
      console.debug("no interop adapter available", interopContainerType);
      await interopProvider.initialize(undefined, InteropContainerType.Application);
    }

    console.debug("Initializing View resolver ");
    let viewResolver = this.container.build<IViewResolver>(CoreTypes.IViewResolver);
    viewResolver.initialize();

    const modulesPromise = result.modules.map((module) => {
      if (module.module.onLoad) {
        console.debug(`onLoad:${module?.name}`);
        return module.module.onLoad(this.container);
      }
    });

    const validPromise = modulesPromise.filter((x) => x != undefined);
    await Promise.all(validPromise);
    const streamService = this.container.build<IStreamingService>(IStreamingServiceType);
    await streamService.initialize();
    const shells = this.container.buildAll<IShellBase>(CoreTypes.IShell);
    const shell = shells.find(x=>x.appName == result.profile) || shells[0];
 
    await shell.initialize();
    const newProfile = shell.validateAppProfile(result.profile);
    if (newProfile !== appProfile) {
      console.debug("Redirect-Shell", newProfile);
     this.navigator(`/${newProfile}/`);
    }

    if (result.plugins) {
      await this.startPlugins(result.plugins);
    }

    if(result.helpUrl){
      this.updateModel(m=>m.helpUri = result.helpUrl)
    }
    if(result.icons && result.icons.length>0 ){
      this.themeService.AddSvgIcons(result.icons)
    }
    return newProfile;
  }

  public async startPlugins(plugins: string[]) {
    try {
      console.debug(`Initializing plugins`);
      const pluginsInstances = this.container.buildAll<IApplicationPlugin>(CoreTypes.IApplicationPlugin);
      const activePlugins = plugins
        .map((pluginName) => {
          return pluginsInstances.find((x) => `${x.name}`.toLowerCase() == `${pluginName}`.toLowerCase());
        })
        .filter((x) => x != undefined);

      if (activePlugins && activePlugins.length > 0) {
        await Promise.all(
          activePlugins.map((x) => {
            console.debug(`Starting application plugin ${x}`);
            try {
              return x?.onInitialized();
            } catch (e) {
              console.error(`Error starting plugin ${x}`, e);
            }
          })
        );
      }
    } catch (e) {
      console.debug("No application plugins configured", e);
    }
  }

  private async bootstrap(
    container: IContainer,
    appProfile: string | null = null
  ): Promise<{
    modules: { name: string; module: IModule }[];
    plugins?: string[];
    icons?:SVGIcon[];
    profile: string;
    helpUrl?:string;
    appState:Record<string,any>;
  }> {
    // get the manifest for the client - this will be updated
    // as part of deployment for given client in CI/CD
    console.debug("Loading metadata");
    let response = await fetch("/app.json");
    this._appManifest = (await response.json()) as AppManifest;

    let buildResponse = await fetch("/desktop/build.json");
    this.build = (await buildResponse.json()) as BuildManifest;
    let profileName = this.appManifest.default;
    if (appProfile) {
      profileName = appProfile;
    }

    console.debug(`Starting app for profile: ${profileName}`);
    
    // Find matching profile - permission checks are done later in AppsViewModel
    let matchedProfiles = this.appManifest.profiles
      .filter((x) => x.type !== ProfileType.External)
      .find((x) => x.name === profileName);

    if (!matchedProfiles) {
      console.error(`no matching profile find to bootstrap ${profileName}, switching to fallback ${this.appManifest.default}`);
      matchedProfiles = this.appManifest.profiles.filter((x) => x.type !== ProfileType.External).find((x) => x.name === this.appManifest.default);
      profileName = this.appManifest.default;
    }

    let plugins = matchedProfiles ? matchedProfiles.plugins : [];
    let icons = matchedProfiles ? matchedProfiles.icons : [];
    let helpUrl = matchedProfiles?.helpUrl;
    const allModules:string[] = [];
    this.appManifest.profiles.filter((x) => x.type !== ProfileType.External).forEach(profile => {
      allModules.push(...profile.modules);
    });
    let moduleNames = ["core/kinetix-core", "core/kinetix-monza-core", "core/kinetix-idp-core", ...(allModules), "app"].filter((thing, i, arr) => arr.findIndex((t) => t === thing) === i);

    const initialAppState : Record<string,any> = matchedProfiles?.features || {}
    console.debug("MODULES", moduleNames);
    //todo use promise all
    let modules = await Promise.all(
      moduleNames.map((moduleName) => {
        console.debug(`loading:${moduleName}`);
        let entry = this.moduleFactory(moduleName);
        return entry;
      })
    );

    let result: { name: string; module: IModule }[] = [];
    modules.forEach((module) => {
      if (module) {
        console.debug(`onInitialized:${module.name}`);
        module.entry.onInitialized(container);
        result.push({ name: module.name, module: module.entry });
      }
    });

    return { modules: result, profile: profileName, plugins: plugins,icons:icons,helpUrl:helpUrl,appState:initialAppState };
  }

  /**
   * Cleanup method - called when application is being disposed
   */
  protected async onCleanup(): Promise<void> {
    // Cleanup CrossTabSyncService
    if (this.crossTabSyncService) {
      try {
        await this.crossTabSyncService.cleanup().toPromise();
        console.debug('CrossTabSyncService cleanup completed');
      } catch (error) {
        console.error('Failed to cleanup CrossTabSyncService:', error);
      }
    }
  }
}
