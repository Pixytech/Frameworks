import { type IRestClient, IRestClientType, IocInject, IocInjectable } from "@kinetix/core";
import { ComponentType } from "./ComponentType";
import { firstValueFrom } from "rxjs";

export interface IContextMenuService {
  getContextMenus(application: string, datasetId: string, uiWidgetType: ComponentType, ids: any[]): Promise<string[]>;
}

@IocInjectable()
export class ContextMenuService implements IContextMenuService {
  private readonly api: IRestClient;

  constructor(@IocInject(IRestClientType) api: IRestClient) {
    this.api = api;
  }

  async getContextMenus(application: string, datasetId: string, uiWidgetType: ComponentType, ids: any[]): Promise<string[]> {
    const request = {
      application: application,
      datasetId: datasetId,
      uiWidgetType: uiWidgetType,
      ids: ids,
    };
    const response = await firstValueFrom(this.api.post<any, any>("/api/entity/actions", request));
    return response.actions;
  }
}
