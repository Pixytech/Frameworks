// reflect-metadata is required for IOC
import "reflect-metadata";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { createMock } from "ts-auto-mock";
import WorkspaceView from "./WorkspaceView";
import { IWorkspace } from "./IWorkspace";
import { WorkspaceModel } from "./WorkspaceModel";
import { arrange, hostComponent } from "../../../../../testing";
import { INotificationService, IContainer, NotificationModel, INotificationServiceType } from "@kinetix/core";

// Base Package
describe("Kinetix Monza Shell", () => {
  // Scoped module

  let mockWorkspace: IWorkspace;
  let mockNotificationService: INotificationService;
  let mockContainer: IContainer;

  beforeEach(() => {
    mockNotificationService = createMock<INotificationService>({ model: new NotificationModel() });
    mockContainer = createMock<IContainer>();
    mockWorkspace = createMock<IWorkspace>({ model: new WorkspaceModel() });
    arrange(mockContainer).stubMethod("build", () => mockNotificationService, [INotificationServiceType]);
  });

  afterEach(() => {
    cleanup();
    jest.resetAllMocks();
  });

  // Note: running cleanup afterEach is done automatically for you in @testing-library/react@9.0.0 or higher
  // unmount and cleanup DOM after the test is finished.
  afterEach(cleanup);

  // Testing Component
  describe("WorkspaceView", () => {
    // TEST:  Kinetix App > ApplicationHost > component should be created without style attribute
    it("document title should be updated", async () => {
      let sut = hostComponent(<WorkspaceView dataContext={mockWorkspace} />, mockContainer);
      const view = render(sut);
      expect(view).not.toBeNull();
    });
  });
});
