import { IocInjectable } from "../../../IoC";
import { ViewModelBase } from "../../../Mvvm";
import { TimeSpan } from "../../../Utils";
import { INotificationOption } from "../INotificationOption";
import { type INotificationsPanel } from "./INotificationsPanel";
import { INotificationsPanelItem, NotificationsPanelItemModel } from "./INotificationsPanelItem";

@IocInjectable()
export class NotificationsPanelItem extends ViewModelBase<NotificationsPanelItemModel> implements INotificationsPanelItem {
  public readonly notification: Required<INotificationOption>;

  constructor(item: Required<INotificationOption>, parent: INotificationsPanel) {
    super();
    this.notification = item;
    this.parent = parent;
  }

  async onCommandClick(onClick: Record<string, any> | undefined): Promise<void> {
    await this.parent.onCommandClick(this.notification, onClick);
  }

  getTime(): string {
    const date = this.notification.timestamp;
    const currentDate = new Date();
    const timeSpan = TimeSpan.fromDates(currentDate, date);
    if (timeSpan.minutes == 0) {
      return "now";
    } else if (timeSpan.hours == 0) {
      return `${timeSpan.minutes} min ago`;
    }

    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }).trim();
  }

  close(): void {
    this.parent.clearNotifications([this.notification]);
  }

  toggleHover(state: boolean): void {
    this.updateModel((x) => (x.isHovered = state));
  }

  getDateText(): string {
    const date = this.notification.timestamp;
    const currentDate = new Date();
    const timeSpan = TimeSpan.fromDates(currentDate, date);
    if (timeSpan.days == 0) {
      return "Today";
    } else if (timeSpan.days == 1) {
      return "Yesterday";
    } else if (timeSpan.days <= 7) {
      const day = date.toLocaleString("en-us", { weekday: "long" });
      return `Last ${day}`;
    }
    return date.toDateString();
  }

  protected createModel(): NotificationsPanelItemModel {
    return new NotificationsPanelItemModel();
  }

  parent: INotificationsPanel;
}
