import { IViewModelBase } from "../../../Mvvm";
import { INotificationOption } from "../INotificationOption";
import { INotificationsPanel } from "./INotificationsPanel";

export class NotificationsPanelItemModel {
  isHovered: boolean = false;
}
export interface INotificationsPanelItem extends IViewModelBase<NotificationsPanelItemModel> {
  readonly parent: INotificationsPanel;
  onCommandClick(onClick: Record<string, any> | undefined): Promise<void>;
  getTime(): string;
  close(): void;
  toggleHover(state: boolean): void;
  readonly notification: Required<INotificationOption>;
  getDateText(): string;
}
