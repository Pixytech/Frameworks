import { IRegistry, ObjectLifecycle, CoreTypes, IContainer, IApplicationRoutesType } from "@kinetix/core";
import { AppRoutes } from "./Components/Shell/AppRoutes";

import { DefaultShellViewModel } from "./Components/Shell/DefaultShellViewModel";
import { IDefaultShellType } from "./Components/Shell/IDefaultShell";
import { WorkspaceViewModel } from "./Components/Workspace/WorkspaceViewModel";
import { HeaderViewModel } from "./Components/WorkspaceHeader/HeaderViewModel";
import { AppsViewModel } from "./Components/WorkspaceItems/Apps/AppsViewModel";
import { ViewMapProvider } from "./ViewMapProvider";
import { ExternalAppLauncher } from "./Components/WorkspaceItems/Apps/ExternalAppLauncher";

export class Registry implements IRegistry {
  configure(container: IContainer): void {
    container.registerType(HeaderViewModel, ObjectLifecycle.Singleton);
    container.registerType(WorkspaceViewModel, ObjectLifecycle.Singleton);
    container.registerType(AppsViewModel, ObjectLifecycle.Singleton);
    container.registerType(ExternalAppLauncher, ObjectLifecycle.Transient);
    container.register(CoreTypes.IShell, DefaultShellViewModel, ObjectLifecycle.Singleton);
    container.register(IDefaultShellType, DefaultShellViewModel, ObjectLifecycle.Singleton);

    container.register(CoreTypes.IViewMapProvider, ViewMapProvider, ObjectLifecycle.Singleton);
    container.register(IApplicationRoutesType, AppRoutes, ObjectLifecycle.Transient);
  }
}
