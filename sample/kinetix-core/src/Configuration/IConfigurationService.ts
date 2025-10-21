import { GetConfigurationItemRequest } from "./GetConfigurationItemRequest";
import { IConfigurationId, IConfigurationItem } from "./models";

export interface IConfigurationService {
  getCachedConfigurations(): IConfigurationId[];
  getConfiguration<T>(
    request: GetConfigurationItemRequest
  ): Promise<IConfigurationItem<T> | undefined>;

  getMatchedConfigurations(
    request: Partial<GetConfigurationItemRequest>,
    preserveNodeSettings: boolean,
    user?: string
  ): Promise<IConfigurationItem<any>[]>;

  saveConfiguration<T>(config: IConfigurationItem<T>): Promise<void>;
  deleteConfiguration(configId: IConfigurationId): Promise<void>;
}
