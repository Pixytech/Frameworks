import { CompositeDisposable, CoreTypes, IocInject, ViewModelBase, groupBy } from "@kinetix/core";
import type { IContainer, IEventAggregator } from "@kinetix/core";
import { IocInjectable } from "@kinetix/core";
import { BlotterData, BlotterLaunchEvent, ITicketToolBarItem, IToolbarItemProvider, TicketData, TicketLaunchEvent, ToolbarOptionChangeEvent, TradingCoreTypes } from "..";
import { IMainToolbar } from "./IMainToolbar";
import { MainToolbarModel } from "./MainToolbarModel";

@IocInjectable()
export class MainToolbarViewModel extends ViewModelBase<MainToolbarModel> implements IMainToolbar {
  readonly events: IEventAggregator;
  private readonly container: IContainer;
  pageSubscriptions: CompositeDisposable;

  constructor(@IocInject(CoreTypes.IContainer) builder: IContainer, @IocInject(CoreTypes.IEventAggregator) events: IEventAggregator) {
    super();
    this.events = events;
    this.container = builder;
  }

  protected async onInitializeOnce(): Promise<void> {
    await this.getNewTicketMenus();
  }

  protected async onInitialize(): Promise<void> {
      this.pageSubscriptions = new CompositeDisposable([
        this.events.getEvent<ToolbarOptionChangeEvent>(ToolbarOptionChangeEvent, ToolbarOptionChangeEvent.Type).subscribe(async (e) => {
          await this.getNewTicketMenus();
        })
      ]);
  }

  protected async onCleanup(): Promise<void> {
    this.pageSubscriptions?.dispose();
  }

  private async getNewTicketMenus(): Promise<void> {
    let providers = this.container.buildAll<IToolbarItemProvider>(TradingCoreTypes.ITicketToolbarProvider);
    let toolbarItems: ITicketToolBarItem[] = [];
    for (const provider of providers) {
      toolbarItems.push(...(await provider.getToolbarItems()));
    }

    this.updateModel((m) => (m.MenuItems = groupBy(toolbarItems, (toolbarItem) => toolbarItem.Catagory)));
  }

  launchTicket = async (data: TicketData): Promise<void> => {
    this.events.getEvent<TicketLaunchEvent>(TicketLaunchEvent, TicketLaunchEvent.Type).publish(data);
  };

  launchBlotter = async (data: BlotterData): Promise<void> => {
    this.events.getEvent<BlotterLaunchEvent>(BlotterLaunchEvent, BlotterLaunchEvent.Type).publish(data);
  };

  protected createModel(): MainToolbarModel {
    return new MainToolbarModel();
  }
}
