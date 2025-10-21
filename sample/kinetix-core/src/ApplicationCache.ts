import { CoreTypes } from "./CoreTypes";
import { IocInjectable, IocInject,type IContainer } from "./IoC";
import { IRestClient, IRestClientType } from "./Web";

export interface IApplicationCache{
  /**
   * get cached network resource
   * 
   */
  GetResource(path: string): Promise<any>;
  /**
   * Global app state, variables across app accessible to all components
   * 
   */
  appState: Record<string, any>;
}

export const IApplicationCacheType = Symbol.for("IApplicationCacheType");

@IocInjectable()
export class ApplicationCache implements IApplicationCache{
   api: IRestClient;
   private readonly networkCache: Record<string, any> = {};
  container: IContainer;

    constructor(@IocInject(CoreTypes.IContainer) container: IContainer) {
      this.container = container;
    }

  async GetResource(path: string): Promise<any> {
    if(!this.api){
      this.api = this.container.build<IRestClient>(IRestClientType);
    }

    if (!this.networkCache[path]) {
      const promise = new Promise<any>((resolve, reject) => {
        this.api.get<any>(path).subscribe({
          next: (x) => {
            resolve(x);
          },
          error: (e) => {
            reject(e);
          },
        });
      });

      this.networkCache[path] = await promise;
    }

    return this.networkCache[path];
  }
  appState: Record<string, any> = {};
  
}