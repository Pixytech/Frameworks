import { Button } from "@progress/kendo-react-buttons";
import { Window, WindowActionsBar } from "@progress/kendo-react-dialogs";
import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { IAuthenticationService, IAuthenticationServiceType } from "../../Auth";
import { AutomationHelper } from "../../AutomationHelper";
import { useContainer } from "../../IoC";
import { INavigationService } from "./INavigationService";
import { NavigationRoutes } from "./NavigationRoutes";

interface INavigationServiceProps {
  dataContext: INavigationService;
}

export const UnAuthorized = () => {
  const container = useContainer();
const navigate = useNavigate();
  const logout = () => {
    const authService = container.build<IAuthenticationService>(IAuthenticationServiceType);
    authService.DoLogout({ redirectUri: new URL("../",window.location.href).href });
  };
  return (
    <Window
      title={
        <span>
          <span style={{ fontSize: 18, marginRight: "2px", color: "red" }} className="k-icon k-font-icon k-i-calendar"></span> Operation not allowed
        </span>
      }
      modal={true}
      resizable={false}
      closeButton={() => null}
      minimizeButton={() => null}
      restoreButton={() => null}
      maximizeButton={() => null}
    >
      <div style={{ padding: "1em", fontSize: "16px" }}>
        <div>Access to this resource is not allowed. Please logout and contact support helpdesk.</div>
      </div>
      <WindowActionsBar layout={"end"}>
      <Button type="button" data-automationid={AutomationHelper.GetId("go-back-button")} onClick={()=>{
        navigate(-1);
      }}>Go Back</Button>
        <Button type="button" data-automationid={AutomationHelper.GetId("logout-button")} onClick={logout}>Logout</Button>
      </WindowActionsBar>
    </Window>
  );
};

export const NavigationServiceView: FC<INavigationServiceProps> = (props: INavigationServiceProps) => {
  const dataContext = props.dataContext;
  
  console.debug("render-navigation", dataContext.appsRoutes);
  return <NavigationRoutes routes={dataContext.appsRoutes} />;
};
