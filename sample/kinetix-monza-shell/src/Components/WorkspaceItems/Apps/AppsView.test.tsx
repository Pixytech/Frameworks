// reflect-metadata is required for IOC
import "reflect-metadata";
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { createMock } from "ts-auto-mock";
import { AppsView } from "./AppsView";

import { hostComponent } from "../../../../../../testing";

import { IAppsWorkspaceItem } from "./AppsViewModel";
import { AppsModel } from "./AppsModel";
import { IInteropClient, IInteropProvider, ProfileType } from "@kinetix/core";

// Base Package
describe("Kinetix Monza Shell", () => {
  // Scoped module

  let mockAppsWorkspaceItem: IAppsWorkspaceItem;

  beforeEach(() => {
    mockAppsWorkspaceItem = createMock<IAppsWorkspaceItem>({
      model: new AppsModel(),
      interopProvider: createMock<IInteropProvider>({
        interop: createMock<IInteropClient>(),
      }),
    });

    mockAppsWorkspaceItem.model.isLoading = false;
    mockAppsWorkspaceItem.model.applications = [
      {
        name: "App1-TEST-NAME",
        displayName: "App1-TEST-DISPLAYNAME",
        description: "App1-TEST-DESCRIPTION",
        hidden: false,
        modules: [],
        roles: ["Admin"],
        users: [],
        type: ProfileType.Web,
      },
      {
        name: "App2-TEST-NAME",
        displayName: "App2-TEST-DISPLAYNAME",
        description: "App2-TEST-DESCRIPTION",
        hidden: true,
        modules: [],
        roles: ["Admin"],
        users: [],
        type: ProfileType.Web,
      },
    ];
  });

  afterEach(() => {
    cleanup();
    jest.resetAllMocks();
  });

  // Note: running cleanup afterEach is done automatically for you in @testing-library/react@9.0.0 or higher
  // unmount and cleanup DOM after the test is finished.
  afterEach(cleanup);

  // Testing Component
  describe("AppsView", () => {
    // TEST:  Kinetix App > ApplicationHost > component should be created without style attribute

    it("Render loader", async () => {
      mockAppsWorkspaceItem.model.isLoading = true;
      let sut = hostComponent(<AppsView dataContext={mockAppsWorkspaceItem} />);
      const view = render(sut);
      expect(view).not.toBeNull();
    });

    it("Render app tiles", async () => {
      let sut = hostComponent(<AppsView dataContext={mockAppsWorkspaceItem} />);
      const view = render(sut);
      expect(view).not.toBeNull();

      expect(screen.getByText("App1-TEST-DISPLAYNAME")).toBeInTheDocument();
      const tileButton = screen.getByTestId("App1-TEST-NAME");
      fireEvent.click(tileButton);
      expect(mockAppsWorkspaceItem.launchProfile).toBeCalled();
    });

    it("Render desktop tile install", async () => {
      mockAppsWorkspaceItem.model.isInBrowser = true;
      mockAppsWorkspaceItem.model.DesktopPlatformInstalled = false;
      mockAppsWorkspaceItem.model.PlatformMessage = "TEST_PLATFORM";

      let sut = hostComponent(<AppsView dataContext={mockAppsWorkspaceItem} />);
      const view = render(sut);
      expect(view).not.toBeNull();

      const installButton = screen.getByText("Install");
      expect(installButton).toBeInTheDocument();
      fireEvent.click(installButton);
      expect(mockAppsWorkspaceItem.interopProvider.interop?.installPlatform).toBeCalled();
    });

    it("Render desktop tile Launch", async () => {
      mockAppsWorkspaceItem.model.isInBrowser = true;
      mockAppsWorkspaceItem.model.DesktopPlatformInstalled = true;
      mockAppsWorkspaceItem.model.PlatformMessage = "TEST_PLATFORM";
      let sut = hostComponent(<AppsView dataContext={mockAppsWorkspaceItem} />);
      const view = render(sut);
      expect(view).not.toBeNull();

      const launchButton = screen.getByTestId("launchButton");

      fireEvent.click(launchButton);
      expect(mockAppsWorkspaceItem.interopProvider.interop?.launchPlatform).toBeCalled();
    });

    it("Render desktop tile install link", async () => {
      mockAppsWorkspaceItem.model.isInBrowser = true;
      mockAppsWorkspaceItem.model.DesktopPlatformInstalled = true;
      mockAppsWorkspaceItem.model.PlatformMessage = "TEST_PLATFORM";
      let sut = hostComponent(<AppsView dataContext={mockAppsWorkspaceItem} />);
      const view = render(sut);
      expect(view).not.toBeNull();

      const launchButton = screen.getByTestId("installButtonManual");

      fireEvent.click(launchButton);
      expect(mockAppsWorkspaceItem.interopProvider.interop?.installPlatform).toBeCalled();
    });
  });
});
