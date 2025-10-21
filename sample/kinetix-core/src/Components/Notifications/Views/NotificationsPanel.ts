import { GroupedNotifications, INotificationsPanel, NotificationsPanelModel } from "./INotificationsPanel";
import { IocInjectable, IocInject } from "../../../IoC";
import { ViewModelBase } from "../../../Mvvm";
import { INotificationOption } from "../INotificationOption";
import { type INotificationService, INotificationServiceType } from "../INotificationService";
import { groupBy } from "../../../Utils";
import { using } from "../../../Core";
import { INotificationsPanelItem } from "./INotificationsPanelItem";
import { NotificationsPanelItem } from "./NotificationPanelItem";

@IocInjectable()
export class NotificationsPanel extends ViewModelBase<NotificationsPanelModel> implements INotificationsPanel {
  notificationService: INotificationService;

  constructor(@IocInject(INotificationServiceType) notificationService: INotificationService) {
    super();
    this.notificationService = notificationService;
  }

  async onCommandClick(notification: Required<INotificationOption>, onClick: Record<string, any> | undefined): Promise<void> {
    this.notificationService.onCommandClick(notification, onClick);
  }

  async clearNotifications(notifications: Required<INotificationOption>[]): Promise<void> {
    for (const notification of notifications) {
      using(this.notificationService.SuspendNotifications(), () => {
        this.notificationService.clear(notification.id);
      });
      this.notificationService.notifyModelChanged();
    }
  }

  async buildGroupedNotifications(): Promise<void> {
    this.updateModel((m) => {
      const result: INotificationsPanelItem[] = [];
      Object.keys(this.notificationService.model.notifications).forEach((key) => {
        const item = this.notificationService.model.notifications[key];
        const panelItem = new NotificationsPanelItem(item, this);
        result.push(panelItem);
      });

      const groupedResult: GroupedNotifications[] = [];
      const groupedData = groupBy(result, (item) => item.getDateText());

      Object.keys(groupedData).forEach((key) => {
        const item = groupedData[`${key}`];
        groupedResult.push({ key: `${key}`, notifications: item });
      });

      m.groupNotifications = groupedResult;
      m.allNotifications = result;
    });
  }

  protected async onInitializeOnce(): Promise<void> {
    this.notificationService.onModelChanged.subscribe(async (x) => {
      await this.buildGroupedNotifications();
    });
    await this.buildGroupedNotifications();
  }

  protected createModel(): NotificationsPanelModel {
    return new NotificationsPanelModel();
  }
}
