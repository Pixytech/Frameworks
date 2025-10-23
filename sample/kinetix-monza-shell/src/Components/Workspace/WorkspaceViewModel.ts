import { CoreTypes, IocInjectable, ViewModelBase, IocInject, INavigationRoute, IDrawerItem, isRouteActive, INavigationServiceType, CompositeDisposable } from "@kinetix/core";
import type { IContainer, IEventAggregator, INavigationService } from "@kinetix/core";
import { WorkspaceModel } from "./WorkspaceModel";
import { IWorkspace, IWorkspaceItem } from "./IWorkspace";
import { IHeader } from "../WorkspaceHeader/IHeader";
import { HeaderViewModel } from "../WorkspaceHeader/HeaderViewModel";
import { DrawerToggleEvents } from "../../Event/DrawerToggleEvents";
import { AppsViewModel } from "../WorkspaceItems/Apps/AppsViewModel";
import { Location } from "react-router-dom";

@IocInjectable()
export class WorkspaceViewModel extends ViewModelBase<WorkspaceModel> implements IWorkspace {
  container: IContainer;

  private readonly events: IEventAggregator;
  navigationService: INavigationService;
  pageSubscriptions: CompositeDisposable;

  constructor(@IocInject(CoreTypes.IContainer) builder: IContainer, @IocInject(CoreTypes.IEventAggregator) events: IEventAggregator, @IocInject(INavigationServiceType) navigationService: INavigationService) {
    super();
    this.container = builder;
    this.events = events;
    this.navigationService = navigationService;
  }

  protected async onInitializeOnce(): Promise<void> {
    this.updateModel((m) => {
      m.drawerItems = this.buildDrawer();
    });

  }

  protected async onInitialize(): Promise<void> {
      this.pageSubscriptions = new CompositeDisposable([
        //Subscribe to Drawer Toggle Events
    this.events.getEvent<DrawerToggleEvents>(DrawerToggleEvents, DrawerToggleEvents.Type).subscribe((eventArgs) => {
      console.debug("Drawer Toggle Event Received", eventArgs.data);
      this.updateModel((model) => (model.expanded = eventArgs.data));
    })
      ]);
  }

  protected async onCleanup(): Promise<void> {
    this.pageSubscriptions?.dispose();
  }

  protected createModel(): WorkspaceModel {
    return new WorkspaceModel();
  }

  private buildDrawer(): IDrawerItem[] {
    const result: IDrawerItem[] = [];
    this.buildDrawerFromRoute(this.navigationService.currentAppRoute?.routes?.find(x=>x.link == "/home"), result);
    console.debug("DrawerItems", result);
    return result;
  }

  buildDrawerFromRoute(route: INavigationRoute | undefined, result: IDrawerItem[]): void {
    if(route){
      if (route?.text && route?.icon) {
        result.push({
          link: route.link,
          icon: route.icon,
          text: route.text,
        });
      }

      if (route.routes) {
        route.routes.forEach((route) => this.buildDrawerFromRoute(route, result));
      }
    }
  }

  getCurrentDrawerText(location: Location): string {
    if (this.navigationService.currentAppRoute?.routes && this.navigationService.currentAppRoute.routes.length > 0) {
      const route = this.navigationService.currentAppRoute.routes.find((x) => isRouteActive(location, x.link));
      if (route) {
        const childRoute = this.navigationService.currentAppRoute.routes?.find((x) => x.link === route.link);
        if (childRoute && route.text && route.link) {
          const pathParts = location.pathname.split("/");
          const currentIndex = pathParts.indexOf(route.link);
          const routeText: string[] = [route.text];
          this.getRouteText(childRoute, currentIndex, pathParts, routeText);
          return routeText.join(" / ");
        } else {
          return `${route.text}`;
        }
      }
    }
    return "";
  }
  getRouteText(childRoute: INavigationRoute, currentIndex: number, pathParts: string[], routeText: string[]): void {
    if (currentIndex + 1 < pathParts.length) {
      const path = pathParts[currentIndex + 1];

      const route = childRoute.routes?.find((x) => x.path === path);
      if (route) {
        if (route.text) {
          routeText.push(route.text);
        }
        this.getRouteText(route, currentIndex + 1, pathParts, routeText);
      }
    }
  }

  getContent(route: string): IWorkspaceItem {
    try {
      switch (route) {
        default:
        case "/apps":
          return this.container.build<IWorkspaceItem>(AppsViewModel);
      }
    } finally {
      //this.updateModel(m=>m.route = route);
    }
  }

  getHeaderViewModel(): IHeader {
    return this.container.build<IHeader>(HeaderViewModel);
  }
}
