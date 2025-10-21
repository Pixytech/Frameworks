import {
  CustomizedAt,
  GetConfigurationItemRequest,
  IConfigurationId,
  IConfigurationItem,
  IConfigurationService,
  IocInjectable,
} from "@kinetix/core";
import { omit, set } from "lodash";
import { api } from "../Utils/api";

@IocInjectable()
export class ConfigurationService implements IConfigurationService {
  private configCache: Record<string, IConfigurationId> = {};

  getCachedConfigurations(): IConfigurationId[] {
    return Object.keys(this.configCache).map((key) => this.configCache[key]);
  }

  async getMatchedConfigurations(
    request: Partial<GetConfigurationItemRequest>,
    preserveNodeSettings: boolean,
    user?: string
  ): Promise<IConfigurationItem<any>[]> {
    const urlParts: string[] = [];
    if (request.application) {
      urlParts.push(`application=${request.application}`);
    }
    if (request.category) {
      urlParts.push(`category=${request.category}`);
    }

    if (request.section) {
      urlParts.push(`section=${request.section}`);
    }

    if (request.item) {
      urlParts.push(`item=${request.item}`);
    }

    if (user) {
      urlParts.push(`user=${user}`);
    }

    const url = `/config/ui?${urlParts.join("&")}`;

    const configObj = await api(url);

    if (configObj && configObj.configuration?.length > 0) {
      return configObj.configuration.map((c: IConfigurationItem<any>) => {
        const rawUnwrappedItem = this.getUnwrappedItem<any>(c);

        const unwrappedItem = omit(rawUnwrappedItem, [
          "id",
        ]) as IConfigurationItem<any>;
        if (!unwrappedItem.customizedAt) {
          unwrappedItem.customizedAt = CustomizedAt.User;
        }
        if (!preserveNodeSettings) {
          // mark all configs as user to avoid saving them to thier defaults
          unwrappedItem.appliesTo = [];
          unwrappedItem.customizedAt = CustomizedAt.User;
        }
        return unwrappedItem;
      });
    } else {
      return [];
    }
  }

  getUnwrappedItem<T>(item: any): IConfigurationItem<T> {
    const configItemWrapped: IConfigurationItem<T> = {
      ...item,
    } as IConfigurationItem<T>;

    // value is wrapped with value/item
    var configItemWithoutValue = omit(configItemWrapped, "value");
    // added check for backward compatibility
    const wrappedValue = item.value.item ? item.value.item : item.value;
    const configItem = set(
      configItemWithoutValue,
      "value",
      wrappedValue
    ) as IConfigurationItem<T>;
    return configItem;
  }

  async getConfiguration<T>(
    request: GetConfigurationItemRequest
  ): Promise<IConfigurationItem<T> | undefined> {
    const key = this.getItemKey(request);
    if (!this.configCache[key]) {
      const configObj = await api(
        `/config/ui?application=${request.application}&category=${request.category}&section=${request.section}&item=${request.item}`
      );
      if (configObj && configObj.configuration?.length > 0) {
        const item = configObj.configuration.find(
          (c: IConfigurationItem<any>) =>
            c.application === request.application &&
            c.category === request.category &&
            c.section === request.section &&
            c.item === request.item
        );

        if (!item) {
          return undefined;
        }

        const rawConfigItem = this.getUnwrappedItem<T>(item);
        // mark all configs as user to avoid saving them to thier defaults
        const configItem = omit(rawConfigItem, [
          "id",
          "customizedAt",
          "appliesTo",
        ]) as IConfigurationItem<T>;
        configItem.appliesTo = [];
        configItem.customizedAt = CustomizedAt.User;

        this.configCache[key] = configItem;
        return configItem;
      } else {
        return undefined;
      }
    } else {
      return this.configCache[key] as IConfigurationItem<T>;
    }
  }

  async saveConfiguration<T>(item: IConfigurationItem<T>): Promise<void> {
    const key = this.getItemKey(item);
    // wrap the value into object - server side implemantion can't handle array as value
    var configItem = omit({ ...item }, "value");
    configItem = set(configItem, "value", { item: item.value });
    const response = await api("/config/ui", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(configItem),
    });

    // we store the original item without wrapper
    this.configCache = omit(this.configCache, key);
    //this.configCache[key] = item;
    console.debug("Config saved successfully.RESPONSE", response);
  }

  deleteConfiguration = async (configId: IConfigurationId): Promise<void> => {
    var key = this.getItemKey(configId);
    var response = await api(
      `/config/ui?application=${configId.application}&category=${configId.category}&section=${configId.section}&item=${configId.item}`,
      { method: "DELETE" }
    );
    delete this.configCache[key];
    console.debug("Config deleted successfully", response);
  };

  private getItemKey = (id: IConfigurationId): string => {
    return `${id.application}.${id.category}.${id.section}.${id.item}`;
  };
}
