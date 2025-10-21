import {
  ConfigurationItem,
  IDefaultDataProvider,
  IocInjectable,
} from "@kinetix/core";
import { IUserPreferenceContext } from "../Widgets";
import { preference } from "./preference.config";

@IocInjectable()
export class UserPreferenceDataProvider implements IDefaultDataProvider {
  getDefaultConfigurations(): Promise<
    ConfigurationItem<IUserPreferenceContext>[]
  > {
    const workspaceConfigs = new ConfigurationItem<IUserPreferenceContext>();
    workspaceConfigs.application = "Monza";
    workspaceConfigs.category = "Workspace";
    workspaceConfigs.section = "Dashboard";
    workspaceConfigs.item = "Preference";
    workspaceConfigs.value = preference;
    return Promise.resolve([workspaceConfigs]);
  }
}
