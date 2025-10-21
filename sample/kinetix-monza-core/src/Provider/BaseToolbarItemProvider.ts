import {
  CoreTypes,
  GetConfigurationItemRequest,
  IConfigurationId,
  IocInject,
  IocInjectable,
} from "@kinetix/core";
import type { IConfigurationService } from "@kinetix/core";
import {
  ITicketToolBarItem,
  IToolbarItemProvider,
  ToolbarItemConfigurationItem,
} from "@kinetix/monza-core";

@IocInjectable()
export abstract class BaseToolbarItemProvider implements IToolbarItemProvider {
  configSvc: IConfigurationService;
  abstract ConfigurationId: IConfigurationId;

  constructor(
    @IocInject(CoreTypes.IConfigurationService) configSvc: IConfigurationService
  ) {
    this.configSvc = configSvc;
  }

  async saveToolbarItems(items: ITicketToolBarItem[]): Promise<void> {
    const toolbarConfig = new ToolbarItemConfigurationItem();

    toolbarConfig.application = this.ConfigurationId.application;
    toolbarConfig.category = this.ConfigurationId.category;
    toolbarConfig.section = this.ConfigurationId.section;
    toolbarConfig.item = this.ConfigurationId.item;
    toolbarConfig.value = items;
    await this.configSvc.saveConfiguration<ITicketToolBarItem[]>(toolbarConfig);
  }

  async resetToolbars(): Promise<void> {
    await this.configSvc.deleteConfiguration(this.ConfigurationId);
  }

  async getToolbarItems(): Promise<ITicketToolBarItem[]> {
    const getConfigReq: GetConfigurationItemRequest = {
      application: this.ConfigurationId.application,
      category: this.ConfigurationId.category,
      section: this.ConfigurationId.section,
      item: this.ConfigurationId.item,
    };
    const configItem = await this.configSvc.getConfiguration<
      ITicketToolBarItem[]
    >(getConfigReq);
    console.debug(`Providing Bonds toolbar options`, getConfigReq, configItem);
    return configItem ? configItem.value : [];
  }
}
