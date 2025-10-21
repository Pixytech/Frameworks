import { ConfigurationItem } from "@kinetix/core";
import { IWidgetContainerDefinition } from "@kinetix/monza-core";

export interface IDashboardConfiguration {
  showMainToolbar: boolean;
  showMiniToolbar: boolean;
  widgets: IWidgetContainerDefinition[];
}

export class DashboardConfigurationItem extends ConfigurationItem<IDashboardConfiguration> {}
