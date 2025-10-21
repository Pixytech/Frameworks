import { ConfigurationItem } from "./ConfigurationItem";
export const IDefaultDataProviderType = Symbol.for("IDefaultDataProvider");
export interface IDefaultDataProvider {
  getDefaultConfigurations(): Promise<ConfigurationItem<any>[]>;
}
