import { Guid } from "typescript-guid";
import { INotificationData } from "./INotificationData";
import { INotificationOption, INotificationCreateOption, INotification } from "./INotificationOption";
import { type INotificationFilter, INotificationFilterType, INotificationService } from "./INotificationService";
import { INotificationStream } from "./INotificationStream";
import { NotificationSeverity } from "./NotificationSeverity";
import { NotificationActionTrigger } from "./NotificationActionTrigger";
import { NotificationEvent, NotificationPayload } from "./NotificationEvent";
import { NotificationToast } from "./NotificationToast";
import { CoreTypes } from "../../CoreTypes";
import { type IContainer, IocInject, IocInjectable } from "../../IoC";
import { type IEventAggregator } from "../../Messaging";
import { ViewModelBase } from "../../Mvvm";
import { TimeSpan } from "../../Utils";
import { NotificationModel } from "./NotificationModel";
import { IApplicationType, type IApplication } from "../../IApplication";
import { IRestClient, IRestClientType } from "../../Web";
import { IndicatorColor } from "./INotificationIndicator";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import customParseFormat from "dayjs/plugin/customParseFormat";


@IocInjectable()
export class NotificationService extends ViewModelBase<NotificationModel> implements INotificationService {
  events: IEventAggregator;
  application: IApplication;
  notificationFilter: INotificationFilter;
  container: IContainer;

  constructor(@IocInject(CoreTypes.IEventAggregator) events: IEventAggregator, @IocInject(IApplicationType) application: IApplication, @IocInject(INotificationFilterType) notificationFilter: INotificationFilter, @IocInject(CoreTypes.IContainer) container: IContainer) {
    super();
    this.events = events;
    this.application = application;
    this.notificationFilter = notificationFilter;
    this.container = container;
  }

  protected async onInitializeOnce(): Promise<void> {
    await this.notificationFilter.initialize();
    this.loadNotifications();
    this.updateModel((x) => (x.isLoaded = true))
  }

  loadNotifications() {
    const url = "/api/users/notifications";
    this.container.build<IRestClient>(IRestClientType).get(url).subscribe({
      next: (data: any) => {
        if (data?.length > 0) {
          dayjs.extend(customParseFormat);
          dayjs.extend(utc);

         for (const notification of data) {
           const timestamp = notification.timestamp ?  dayjs.utc(notification.timestamp, "YYYY-MM-DD HH:mm:ss").toDate() : undefined;
            this.raise({
              id: notification.id,
              title: notification.title,
              body: notification.body,
              toast: NotificationToast.Sticky,
              severity: notification.severity,
              timestamp: timestamp,
              indicator: {
                color: IndicatorColor.Yellow,
              },
            }); 
          }
        }
      },
    })
  }

  getApplicationId(): string {
    const parts = window.location.pathname.split("/");
    const profileFromUrl = parts.length > 1 ? parts[1] : "Monza";
    const appId = this.application.cache.appState["app.name"] || profileFromUrl;
    return appId;
  }

  allowNotifications: boolean = true;

  protected createModel(): NotificationModel {
    return new NotificationModel();
  }

  async getNotifications(): Promise<INotificationData[]> {
    const filteredList: INotificationData[] = [];
    Object.keys(this.model.notifications).forEach((key) => {
      const item = this.model.notifications[key];
      filteredList.push({
        id: item.id,
        data: item.data,
        stream: item.stream,
        timestamp: item.timestamp,
      });
    });
    return filteredList;
  }

  async raise<T extends INotificationOption>(option: T, createOption?: INotificationCreateOption): Promise<INotification<T> | null> {
    if (this.notificationFilter.canNotify(option)) {
      const notification = this.createNotificationOption(option);
      if (createOption?.reminderDate) {
        const msDiff = TimeSpan.fromDates(createOption.reminderDate, notification.timestamp);
        console.debug("Will create notification after ms", msDiff);
        if (msDiff.totalMilliseconds > 0) {
          setTimeout(() => {
            console.debug("notification created", notification.id);
            this.updateModel((m) => {
              m.notifications[notification.id] = notification;
            });
          }, msDiff.totalMilliseconds);
          return notification;
        }
      }

      this.updateModel((m) => {
        m.notifications[notification.id] = notification;
        if (notification.toast == NotificationToast.Transient) {
          this.autoCloseOnExpired(notification);
        }
      });
      return notification;
    } else {
      return null;
    }
  }

  async update<T extends INotificationOption>(id: string, option: Partial<T>): Promise<INotification<T> | undefined> {
    const existingOption = this.model.notifications[id];
    if (existingOption) {
      const updatedOption = { ...existingOption, ...option };
      updatedOption.id = existingOption.id;
      this.updateModel((m) => {
        m.notifications[id] = updatedOption;
      });
      return updatedOption;
    }

    return existingOption;
  }

