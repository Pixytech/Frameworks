import { IViewModelBase } from "../../../Mvvm";
import { INotificationOption } from "../INotificationOption";
import { INotificationsPanelItem } from "./INotificationsPanelItem";

export const INotificationsPanelType = Symbol.for("INotificationsPanelType");

export class NotificationsPanelModel {
  groupNotifications: GroupedNotifications[] = [];
  allNotifications: INotificationsPanelItem[] = [];
}

export type GroupedNotifications = { key: string; notifications: INotificationsPanelItem[] };

export interface INotificationsPanel extends IViewModelBase<NotificationsPanelModel> {
  onCommandClick(notification: Required<INotificationOption>, onClick: Record<string, any> | undefined): Promise<void>;
  clearNotifications(notifications: Required<INotificationOption>[]): Promise<void>;
}
