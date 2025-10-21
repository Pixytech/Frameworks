// reflect-metadata is required for IOC
import "reflect-metadata";
import React from "react";
import { createMock } from "ts-auto-mock";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { BlotterToolbar, BlotterToolbarModel, IBlotterToolbar } from "@kinetix/monza-core";
import { clearStubs, hostComponent } from "../../../../../testing";

// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped module

  let mockViewModel: IBlotterToolbar;

  beforeEach(() => {
    mockViewModel = createMock<IBlotterToolbar>({ model: new BlotterToolbarModel() });
  });

  // Note: running cleanup afterEach is done automatically for you in @testing-library/react@9.0.0 or higher
  // unmount and cleanup DOM after the test is finished.
  afterEach(() => {
    cleanup();
    jest.resetAllMocks();
    clearStubs();
  });

  // Testing Component
  describe("BlotterToolbar", () => {
    // TEST:  IDP > RepositoryView > component should be created without style attribute
    it("component render component", async () => {
      mockViewModel.model.allowAutoRefesh = true;
      mockViewModel.model.allowManualRefesh = true;
      let sut = hostComponent(<BlotterToolbar dataContext={mockViewModel} />);

      const view = render(sut);
      expect(screen.getByTestId("Options")).toBeInTheDocument();
    });
  });
});
