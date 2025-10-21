import { IConfigurationId, IocInjectable } from "@kinetix/core";
import { ITicketToolBarItem, IToolbarItemProvider } from "@kinetix/monza-core";

@IocInjectable()
export class ToolbarItemProvider implements IToolbarItemProvider {
  ConfigurationId: IConfigurationId;

  resetToolbars(): Promise<void> {
    return Promise.resolve();
  }
  saveToolbarItems(items: ITicketToolBarItem[]): Promise<void> {
    return Promise.resolve();
  }
  async getToolbarItems(): Promise<ITicketToolBarItem[]> {
    return [];
  }
}
