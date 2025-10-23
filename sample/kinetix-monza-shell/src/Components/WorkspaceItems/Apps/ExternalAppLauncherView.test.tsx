// reflect-metadata is required for IOC
import "reflect-metadata";
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { createMock } from "ts-auto-mock";
import { hostComponent } from "../../../../../../testing";
import { ExternalAppLauncherView } from "./ExternalAppLauncherView";
import { ExternalAppLauncher, ExternalAppLauncherModel } from "./ExternalAppLauncher";

// Base Package
describe("Kinetix Monza Shell", () => {
  // Scoped module

  let mockExternalAppLauncher: ExternalAppLauncher;

  beforeEach(() => {
    mockExternalAppLauncher = createMock<ExternalAppLauncher>({
      model: new ExternalAppLauncherModel(),
    });
  });

  afterEach(() => {
    cleanup();
    jest.resetAllMocks();
  });

  // Note: running cleanup afterEach is done automatically for you in @testing-library/react@9.0.0 or higher
  // unmount and cleanup DOM after the test is finished.
  afterEach(cleanup);

  // Testing Component
  describe("ExternalAppLauncherView", () => {
    // TEST:  Kinetix App > ApplicationHost > component should be created without style attribute

    it("Render loader", async () => {
      let sut = hostComponent(<ExternalAppLauncherView dataContext={mockExternalAppLauncher} />);
      const view = render(sut);
      expect(view).not.toBeNull();
    });
  });
});
