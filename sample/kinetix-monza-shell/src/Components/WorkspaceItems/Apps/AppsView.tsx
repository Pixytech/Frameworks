import { AutomationHelper, useViewModelInstance } from "@kinetix/core";
import { Loader } from "@progress/kendo-react-indicators";
import { Card, CardBody, CardHeader, StackLayout } from "@progress/kendo-react-layout";
import { FC } from "react";
import { IAppsWorkspaceItem } from "./AppsViewModel";
import "./apps.scss";
import { Typography } from "@progress/kendo-react-common";
import { Button } from "@progress/kendo-react-buttons";

interface IAppsProps {
  dataContext: IAppsWorkspaceItem;
}

export const AppsView: FC<IAppsProps> = (props) => {
  const dataContext = props.dataContext;

  useViewModelInstance(dataContext);
  const getTiles = () => {
    const tiles = dataContext.model.applications.map((profile, index) => {
      return (
        <Card key={`APP__${profile.name}`} className="card-tile">
          <CardHeader>
            <b style={{ textTransform: "capitalize" }}>{profile.displayName}</b>
          </CardHeader>
          <CardBody>
            <StackLayout style={{ height: "100%" }} orientation="vertical">
              <p>{profile.description}</p>
              <StackLayout orientation="horizontal" align={{ vertical: "bottom", horizontal: "end" }}>
                <Button data-automationid={AutomationHelper.GetId(profile.name)} onClick={() => dataContext.launchProfile(profile)}>
                  Launch
                </Button>
              </StackLayout>
            </StackLayout>
          </CardBody>
        </Card>
      );
    });

    if (dataContext.model.isInBrowser && dataContext.interopProvider.interop) {
      tiles.push(
        <Card key={`APP__Desktop`} className="card-tile">
          <CardHeader>
            <b style={{ textTransform: "capitalize" }}>Desktop Platform</b>
          </CardHeader>
          <CardBody>
            <StackLayout style={{ height: "100%" }} orientation="vertical">
              <p>
                Kinetix desktop platform for the best expericence.
                {dataContext.model.DesktopPlatformInstalled && (
                  <span style={{ opacity: "0.6" }}>
                    {" "}
                    {dataContext.model.PlatformMessage} or
                    <span
                      data-automationid={AutomationHelper.GetId("installButtonManual")}
                      style={{ cursor: "pointer" }}
                      onClick={async () => {
                        await dataContext.interopProvider.interop?.installPlatform();
                      }}
                    >
                      {" "}
                      install.
                    </span>{" "}
                  </span>
                )}
              </p>

              <StackLayout orientation="horizontal" align={{ vertical: "bottom", horizontal: "end" }}>
                {dataContext.model.DesktopPlatformInstalled ? (
                  <Button
                    data-automationid={AutomationHelper.GetId("launchButton")}
                    onClick={async () => {
                      await dataContext.interopProvider.interop?.launchPlatform();
                    }}
                  >
                    Launch
                  </Button>
                ) : (
                  <Button
                    data-automationid={AutomationHelper.GetId("installButton")}
                    onClick={async () => {
                      await dataContext.interopProvider.interop?.installPlatform();
                    }}
                  >
                    Install
                  </Button>
                )}
              </StackLayout>
            </StackLayout>
          </CardBody>
        </Card>
      );
    }
    return tiles;
  };
  return dataContext.model.isLoading ? (
    <Loader />
  ) : (
    <div className="apps">
      <StackLayout style={{ height: "100%", width: "100%" }} orientation="horizontal">
        <StackLayout orientation="vertical" align={{ vertical: "top", horizontal: "start" }}>
          <Typography.h4 themeColor="primary">Welcome to Kinetix application platform</Typography.h4>
          <div className="main-grid">{getTiles()}</div>
        </StackLayout>
      </StackLayout>
    </div>
  );
};
