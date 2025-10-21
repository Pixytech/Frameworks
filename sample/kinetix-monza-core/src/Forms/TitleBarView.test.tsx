import "reflect-metadata";
import { IContainer, IDialogComponent, IThemeService } from "@kinetix/core";
import { cleanup, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { createMock } from "ts-auto-mock";
import { IFormViewModelBase } from "./IFormViewModel";
import { ITicketTitleBar } from "./ITicketTitleBar";
import { TicketTitleBarModel } from "./TicketTitleBarModel";
import { createMockThemeService, hostComponent } from "../../../../testing";
import { TitleBarView } from "./TitleBarView";
import React from "react";
// Base Package
describe("Kinetix Monza Core", () => {
  let mockTitleBarViewModel: IFormViewModelBase;
  let mockDialogComponent: IDialogComponent;
  let mockContainer: IContainer;
  let mockThemeService: IThemeService;
  let sut: JSX.Element;
  beforeEach(() => {
    mockContainer = createMock<IContainer>();
    mockThemeService = createMockThemeService();
    mockTitleBarViewModel = createMock<IFormViewModelBase>({
      titleBar: createMock<ITicketTitleBar>({
        model: new TicketTitleBarModel(),
      }),
    });

    mockDialogComponent = createMock<IDialogComponent>();
    sut = hostComponent(
      <TitleBarView
        dataContext={mockTitleBarViewModel}
        dialogComponent={mockDialogComponent}
      />,
      mockContainer,
      mockThemeService
    );
  });

  // Note: running cleanup afterEach is done automatically for you in @testing-library/react@9.0.0 or higher
  // unmount and cleanup DOM after the test is finished.
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });
  // Testing Component
  describe("TitleBarView", () => {
    it("component should titlebar with icon as component", () => {
      mockTitleBarViewModel.titleBar.model.title = "Title";
      mockTitleBarViewModel.titleBar.model.subtitle = "SubTitle";
      mockTitleBarViewModel.titleBar.model.icon = <span>IconAsComponent</span>;
      render(sut);
      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("SubTitle")).toBeInTheDocument();
      expect(screen.getByText("IconAsComponent")).toBeInTheDocument();
    });

    it("component should titlebar with icon as string", () => {
      mockTitleBarViewModel.titleBar.model.title = "Title";
      mockTitleBarViewModel.titleBar.model.subtitle = "SubTitle";
      mockTitleBarViewModel.titleBar.model.icon = "icon-as-named-svg";
      render(sut);
      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("SubTitle")).toBeInTheDocument();
      expect(screen.getByTestId("icon-as-named-svg")).toBeInTheDocument();
    });
  });
});
