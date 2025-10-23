import { FC } from "react";
import { ExternalAppLauncher } from "./ExternalAppLauncher";
import { Frame, useViewModelInstance } from "@kinetix/core";
import { Loader } from "@progress/kendo-react-indicators";
import "./ExternalAppLauncher.scss";
interface IExternalAppLauncherProps {
  dataContext: ExternalAppLauncher;
}

export const ExternalAppLauncherView: FC<IExternalAppLauncherProps> = (props) => {
  const dataContext = useViewModelInstance(props.dataContext);
  return (
    <div className="appLauncher">
      <div className="frame">
        <Frame src={dataContext.model.frameSrc}>
          <div></div>
        </Frame>
      </div>
      <div className="content">
        <Loader className="loader" size="large" type="infinite-spinner" />
        {dataContext.model.message}
      </div>
    </div>
  );
};
