import { Button } from "@progress/kendo-react-buttons";
import { FC } from "react";
import "./NotificationTile.scss";
import { useViewModelInstance } from "../../../Mvvm";
import { INotificationsPanelItem } from "./INotificationsPanelItem";
import { AutomationHelper } from "../../../AutomationHelper";
import { IndicatorColorUtil } from "../INotificationIndicator";

interface INotificationTileProps {
  dataContext: INotificationsPanelItem;
}

export const NotificationTile: FC<INotificationTileProps> = (props) => {
  const dataContext = useViewModelInstance(props.dataContext);
  const item = dataContext.notification;

  return (
    <div className="notification" onMouseEnter={() => dataContext.toggleHover(true)} onMouseLeave={() => dataContext.toggleHover(false)}>
      {item.indicator ? (
        <span className="notificationIndicator" style={{ backgroundColor: `${item.indicator.color ? IndicatorColorUtil.toAdjustedColor(item.indicator.color) : "transparent"}` }}>
          <span> {item.indicator.text} </span>
        </span>
      ) : (
        <></>
      )}

      <span className="notificationHeader">
        <span>
          {item.icon && item.icon.length > 0 ? <span className={`headerIcon k-icon k-font-icon ${item.icon}`}></span> : <span className="headerNoicon">{`${item.title} `.substring(0, 1).toUpperCase()}</span>}
          {item.stream ? (
            <span>
              {item.stream.application} ({item.stream.category}){" "}
            </span>
          ) : (
            <span>{item.title}</span>
          )}
        </span>

        {dataContext.model.isHovered ? (
          <span>
            {dataContext.notification.allowReminder && <Button fillMode="flat" icon="clock" />}

            <Button data-automationid={AutomationHelper.GetId("closeButton")} fillMode="flat" icon="close" onClick={() => dataContext.close()} />
          </span>
        ) : (
          <span>{dataContext.getTime()}</span>
        )}
      </span>
      <div className="notificationBody">
        <div className="notificationTitle">{item.title}</div>
        {item.body}
      </div>
      <div className="notificationFotter">
        {item.actions?.map((action) => {
          return (
            <Button
              key={`button-${action.text}`}
              fillMode="flat"
              icon={action.icon}
              themeColor={action.theme}
              onClick={() => {
                dataContext.onCommandClick(action.onClick);
              }}
            >
              {action.text}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
