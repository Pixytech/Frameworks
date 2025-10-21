// reflect-metadata is required for IOC
import "reflect-metadata";
import React from "react";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { hostComponent } from "../../../../../testing";
import { IDialogComponent } from "@kinetix/core";
import { WidgetTitleBar } from "./WidgetTitleBar";
import { createMock } from "ts-auto-mock";
import { IBlotter } from "../../Blotter";

// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped module
  let mockDataContext: IBlotter;
  let mockDialogComponent: IDialogComponent;

  beforeEach(() => {
    mockDataContext = createMock<IBlotter>();
    mockDialogComponent = createMock<IDialogComponent>({ model: {} });
  });

  // Note: running cleanup afterEach is done automatically for you in @testing-library/react@9.0.0 or higher
  // unmount and cleanup DOM after the test is finished.
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  // Testing Component
  describe("WidgetTitleBar", () => {
    // TEST:  Kinetix Monza Core > BlotterView > component should be created without style attribute
    it("should render the widget title", async () => {
      mockDialogComponent.model.title = "TestTitle";
      mockDataContext.model.totalServerCount = 21;

      let sut = hostComponent(<WidgetTitleBar dataContext={mockDataContext} dialogComponent={mockDialogComponent} />);
      let view = render(sut);

      expect(view).not.toBeNull();

      expect(view.container.textContent).toStrictEqual("TestTitle (21)");
    });
  });
});
