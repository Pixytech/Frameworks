import { INotificationStream } from "./INotificationStream";

export interface INotificationData {
  id?: string;
  data?: Record<string, any> | null;
  stream?: INotificationStream | null;
  timestamp?: Date;
}
