import { INotificationButton, INotificationCreateOption, INotificationData, INotificationOption, NotificationModel, INotificationService, INotificationStream, NotificationSeverity, NotificationToast, ViewModelBase, type IEventAggregator, type IApplication, CoreTypes, IApplicationType, IocInject, type INotificationFilter, INotificationFilterType } from "@kinetix/core";
import Glue, { Glue42 } from "@glue42/desktop";

export class GlueNotificationService extends ViewModelBase<NotificationModel> implements INotificationService {
  events: IEventAggregator;
  application: IApplication;
  glue: Glue42.Glue;
  notificationFilter: INotificationFilter;

  constructor(@IocInject(CoreTypes.IEventAggregator) events: IEventAggregator, @IocInject(IApplicationType) application: IApplication, @IocInject(INotificationFilterType) notificationFilter: INotificationFilter) {
    super();
    this.events = events;
    this.notificationFilter = notificationFilter;
    this.application = application;
  }

  async onInitializeOnce(): Promise<void> {
    this.glue = await Glue({ appManager: true, windows: true });
    console.debug("Glue Notification", this.glue.notifications);
    await this.glue.notifications.configure({ enable: true, enableToasts: true });
    await this.notificationFilter.initialize();
    this.updateModel((x) => (x.isLoaded = true));
  }

  async raise<T extends INotificationOption>(option: T, createOption?: INotificationCreateOption | undefined): Promise<Required<INotificationOption> | null> {
    if (this.notificationFilter.canNotify(option)) {
      console.debug("raising interop notification", option);
      const currentDate = new Date();
      const expiryDate = new Date(currentDate.getTime() + 5000);

      const notificationOptions: Glue42.Notifications.Glue42NotificationOptions = this.toGlueNotificationOption(option, createOption);
      if (notificationOptions.toastExpiry == undefined && option.toast === NotificationToast.Transient) {
        notificationOptions.toastExpiry = expiryDate.valueOf();
      }

      console.debug("raising interop notification", notificationOptions);
      const notification = await this.glue.notifications.raise(notificationOptions);
      const kxNotification = await this.toKintixNotificationOption(notification);
      notification.onclick = (e) => {
        this.onCommandClick(kxNotification, kxNotification.onSelect ? kxNotification.onSelect : undefined);
      };

      this.glue.notifications.onClosed(async (data) => {
        if (data.id == kxNotification.id) {
          this.onCommandClick(kxNotification, kxNotification.onClose ? kxNotification.onClose : undefined);
        }
      });

      return kxNotification;
    } else {
      return null;
    }
  }

  async clearAll(): Promise<void> {
    await this.glue.notifications.clearAll();
  }

  async getNotifications(): Promise<INotificationData[]> {
    const result: INotificationData[] = [];
    const notifications = await this.glue.notifications.list();
    notifications.forEach((notification) => {
      result.push({
        data: notification.data,
        id: notification.id,
        stream: notification.tag
          ? {
              application: notification.instanceId,
              category: notification.tag,
              type: "System",
            }
          : undefined,
        timestamp: notification.timestamp ? new Date(notification.timestamp) : new Date(),
      });
    });
    return result;
  }

  toGlueNotificationOption<T extends INotificationOption>(option: T, createOption: INotificationCreateOption | undefined): Glue42.Notifications.Glue42NotificationOptions {
    const notificationOptions: Glue42.Notifications.Glue42NotificationOptions = {
      //id: option.id ? option.id : undefined,
      title: option.title,
      body: option.body ? option.body : "",
      icon: option.icon ? option.icon : "",
      toastExpiry: option.expires ? option.expires.valueOf() : undefined,
      panelExpiry: option.expires ? option.expires.valueOf() : undefined,
      type: "Notification",
      timestamp: option.timestamp ? option.timestamp.valueOf() : Date.now(),

      actions: option.actions
        ? option.actions.map((a, index) => {
            return {
              title: a.text,
              action: `button_${index}`,
              icon: a.icon,
            } as Glue42.Notifications.Glue42NotificationAction;
          })
        : undefined,
      data: option.data ? option.data : undefined,
      severity: option.severity ? this.toGlueSeverity(option.severity) : "Low",
    };

    return notificationOptions;
  }
  toGlueSeverity(severity: NotificationSeverity): "Low" | "Medium" | "High" | "Critical" | "None" | undefined {
    switch (severity) {
      case NotificationSeverity.Critical:
        return "Critical";
      case NotificationSeverity.High:
        return "High";
      case NotificationSeverity.Medium:
        return "Medium";
      case NotificationSeverity.Low:
        return "Low";
    }
  }

