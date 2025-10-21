import { FC } from "react";

import { AppBar, AppBarSection, AppBarSpacer } from "@progress/kendo-react-layout";
import { Button } from "@progress/kendo-react-buttons";
import "./PageTitleBar.scss";
import { useNavigateNoUpdates } from "./NavigationService/NaviationHooks";


interface IHeaderProps {
  title?: string;
  showBack?: boolean;
}

export const PageTitleBar: FC<IHeaderProps> = (props: IHeaderProps) => {
  const navigate = useNavigateNoUpdates();
  return (
    <AppBar className="page-title-bar">
      {props.showBack && (
        <Button
          onClick={(e) => {
            navigate(-1);
          }}
          className="k-rounded-md"
          icon="arrow-chevron-left"
          fillMode={"flat"}
          style={{ background: "none", paddingLeft: 0 }}
        ></Button>
      )}
      <AppBarSection>
        <h3 style={{ padding: 0, margin: 0 }} className="title">
          {props.title}
        </h3>
      </AppBarSection>
      <AppBarSpacer />
    </AppBar>
  );
};
