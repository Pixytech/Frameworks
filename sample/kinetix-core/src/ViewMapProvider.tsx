import { MessageBoxView, INotificationsPanel, MultiUserSession, MultiUserSessionViewModel } from ".";
import { MessageBoxViewModel } from "./Components/MessageBoxService/MessageBoxViewModel";
import { NotificationsPanel } from "./Components/Notifications/Views/NotificationsPanel";
import { NotificationsPanelView } from "./Components/Notifications/Views/NotificationsPanelView";
import { IocInjectable } from "./IoC";
import { IViewMapProvider, IViewResolver } from "./Mvvm";

@IocInjectable()
export class ViewMapProvider implements IViewMapProvider {
  provideMap(resolver: IViewResolver): void {
    resolver.register((viewModel) => <MessageBoxView dataContext={viewModel as MessageBoxViewModel} />, MessageBoxViewModel);
    resolver.register((model) => <NotificationsPanelView dataContext={model as INotificationsPanel} />, NotificationsPanel);
    resolver.register((model) => <MultiUserSession dataContext={model as MultiUserSessionViewModel} />, MultiUserSessionViewModel);
  }
}
