import { IocInjectable, IViewMapProvider, IViewResolver } from "@kinetix/core";

import WorkspaceView from "./Components/Workspace/WorkspaceView";
import { IWorkspace } from "./Components/Workspace/IWorkspace";
import { WorkspaceViewModel } from "./Components/Workspace/WorkspaceViewModel";

import { AppsView } from "./Components/WorkspaceItems/Apps/AppsView";
import { AppsViewModel, IAppsWorkspaceItem } from "./Components/WorkspaceItems/Apps/AppsViewModel";

import HeaderView from "./Components/WorkspaceHeader/HeaderView";
import { IHeader } from "./Components/WorkspaceHeader/IHeader";
import { HeaderViewModel } from "./Components/WorkspaceHeader/HeaderViewModel";
import { ExternalAppLauncher } from "./Components/WorkspaceItems/Apps/ExternalAppLauncher";
import { ExternalAppLauncherView } from "./Components/WorkspaceItems/Apps/ExternalAppLauncherView";

@IocInjectable()
export class ViewMapProvider implements IViewMapProvider {
  provideMap(resolver: IViewResolver): void {
    resolver.register((model) => <HeaderView dataContext={model as IHeader} title="-" />, HeaderViewModel);
    resolver.register((model) => <WorkspaceView dataContext={model as IWorkspace} />, WorkspaceViewModel);
    resolver.register((model) => <AppsView dataContext={model as IAppsWorkspaceItem} />, AppsViewModel);
    resolver.register((model) => <ExternalAppLauncherView dataContext={model as ExternalAppLauncher} />, ExternalAppLauncher);
  }
}
