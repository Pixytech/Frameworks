import { FC } from "react";
import { Icon, useViewModelInstance } from "@kinetix/core";
import "./WorkspaceFooterView.scss";
import { Button } from "@progress/kendo-react-buttons";
import { WorkspaceFooterViewModel } from "./WorkspaceFooterViewModel";

export interface IModelAppBar {
  dataContext: WorkspaceFooterViewModel;
}

export interface WorkspaceFooterProps {
  dataContext: WorkspaceFooterViewModel;
}

export const WorkspaceFooterView: FC<WorkspaceFooterProps> = (props: WorkspaceFooterProps) => {
  const dataContext = useViewModelInstance(props.dataContext);

  return (
    <footer className="app-footer">
      <span className="intro-section">
        <span>Powered by</span>
        {dataContext.model.logo && <Icon icon={dataContext.model.logo} className="footer-logo" />}
        {dataContext.model.partnerLogs && dataContext.model.partnerLogs.map(x=><Icon icon={x} className="footer-logo" />) }
      </span>

      <div className="copyright-section">
        <span>{dataContext.model.footerText}</span>
      </div>

      <div className="links-section">
        {dataContext.model.pageContextList.map((item, index) => {
          return (
            <Button
              className="term-links"
              key={`footer-action-${index}`}
              fillMode="link"
              themeColor="primary"
              onClick={() => {
                if (item.link.includes("terms") || item.link.includes("impInfo")) {
                  dataContext.navigator(item.link);
                } else {
                  window.open(item.link);
                }
              }}
            >
              {item.title}
            </Button>
          );
        })}
      </div>
    </footer>
  );
};
