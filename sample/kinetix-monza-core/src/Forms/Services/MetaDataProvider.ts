import { IApplicationCacheType, IocInject, IocInjectable } from "@kinetix/core";
import type { IApplicationCache } from "@kinetix/core";

import { IMetaDataProvider } from "./IMetaDataProvider";

export const IMetaDataProviderType = Symbol.for("IMetaDataProvider");

@IocInjectable()
export class MetaDataProvider implements IMetaDataProvider {
  cache: IApplicationCache;
  constructor(@IocInject(IApplicationCacheType) cache: IApplicationCache) {
    this.cache = cache;
  }

  set<T>(variableName: string, value: T): void {
    this.cache.appState[variableName] = value;
  }

  get<T>(variableName: string): T {
    return this.cache.appState[variableName] as T;
  }

  getAll() {
    return this.cache.appState;
  }

  async getMetaData(path: string): Promise<any> {
    return this.cache.GetResource(path);
  }
}
