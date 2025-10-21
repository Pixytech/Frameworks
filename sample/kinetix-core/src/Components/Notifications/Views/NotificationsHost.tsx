import { Button } from "@progress/kendo-react-buttons";
import { useViewModelInstance } from "../../../Mvvm";
import { INotificationService } from "../INotificationService";
import "./NotificationsHost.scss";
import { ToasterNotificationsView } from "./ToasterNotifications";
import { AutomationHelper } from "../../../AutomationHelper";
import { INotificationsPanelType } from "./INotificationsPanel";
import { RegionView } from "../../RegionView";

interface INotificationsHostProps {
  dataContext: INotificationService;
}

export const NotificationsHost = (props: INotificationsHostProps) => {
  let notificationService = useViewModelInstance(props.dataContext);
  const count = Object.keys(notificationService.model.notifications).length;
  return (
    <>
      {notificationService.model.isLoaded && notificationService.allowNotifications && (
        <div className={`notificationsHost${notificationService.isPanelVisible ? "" : " collapsed"}`}>
          <div className="notification-panel">
            <div className="header">
              <span className="title">
                Notifications
                <span className={`notificationsCount${count > 0 ? "" : " collapsed"}`}>{count}</span>
              </span>
              {count > 0 && (
                <Button
                  size="small"
                  fillMode="flat"
                  onClick={() => {
                    notificationService.clearAll();
                  }}
                >
                  Clear all
                </Button>
              )}

              <Button data-automationid={AutomationHelper.GetId("hideButton")} fillMode={"flat"} icon="close" onClick={() => notificationService.hide()} />
            </div>
            <div className="main">
              <RegionView type={INotificationsPanelType} />
            </div>
          </div>
          
          {!notificationService.isPanelVisible && (
            <div className="toasters">
              <ToasterNotificationsView />
            </div>
          )}
        </div>
      )}
    </>
  );
};
