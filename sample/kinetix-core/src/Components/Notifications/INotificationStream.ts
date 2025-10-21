export interface INotificationStream {
  application?: string;
  type: "System" | "Custom";
  category: string;
}
