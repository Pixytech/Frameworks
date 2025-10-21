import { FC } from "react";

import { AppBar, AppBarSection, AppBarSpacer } from "@progress/kendo-react-layout";
import { DropDownButton, DropDownButtonItem } from "@progress/kendo-react-buttons";
import { Logo, NotificationsBadge, useViewModelInstance } from "@kinetix/core";
import { IHeader } from "./IHeader";

interface IHeaderProps {
  dataContext: IHeader;
  title: string;
  showLogo?: boolean;
}

export const HeaderView: FC<IHeaderProps> = (props: IHeaderProps) => {
  const dataContext = useViewModelInstance(props.dataContext);

  return (
    <AppBar>
      {props.showLogo && (
        <AppBarSection>
          <Logo />
        </AppBarSection>
      )}
      <AppBarSection>
        <h3 style={{ padding: 0, margin: 0 }} className="title">
          {dataContext.model.headerName ?? props.title}
        </h3>
      </AppBarSection>
      <AppBarSpacer />
      <AppBarSection style={{ marginRight: 5, float: "right" }}>
        <DropDownButton className="buttons-container-button" icon="k-icon k-font-icon k-i-user" text={dataContext.GetUsername()} onItemClick={(e) => dataContext.handleUserMenuClick(e.item.text)}>
          <DropDownButtonItem text="Logout" />
        </DropDownButton>
        <NotificationsBadge />
      </AppBarSection>
    </AppBar>
  );
};
