import { IViewModelBase } from "../../Mvvm";
import { INotificationData } from "./INotificationData";
import { INotification, INotificationCreateOption, INotificationOption } from "./INotificationOption";
import { INotificationStream } from "./INotificationStream";
import { NotificationModel } from "./NotificationModel";

export const INotificationServiceType = Symbol.for("INotificationServiceType");

export const INotificationFilterType = Symbol.for("INotificationFilter");

export interface INotificationFilter {
  initialize(): Promise<void>;
  canNotify(notification: INotificationOption): boolean;
}

export interface INotificationService extends IViewModelBase<NotificationModel> {
  onCommandClick(notification: Required<INotificationOption>, onClick: Record<string, any> | undefined): Promise<boolean>;

  readonly allowNotifications: boolean;
  /**
   *
   * @param id notification id to clear
   */
  clear(id: string): Promise<boolean>;

  /**
   * A list of all available notification objects.
   */
  getNotifications(): Promise<INotificationData[]>;

  /**
   * creates a new notification
   * @param notificationOption
   */
  raise<T extends INotificationOption>(option: T, createOption?: INotificationCreateOption): Promise<INotification<T> | null>;
  /**
   * Clears all notifications from the Notification Panel.
   */
  clearAll(): Promise<void>;

  /**
   * Hides the Notification Panel.
   */
  hide(): Promise<void>;
  /**
   * Whether the Notification Panel is currently open.
   */
  readonly isPanelVisible: boolean;
  /**
   * Shows the Notification Panel.
   */
  show(): Promise<void>;
  /**
   *
   * @param flag Accepts a Boolean value as an argument and specifies whether the Notification Panel should hide automatically when it loses focus.
   */
  setAutoHide(flag: boolean): Promise<boolean>;

  /**
   *
   * @param id Update the notification
   * @param notificationOption
   */

  update<T extends INotificationOption>(id: string, option: Partial<T>): Promise<INotification<T> | undefined>;

  /**
   *
   * @param stream application invoke this to register NotificationStream that are supported
   */
  registerStream(stream: INotificationStream): Promise<void>;

  /**
   * Get list of registered streams
   */
  getStreams(): Promise<INotificationStream[]>;
}
