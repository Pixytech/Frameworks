export enum NotificationToast {
  /**
   * Enables the notification toast to stay visible on the app until the user interacts with it
   */
  Sticky = "Sticky",
  /**
   * The toasts will follow the default behavior of fading away after a short duration.
   */
  Transient = "Transient",

  /**
   * The toasts will not appear and the notification will only appear in the Notification
   */
  None = "None",
}
