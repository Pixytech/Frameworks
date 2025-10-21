import { IocInjectable } from "./IoC";

export enum NotificationCategory {
  NetworkError = "Network-Error",
}

export const INotificationsCategoryProviderType = Symbol.for("INotificationsCategoryProviderType");

export interface INotificationsCategoryProvider {
  getNotificationCategories(): string[];
}

@IocInjectable()
export class NotificationsCategoryProvider implements INotificationsCategoryProvider {
  getNotificationCategories(): string[] {
    return Object.values(NotificationCategory);
  }
}
