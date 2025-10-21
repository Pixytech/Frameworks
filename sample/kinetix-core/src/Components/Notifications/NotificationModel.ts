import { INotificationOption, INotification } from "./INotificationOption";
import { INotificationStream } from "./INotificationStream";

export class NotificationModel {
  notifications: Record<string, INotification<INotificationOption>> = {};
  panelHidden: boolean = true;
  autoHide: boolean = false;
  streams: Record<string, INotificationStream> = {};
  isLoaded: boolean = false;
}