  toKintixNotificationOption(notification: Glue42.Notifications.Glue42Notification): Required<INotificationOption> | PromiseLike<Required<INotificationOption>> {
    return {
      id: notification.id,
      body: "",
      data: notification.data,
      expires: notification.toastExpiry ? new Date(notification.toastExpiry) : null,

      icon: notification.icon ? notification.icon : "",

      title: notification.title,
      timestamp: new Date(notification.timestamp ? notification.timestamp : Date.now()),

      severity: this.toKinetixSeverity(notification.severity),
      tag: notification.tag ? notification.tag : "",
      toast: NotificationToast.Transient,
      indicator: null,
      allowReminder: false,
      onClose: null,
      onExpire: null,
      onSelect: null,
      stream: {
        application: notification.instanceId,
        category: notification.tag ? notification.tag : "",
        type: "Custom",
      },
      actions: notification.actions
        ? notification.actions.map((button) => {
            return {
              text: button.title,
              icon: button.icon,
              theme: null,
            } as INotificationButton;
          })
        : [],
    };
  }
  toKinetixSeverity(severity: string | undefined): NotificationSeverity {
    switch (severity) {
      case "Low":
        return NotificationSeverity.Low;
      case "Medium":
        return NotificationSeverity.Medium;
      case "High":
        return NotificationSeverity.High;
      case "Critical":
        return NotificationSeverity.Critical;
    }

    return NotificationSeverity.Low;
  }

  async update<T extends INotificationOption>(id: string, option: Partial<T>): Promise<Required<INotificationOption> | undefined> {
    throw new Error("Method not implemented.");
  }

  async clear(id: string): Promise<boolean> {
    await this.glue.notifications.clear(id);
    return true;
  }

  get isPanelVisible(): boolean {
    return !this.model.panelHidden;
  }

  getApplicationId(): string {
    const parts = window.location.pathname.split("/");
    const profileFromUrl = parts.length > 1 ? parts[1] : "Monza";
    const appId = this.application.cache.appState["app.name"] || profileFromUrl;
    return appId;
  }

  onCommandClick(notification: Required<INotificationOption>, onClick: Record<string, any> | undefined): Promise<boolean> {
    return Promise.resolve(true);
  }

  allowNotifications: boolean = false;

  protected createModel(): NotificationModel {
    return new NotificationModel();
  }

  async show(): Promise<void> {
    await this.glue.notifications.panel.show();
    this.updateModel((x) => (x.panelHidden = false));
  }

  async hide(): Promise<void> {
    await this.glue.notifications.panel.hide();
    this.updateModel((x) => (x.panelHidden = true));
  }

  async setAutoHide(flag: boolean): Promise<boolean> {
    this.updateModel((m) => {
      m.autoHide = true;
    });
    return true;
  }

  async getStreams(): Promise<INotificationStream[]> {
    const filteredList: INotificationStream[] = [];
    Object.keys(this.model.streams).forEach((key) => {
      const item = this.model.streams[key];
      filteredList.push(item);
    });
    return filteredList;
  }

  async registerStream(stream: INotificationStream): Promise<void> {
    const key = this.getStreamKey(stream);
    this.updateModel((m) => {
      m.streams[key] = stream;
    });
  }

  private getStreamKey(stream: INotificationStream): string {
    return `${stream.application}-${stream.category}-${stream.type}`;
  }
}