  private autoCloseOnExpired(notification: Required<INotificationOption>) {
    if (notification.expires) {
      const msDiff = TimeSpan.fromDates(notification.expires, notification.timestamp);
      if (msDiff.totalMilliseconds > 0) {
        console.debug("will expire notification in ", msDiff.totalMilliseconds);
        setTimeout(async () => {
          console.debug("notification expired", notification.id);
          this.closeNotification(notification.id, NotificationActionTrigger.Expire);
        }, msDiff.totalMilliseconds);
        return notification;
      }
    }
  }

  async onCommandClick(notification: Required<INotificationOption>, onClick: Record<string, any> | undefined): Promise<boolean> {
    return await this.closeNotification(notification.id, NotificationActionTrigger.Control, onClick);
  }

  async clear(id: string): Promise<boolean> {
    return this.closeNotification(id, NotificationActionTrigger.Manual);
  }

  getActionData(trigger: NotificationActionTrigger, notification: INotification<INotificationOption>, controlActionData?: Record<string, any>): Record<string, any> | null {
    let actionData: Record<string, any> | null = null;

    switch (trigger) {
      case NotificationActionTrigger.Close:
        actionData = notification.onClose ? notification.onClose : null;
        break;
      case NotificationActionTrigger.Expire:
        actionData = notification.onExpire ? notification.onExpire : null;
        break;
      case NotificationActionTrigger.Select:
        actionData = notification.onSelect ? notification.onSelect : null;
        break;
      case NotificationActionTrigger.Control:
        actionData = controlActionData ? controlActionData : null;
        break;
      case NotificationActionTrigger.Manual:
        break;
    }

    return actionData;
  }

  private closeNotification(id: string, trigger: NotificationActionTrigger, controlActionData?: Record<string, any>): boolean {
    const activeNotifications: Record<string, INotification<INotificationOption>> = {};
    const closedNotification = this.model.notifications[id];

    Object.keys(this.model.notifications).forEach((key) => {
      if (key !== id) {
        activeNotifications[key] = this.model.notifications[key];
      }
    });
    this.updateModel((m) => {
      m.notifications = activeNotifications;
    });

    if (closedNotification) {
      const actionData = this.getActionData(trigger, closedNotification, controlActionData);

      this.events.getEvent<NotificationEvent>(NotificationEvent, NotificationEvent.Type).publish(new NotificationPayload(closedNotification.id, closedNotification.timestamp, trigger, closedNotification.stream, closedNotification.data, actionData));
    }

    return true;
  }

  async clearAll(): Promise<void> {
    this.updateModel((m) => {
      m.notifications = {};
    });
  }

  async hide(): Promise<void> {
    this.updateModel((m) => {
      m.panelHidden = true;
    });
  }

  get isPanelVisible(): boolean {
    return !this.model.panelHidden;
  }

  async show(): Promise<void> {
    this.updateModel((m) => {
      m.panelHidden = false;
    });
  }

  async setAutoHide(flag: boolean): Promise<boolean> {
    this.updateModel((m) => {
      m.autoHide = flag;
    });
    return true;
  }

  async registerStream(stream: INotificationStream): Promise<void> {
    const key = this.getStreamKey(stream);
    this.updateModel((m) => {
      m.streams[key] = stream;
    });
  }

  async getStreams(): Promise<INotificationStream[]> {
    const filteredList: INotificationStream[] = [];
    Object.keys(this.model.streams).forEach((key) => {
      const item = this.model.streams[key];
      filteredList.push(item);
    });
    return filteredList;
  }

  private getStreamKey(stream: INotificationStream): string {
    return `${stream.application}-${stream.category}-${stream.type}`;
  }

  private createNotificationOption(option: INotificationOption): INotification<INotificationOption> {
    const currentDate = new Date();
    const expiryDate = new Date(currentDate.getTime() + 10000);

    const notification: INotification<INotificationOption> = {
      id: option.id ? option.id : Guid.create().toString(),
      actions: option.actions ? option.actions : [],
      body: option.body ? option.body : "",
      icon: option.icon ? option.icon : "",
      data: option.data ? option.data : null,
      indicator: option.indicator ? option.indicator : null,
      allowReminder: option.allowReminder ? option.allowReminder : true,
      expires: option.expires ? option.expires : option.toast == NotificationToast.Transient ? expiryDate : null,
      onClose: option.onClose ? option.onClose : null,
      onExpire: option.onExpire ? option.onExpire : null,
      onSelect: option.onSelect ? option.onSelect : null,
      severity: option.severity ? option.severity : NotificationSeverity.Low,
      tag: option.tag ? option.tag : "",
      title: option.title ? option.title : "",
      timestamp: option.timestamp ? option.timestamp : currentDate,
      stream: option.stream
        ? {
            application: option.stream.application ? option.stream.application : this.getApplicationId(),
            category: option.stream.category,
            type: option.stream.type,
          }
        : null,
      toast: option.toast ? option.toast : NotificationToast.None,
    };

    return notification;
  }
}
