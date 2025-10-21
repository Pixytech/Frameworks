import { NotificationActionTrigger } from "./NotificationActionTrigger";
import { INotificationData } from "./INotificationData";
import { INotificationStream } from "./INotificationStream";
import { PubSubEvent } from "../../Messaging";

export class NotificationPayload implements Readonly<Required<INotificationData>> {
  public readonly actionTrigger: NotificationActionTrigger;
  public readonly actionData: Record<string, any> | null;
  public readonly id: string;
  public readonly data: Record<string, any> | null;
  public readonly stream: INotificationStream | null;
  public readonly timestamp: Date;

  constructor(id: string, timestamp: Date, actionTrigger: NotificationActionTrigger, stream: INotificationStream | null, data: Record<string, any> | null, actionData: Record<string, any> | null) {
    this.actionTrigger = actionTrigger;
    this.actionData = actionData;
    this.id = id;
    this.data = data;
    this.stream = stream;
    this.timestamp = timestamp;
  }
}

export class NotificationEvent extends PubSubEvent<NotificationPayload> {
  public static readonly Type = Symbol.for("NotificationEvent");
}
