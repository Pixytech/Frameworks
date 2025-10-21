import { Button } from "@progress/kendo-react-buttons";
import { useContainer } from "../../../IoC";
import { INotificationService, INotificationServiceType } from "../INotificationService";
import { useViewModelInstance } from "../../../Mvvm";
import "./NotificationsBadge.scss";
import { AutomationHelper } from "../../../AutomationHelper";
export const NotificationsBadge = () => {
  const conatiner = useContainer();
  const dataContext = useViewModelInstance(conatiner.build<INotificationService>(INotificationServiceType));
  const count = Object.keys(dataContext.model.notifications).length;

  return (
    <span className="notificationsBadge">
      <Button
        data-automationid={AutomationHelper.GetId("toggleButton")}
        fillMode={"flat"}
        icon="bell"
        onClick={() => {
          if (dataContext.isPanelVisible) {
            dataContext.hide();
          } else {
            dataContext.show();
          }
        }}
      />
      <span className={`notificationsCount${count > 0 ? "" : " collapsed"}`}>{count}</span>
    </span>
  );
};
