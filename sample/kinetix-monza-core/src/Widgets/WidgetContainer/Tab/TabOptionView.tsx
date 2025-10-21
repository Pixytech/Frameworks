import { useViewModelInstance, Icon, AutomationHelper } from "@kinetix/core";
import { Button } from "@progress/kendo-react-buttons";
import { Menu, MenuItem } from "@progress/kendo-react-layout";
import { Popup } from "@progress/kendo-react-popup";
import React, { FC } from "react";
import { ITabOptions } from ".";
import { IWidgetTab } from "..";
import { useOutsideBoundsClick } from "../../../Utils/useOutsideBoundsClick";

interface ITabOptionsProps {
  dataContext: ITabOptions;
  tab: IWidgetTab;
}

export const TabOptionView: FC<ITabOptionsProps> = (props) => {
  const dataContext = useViewModelInstance(props.dataContext);
  const anchor = React.useRef<HTMLButtonElement | null>(null);

  const contentRef = useOutsideBoundsClick(() =>
    dataContext.updateModel((m) => {
      m.show = false;
    })
  );

  return (
    <>
      {dataContext.model.options && dataContext.model.options.length > 0 && (
        <span className="options-icon">
          <span ref={anchor}>
            <Button
              fillMode="flat"
              data-automationid={AutomationHelper.GetId("options")}
              onClick={(e) => {
                dataContext.OnTabFocus(true);
                dataContext.updateModel((m) => {
                  m.show = !m.show;
                });
              }}
            >
              <Icon icon="moreActionsVertical" />
            </Button>
          </span>
          <Popup anchor={anchor.current} show={dataContext.model.show} popupClass={"popup-content"} popupAlign={{ horizontal: "left", vertical: "top" }}>
            <div autoFocus className="blotterContextMenu" ref={contentRef} tabIndex={0}>
              <Menu
                vertical={true}
                onSelect={(e) => {
                  dataContext.updateModel((m) => {
                    m.show = false;
                  });
                  dataContext.OnItemClick(e.item.data, props.tab);
                }}
              >
                {dataContext.model.options.map((menu, index) => (
                  <MenuItem cssClass={menu.isSeparator === true ? "k-separator" : ""} key={`${menu.displayName}${index}`} disabled={menu.disabled} icon={menu.icon} data={menu.id} text={menu.displayName} />
                ))}
              </Menu>
            </div>
          </Popup>
        </span>
      )}
    </>
  );
};
