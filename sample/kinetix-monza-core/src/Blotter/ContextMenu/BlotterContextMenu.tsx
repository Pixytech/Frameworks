import { FC, useRef } from "react";
import { Menu, MenuItem, MenuSelectEvent } from "@progress/kendo-react-layout";
import { Popup } from "@progress/kendo-react-popup";
import { IBlotterContextMenu } from "./BlotterContextMenuViewModel";
import { useViewModelInstance } from "@kinetix/core";
import "./BlotterContextMenu.scss";
interface IBlotterContextMenuProps {
  dataContext: IBlotterContextMenu;
}

export const BlotterContextMenu: FC<IBlotterContextMenuProps> = (props: IBlotterContextMenuProps) => {
  const dataContext = useViewModelInstance(props.dataContext);
  const menuWrapperRef = useRef<HTMLDivElement>(null);
  var blurTimeoutRef: any;

  const onFocusHandler = () => {
    if (blurTimeoutRef) {
      clearTimeout(blurTimeoutRef);
    }

    blurTimeoutRef = undefined;
  };

  const onBlurTimeout = () => {
    dataContext.updateModel((m) => (m.show = false));
  };

  const onBlurHandler = () => {
    if (blurTimeoutRef) {
      clearTimeout(blurTimeoutRef);
    }

    blurTimeoutRef = setTimeout(onBlurTimeout);
  };

  const handleOnSelect = async (e: MenuSelectEvent) => {
    await dataContext.onSelect(e.item.data);
    dataContext.updateModel((m) => (m.show = false));
  };

  const onPopupOpen = (): void => {
    const element = menuWrapperRef.current?.querySelector("[tabindex]");
    if (element) {
      (element as any).focus();
    }
  };

  return (
    <>
      <Popup offset={dataContext.model.offset} show={dataContext.model.show} onOpen={onPopupOpen} popupClass={"popup-content"}>
        <div className="blotterContextMenu" onFocus={onFocusHandler} onBlur={onBlurHandler} tabIndex={-1} ref={menuWrapperRef}>
          <Menu
            vertical={true}
            onSelect={async (e) => {
              await handleOnSelect(e);
            }}
          >
            {dataContext.Menus.map((menu, index) => (
              <MenuItem cssClass={menu.isSeparator === true ? "k-separator" : ""} key={`${menu.displayName}${index}`} disabled={menu.disabled} icon={menu.icon} data={menu.id} text={menu.displayName} />
            ))}
          </Menu>
        </div>
      </Popup>
    </>
  );
};
