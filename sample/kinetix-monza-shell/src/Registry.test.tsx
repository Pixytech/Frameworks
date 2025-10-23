// reflect-metadata is required for IOC

import "reflect-metadata";
import { CoreTypes, IApplicationRoutesType, IContainer, ObjectLifecycle } from "@kinetix/core";
import { Registry } from "./Registry";
import { IDefaultShellType } from "./Components/Shell/IDefaultShell";
import { DefaultShellViewModel } from "./Components/Shell/DefaultShellViewModel";
import { createMock } from "ts-auto-mock";
import { AppRoutes } from "./Components/Shell/AppRoutes";
import { WorkspaceViewModel } from "./Components/Workspace/WorkspaceViewModel";
import { HeaderViewModel } from "./Components/WorkspaceHeader/HeaderViewModel";
import { AppsViewModel } from "./Components/WorkspaceItems/Apps/AppsViewModel";
import { ViewMapProvider } from "./ViewMapProvider";
import { ExternalAppLauncher } from "./Components/WorkspaceItems/Apps/ExternalAppLauncher";

// Base Package
describe("Kinetix Monza Shell", () => {
  // Scoped module
  let sut: Registry;
  let mockContainer: IContainer;

  // Execute once before all tests
  // To create single module for all tests
  beforeAll(() => {
    sut = new Registry();
    mockContainer = createMock<IContainer>();
  });

  // Testing Component
  describe("Registry", () => {
    // TEST:  Kinetix Core > Registry > should configure dependency
    it("should configure dependency", () => {
      sut.configure(mockContainer);

      expect(mockContainer.registerType).toBeCalledWith(HeaderViewModel, ObjectLifecycle.Singleton);

      expect(mockContainer.registerType).toBeCalledWith(ExternalAppLauncher, ObjectLifecycle.Transient);

      expect(mockContainer.registerType).toBeCalledWith(WorkspaceViewModel, ObjectLifecycle.Singleton);
      expect(mockContainer.registerType).toBeCalledWith(AppsViewModel, ObjectLifecycle.Singleton);
      expect(mockContainer.register).toBeCalledWith(CoreTypes.IShell, DefaultShellViewModel, ObjectLifecycle.Singleton);
      expect(mockContainer.register).toBeCalledWith(IDefaultShellType, DefaultShellViewModel, ObjectLifecycle.Singleton);

      expect(mockContainer.register).toBeCalledWith(CoreTypes.IViewMapProvider, ViewMapProvider, ObjectLifecycle.Singleton);
      expect(mockContainer.register).toBeCalledWith(IApplicationRoutesType, AppRoutes, ObjectLifecycle.Transient);
    });
  });
});
