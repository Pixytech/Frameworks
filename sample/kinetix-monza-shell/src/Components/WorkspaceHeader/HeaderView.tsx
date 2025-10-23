import { FC } from "react";

import { AppBar, AppBarSection, AppBarSpacer } from "@progress/kendo-react-layout";
import { DropDownButton, DropDownButtonItem } from "@progress/kendo-react-buttons";
import { AutomationHelper, Logo, NotificationsBadge, useViewModelInstance } from "@kinetix/core";
import { IHeader } from "./IHeader";

interface IHeaderProps {
  dataContext: IHeader;
  title: string;
}

const HeaderView: FC<IHeaderProps> = (props: IHeaderProps) => {
  const dataContext = useViewModelInstance(props.dataContext);

  return (
    <AppBar style={{ padding: 0 }}>
      
      <AppBarSection>
      <li className="k-drawer-item drawer-item" style={{paddingBlock:4 ,paddingInline:4}}>
        <Logo />
      </li>
      </AppBarSection>
      <AppBarSpacer/>
      <AppBarSection>
        <h3 className="title">
          {props.title}
        </h3>
        
      </AppBarSection>
      <AppBarSpacer />
      <AppBarSection style={{ marginRight: 5, float: "right" }}>
        <DropDownButton
          className="buttons-container-button"
          icon="k-icon k-font-icon k-i-user"
          text={dataContext.GetUsername()}
          popupSettings={{
            popupClass: AutomationHelper.GetId("logoutButtonContainer"),
          }}
          id={AutomationHelper.GetId("userButton")}
          onItemClick={(e) => dataContext.handleUserMenuClick(e.item.text)}
        >
          <DropDownButtonItem text="Logout" />
        </DropDownButton>
        <NotificationsBadge />
      </AppBarSection>
    </AppBar>
  );
};
export default HeaderView;
