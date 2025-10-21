
import { type IConfigurationService } from "../../Configuration";
import { CoreTypes } from "../../CoreTypes";
import { IocInjectable, IocInject } from "../../IoC";
import { INotificationSettings } from "../NavigationService/INotificationSettings";
import { INotificationOption } from "./INotificationOption";
import { INotificationFilter } from "./INotificationService";

@IocInjectable()
export class NotificationFilter implements INotificationFilter {
  configurationService: IConfigurationService;
  notificationSettings: INotificationSettings;

  constructor(@IocInject(CoreTypes.IConfigurationService) configurationService: IConfigurationService) {
    this.configurationService = configurationService;
  }

  async initialize(): Promise<void> {
    const configItem = await this.configurationService.getConfiguration<INotificationSettings>({
      application: "Monza",
      category: "Core",
      section: "App",
      item: "Notifications",
    });
    if (configItem?.value != null) {
      this.notificationSettings = configItem.value;
    } else {
      this.notificationSettings = {
        categoryFilter: [],
      };
    }
  }

  canNotify(notification: INotificationOption): boolean {
    const category = notification.stream?.category;
    const notificationSetting = this.notificationSettings?.categoryFilter.find((x) => x.category === category);
    if (notificationSetting) {
      return notificationSetting.enabled;
    } else {
      return true;
    }
  }
}
