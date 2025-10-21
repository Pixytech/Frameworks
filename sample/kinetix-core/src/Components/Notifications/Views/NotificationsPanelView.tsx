import "./NotificationsPanel.scss";
import { GroupedNotifications, INotificationsPanel } from "./INotificationsPanel";
import { FC } from "react";
import { ListView, ListViewItemProps } from "@progress/kendo-react-listview";
import { Button } from "@progress/kendo-react-buttons";
import { NotificationTile } from "./NotificationTile";
import { INotificationsPanelItem } from "./INotificationsPanelItem";
import { useViewModelInstance } from "../../../Mvvm";

interface INotificationsPanelProps {
  dataContext: INotificationsPanel;
}

const NotificationItemRender = (props: ListViewItemProps) => {
  let item = props.dataItem as INotificationsPanelItem;
  return (
    <div className="k-chip -md k-rounded-md k-chip-solid k-chip-solid-base">
      <NotificationTile dataContext={item} />
    </div>
  );
};

const GroupedNotificationItemRender = (props: ListViewItemProps) => {
  let item = props.dataItem as GroupedNotifications;
  const firstNotification = item.notifications[0];
  return (
    <div className="groupedTile">
      <div className="groupedHeader">
        {firstNotification.getDateText()}
        <Button
          fillMode="flat"
          onClick={() => {
            firstNotification.parent.clearNotifications(item.notifications.map((x) => x.notification));
          }}
        >
          Clear
        </Button>
      </div>

      <div className="groupedList">
        <ListView item={NotificationItemRender} data={item.notifications} />
      </div>
    </div>
  );
};

export const NotificationsPanelView: FC<INotificationsPanelProps> = (props) => {
  const dataContext = useViewModelInstance(props.dataContext);
  return (
    <div className="notificationPanel">
      {dataContext.model.groupNotifications.length > 0 ? (
        <ListView item={GroupedNotificationItemRender} data={dataContext.model.groupNotifications} />
      ) : (
        <div className="emptyNotification">
          <span className="k-icon k-font-icon k-i-notification .k-i-bell k-icon-md"></span>
          <h4>No Notifications</h4>
          <span>You're up to date!</span>
        </div>
      )}
    </div>
  );
};
