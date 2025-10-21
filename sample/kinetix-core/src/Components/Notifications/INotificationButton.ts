export interface INotificationButton {
  icon?: string;
  text: string;
  theme?: null | "base" | "primary" | "secondary" | "tertiary" | "info" | "success" | "warning" | "error" | "dark" | "light" | "inverse";
  onClick?: Record<string, any>;
}
