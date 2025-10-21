import { INotificationsCategoryProvider, IocInjectable } from "@kinetix/core";

export enum NotificationCategory {
  Blotters = "Blotters",
}

@IocInjectable()
export class NotificationsCategoryProvider implements INotificationsCategoryProvider {
  getNotificationCategories(): string[] {
    return Object.values(NotificationCategory);
  }
}
