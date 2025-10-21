import { INotificationData } from "./INotificationData";
import { INotificationButton } from "./INotificationButton";
import { NotificationSeverity } from "./NotificationSeverity";
import { NotificationToast } from "./NotificationToast";
import { INotificationIndicator } from "./INotificationIndicator";

export interface INotificationCreateOption {
  /**
   * The date on which the notification will be removed from reminders category and recreated created as regular notification.
   * If this date is earlier than the notification creation time, the notification will be created immediately. Cannot be earlier than the expiry date, if set.
   */
  reminderDate?: Date;
}

export interface INotificationOption extends INotificationData {
  /**
   * The icon of the notification.
   */
  icon?: string;
  /**
   * The title of the notification.
   */
  title: string;

  /**
   * When set to sticky this settings enables the notification toast to stay visible on the app until
   * the user interacts with it. When set to transient the toasts will follow the default behavior of fading away after a short duration.
   * When set to none the toasts will not appear and the notification will only appear in the Notification Center.
   */
  toast?: NotificationToast;

  tag?: string;

  /**
   * The content of the notification.
   */
  body?: string;
  /**
   * Defines the urgency of the notification which is represented visually by different colors in the notification UI.
   */
  severity?: NotificationSeverity;

  /**
   * Add a semantic visual indicator to a notification, to signal to the user the nature of the event that they are being notified about.
   */
  indicator?: INotificationIndicator | null;

  /**
   * If set to false, the user won't be able to set a reminder for this notification. default is true
   */
  allowReminder?: boolean;
  actions?: INotificationButton[];
  expires?: Date | null;
  onClose?: Record<string, any> | null;
  /**
   * This action will only be raised on clicks to the notification body. Interactions with buttons (both application-defined buttons, and the default 'X' close button) will not trigger a select action.
   * @param e : data associated with this notification
   * @returns
   */
  onSelect?: Record<string, any> | null;

  onExpire?: Record<string, any> | null;
}

export type INotification<T extends INotificationOption> = Required<INotificationOption>;
