import { Icon, IHeaderTemplateProps, useViewModelInstance } from "@kinetix/core";
import { Button } from "@progress/kendo-react-buttons";
import { StackLayout } from "@progress/kendo-react-layout";
import { FC } from "react";
import { IFormViewModelBase } from ".";

import pinIcon from "../resources/images/pin.svg";
import UnpinIcon from "../resources/images/unpin.svg";

export const TitleBarView: FC<IHeaderTemplateProps> = (props: IHeaderTemplateProps) => {
  const form = props.dataContext as IFormViewModelBase;
  const dataContext = form.titleBar;
  useViewModelInstance(dataContext);

  return (
    <span className="ticket-dialog-header">
      <StackLayout orientation="horizontal" align={{ horizontal: "start", vertical: "middle" }} gap={8}>
        {typeof dataContext.model.icon == "string" ? <Icon icon={dataContext.model.icon} /> : <>{dataContext.model.icon}</>}
        <StackLayout orientation="vertical" gap={8} align={{ vertical: "middle", horizontal: "start" }}>
          <span className="header-title">{dataContext.model.title}</span>
          {dataContext.model.subtitle && (
            <span className="header-sub-title" data-automationid="subTitle">
              {dataContext.model.subtitle}
            </span>
          )}
        </StackLayout>
      </StackLayout>
      {form.allowPin && (
        <span className="header-icons">
          <Button
            className="focusable-form-field"
            onClick={() => {
              dataContext.updateModel((m) => {
                m.isPinned = !m.isPinned;
              });
            }}
            fillMode={"flat"}
          >
            {<img className="icon" src={dataContext.model.isPinned ? pinIcon : UnpinIcon} alt={dataContext.model.isPinned ? "pin" : "unpin"} />}
          </Button>
          <i className="k-icon k-font-icon k-i-more-vertical"></i>
        </span>
      )}
    </span>
  );
};
