import { ViewModelBase, IocInjectable, CoreTypes, IocInject, IAuthenticationServiceType, CompositeDisposable } from "@kinetix/core";
import type { IEventAggregator, IAuthenticationService } from "@kinetix/core";
import { IHeader } from "./IHeader";
import { HeaderModel } from "./HeaderModel";
import { DrawerToggleEvents, DrawerTogglePayload } from "../Events/DrawerToggleEvents";
import { HeaderNameEvents } from "../Events/HeaderNameEvents";

@IocInjectable()
export class HeaderViewModel extends ViewModelBase<HeaderModel> implements IHeader {
  events: IEventAggregator;
  authService: IAuthenticationService;
  headerName: string;
  pageSubscriptions: CompositeDisposable;

  constructor(@IocInject(CoreTypes.IEventAggregator) events: IEventAggregator, @IocInject(IAuthenticationServiceType) authService: IAuthenticationService) {
    super();
    this.events = events;
    this.authService = authService;
  }

  protected async onInitialize(): Promise<void> {
    this.pageSubscriptions = new CompositeDisposable([
      //Subscribe to Drawer Toggle Events
    this.events.getEvent<DrawerToggleEvents>(DrawerToggleEvents, DrawerToggleEvents.Type).subscribe((eventArgs) => {
      console.debug("Drawer Toggle Event Received", eventArgs.data);
      this.updateModel((model) => (model.isIconLeftAlign = eventArgs.data));
    }),

    this.events.getEvent<HeaderNameEvents>(HeaderNameEvents, HeaderNameEvents.Type).subscribe(async (eventArgs) => {
      console.debug("Header Name Event Received", eventArgs.data);
      this.updateModel((model) => (model.headerName = eventArgs.data));
    })
    ]);
  }

  protected async onCleanup(): Promise<void> {
    this.pageSubscriptions?.dispose();
  }

  GetUsername(): string {
    return this.authService.GetUsername();
  }

  handleClick(events: IEventAggregator, expanded: boolean) {
    events.getEvent<DrawerToggleEvents>(DrawerToggleEvents, DrawerToggleEvents.Type).publish(new DrawerTogglePayload(!expanded));
  }

  handleUserMenuClick(text: any): void {
    if (text === "Logout") {
      this.authService.DoLogout({ redirectUri: window.location.origin });
    }
  }

  protected createModel(): HeaderModel {
    return new HeaderModel();
  }
}
