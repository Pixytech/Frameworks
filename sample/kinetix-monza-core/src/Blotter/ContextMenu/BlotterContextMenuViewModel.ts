import { CoreTypes, getNavigationAware, INavigationAware, IocInject, IViewModelBase, ViewModelBase } from "@kinetix/core";
import type { IContainer } from "@kinetix/core";
import { Offset } from "@progress/kendo-react-popup";
import { IMenuProviderType } from "./IMenuProvider";
import { ContextMenuService } from "./ContextMenuService";
import { MenuItem } from "./MenuItem";
import { ComponentType } from "./ComponentType";
import type { IMenuProvider } from "./IMenuProvider";
import type { IContextMenuService } from "./ContextMenuService";
import { Params, NavigateFunction, Location } from "react-router-dom";
import { BlotterSelectionContext } from "./BlotterSelectionContext";

export interface IBlotterContextMenu extends IViewModelBase<ContextMenuModel>, INavigationAware {
  onSelect(id: string): Promise<void>;
  onContextMenu(offset: Offset, ComponentId: string, datasetID: string, context: BlotterSelectionContext): Promise<void>;
  onDoubleClick(ComponentId: string, datasetID: string, selection: BlotterSelectionContext): Promise<void>;
  Menus: MenuItem[];
  isDefaultMenuEnabled: boolean;
}

export class ContextMenuModel {
  show: boolean;
  offset: Offset;
}

export class BlotterContextMenuViewModel extends ViewModelBase<ContextMenuModel> implements IBlotterContextMenu {
  selection: BlotterSelectionContext;
  menuProviders: IMenuProvider[];
  Menus: MenuItem[] = [];
  container: IContainer;
  contextMenuService: IContextMenuService;
  QueryParams: Readonly<Params<string>>;
  navigator: NavigateFunction;
  location: Location;
  isDefaultMenuEnabled: boolean = true;

  constructor(@IocInject(CoreTypes.IContainer) container: IContainer, @IocInject(ContextMenuService) contextMenuService: IContextMenuService) {
    super();
    this.contextMenuService = contextMenuService;
    this.container = container;
  }

  async onDoubleClick(ComponentId: string, datasetID: string, selection: BlotterSelectionContext): Promise<void> {
    const filteredProvider = this.menuProviders.find((x) => x.ComponentId.includes(ComponentId) || x.ComponentId.length === 0);
    if (filteredProvider) {
      await filteredProvider.onDoubleClick(datasetID, selection, {
        location: this.location,
        navigator: this.navigator,
        QueryParams: this.QueryParams,
      });
    } else {
      console.warn(`Menu provider is not defined for component  ${ComponentId}`);
    }
  }

  protected async onInitializeOnce(): Promise<void> {
    this.menuProviders = this.container
      .buildAll<IMenuProvider>(IMenuProviderType)
      .filter((x) => x.ComponentType.includes(ComponentType.Blotter) || x.ComponentType.includes(ComponentType.Any))
      .sort((a, b) => b.ComponentId.length - a.ComponentId.length);

    console.debug("Blotter menu provider ", this.menuProviders);
  }

  async onContextMenu(offset: Offset, ComponentId: string, datasetId: string, context: BlotterSelectionContext): Promise<void> {
    this.updateModel((m) => {
      m.offset = offset;
      m.show = false;
    });

    this.Menus = [];

    const filteredProviders = this.menuProviders.filter((x) => x.ComponentId.includes(ComponentId) || (this.isDefaultMenuEnabled && x.ComponentId.length === 0));
    console.debug(`onContextMenu id:${ComponentId}, datasetId:${datasetId}, providerCount:${filteredProviders.length}`);
    for (let index = 0; index < filteredProviders.length; index++) {
      const provider = filteredProviders[index];
       const navigationAware = getNavigationAware(provider);
      if(navigationAware){
        navigationAware.QueryParams = this.QueryParams;
        navigationAware.navigator = this.navigator;
        navigationAware.location = this.location;
      }
      let items = await provider.getContextMenus(datasetId, context, this.contextMenuService);
      // insert seperate after first item & exclude last menu set
      if (index > 0 && index < filteredProviders.length && items.length > 0 && this.Menus.length > 0) {
        items = [
          {
            id: `seperator${index}`,
            isSeparator: true,
            onSelect: async () => {},
          },
          ...items,
        ];
      }

      items.forEach((item) => {
        this.Menus.push(item);
      });
    }
    if (this.Menus.length > 0) {
      this.selection = context;

      this.updateModel((m) => {
        m.offset = offset;
        m.show = true;
      });
    }
  }

  async onSelect(id: string): Promise<void> {
    const menuItem = this.Menus.find((x) => x.id === id);
    if (menuItem) {
      console.debug("onSelect menu", menuItem);
      await menuItem.onSelect(this.selection, {
        location: this.location,
        navigator: this.navigator,
        QueryParams: this.QueryParams,
      });
    }
  }

  protected createModel(): ContextMenuModel {
    return new ContextMenuModel();
  }
}
