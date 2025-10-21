import { FC } from "react";
import "./ToasterNotifications.scss";
import { useViewModelInstance } from "../../../Mvvm";
import { ListView, ListViewItemProps } from "@progress/kendo-react-listview";
import { useContainer } from "../../../IoC";
import { INotificationsPanel, INotificationsPanelType } from "./INotificationsPanel";
import { NotificationToast } from "../NotificationToast";
import { INotificationsPanelItem } from "./INotificationsPanelItem";
import { NotificationTile } from "./NotificationTile";

interface IToasterNotificationsProps {}

const NotificationItemRender = (props: ListViewItemProps) => {
  let item = props.dataItem as INotificationsPanelItem;
  return (
    <div className="k-chip -md k-rounded-md k-chip-solid k-chip-solid-base">
      <NotificationTile dataContext={item} />
    </div>
  );
};

export const ToasterNotificationsView: FC<IToasterNotificationsProps> = (props) => {
  const container = useContainer();
  const dataContext = useViewModelInstance(container.build<INotificationsPanel>(INotificationsPanelType));
  const toasterNotifications = dataContext.model.allNotifications.filter((x) => x.notification.toast !== NotificationToast.None);
  return <div className="toasterPanel">{toasterNotifications.length > 0 ? <ListView item={NotificationItemRender} data={toasterNotifications} /> : <></>}</div>;
};
