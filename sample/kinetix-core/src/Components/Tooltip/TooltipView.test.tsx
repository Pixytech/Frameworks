import "reflect-metadata";
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { createMock } from "ts-auto-mock";
import { arrangeViewModel, createMockThemeService, hostComponent } from "../../../../../testing";
import { IContainer } from "../../IoC";
import { IThemeService } from "../../Theme";
import { TooltipView, TooltipViewModel } from ".";

describe("Kinetix Monza core", () => {
  let mockContainer: IContainer;
  let mockTooltipVM: TooltipViewModel;
  let mockThemeService: IThemeService;

  beforeEach(() => {
    // @ts-ignore
    mockTooltipVM = createMock<TooltipViewModel>({ model: new TooltipViewModel() });
    mockContainer = createMock<IContainer>();
    mockThemeService = createMockThemeService();
    mockTooltipVM.model.showTutotial = true;
    mockTooltipVM.model.tutorialIndex = 0;
    mockTooltipVM.model.tutorials = {
      skippedTutorial: false,
      context: [
        { id: "1", anchor: "div", message: "Message for Tooltip 1", title: "Tooltip 1", position: "bottom" },
        { id: "2", anchor: "div", message: "Message for Tooltip 2", title: "Tooltip 2", position: "bottom" },
      ],
    };
    arrangeViewModel(mockTooltipVM).acceptModelChanges().acceptViewChanges();
  });

  afterEach(() => {
    cleanup();
    jest.resetAllMocks();
  });

  describe("Tooltip", () => {
    it("Should render Tooltip with the tooltip content", async () => {
      let sut = hostComponent(<TooltipView dataContext={mockTooltipVM} />, mockContainer, mockThemeService);
      const view = render(sut);
      const nextBtn = screen.getByText("Next");
      const skipBtn = screen.getByText("Skip the tips");
      const tooltipNumber = screen.getByText("1/2");

      expect(view).not.toBeNull();
      expect(screen.getByText("Tooltip 1")).toBeInTheDocument();
      expect(screen.getByText("Message for Tooltip 1")).toBeInTheDocument();
      expect(tooltipNumber).toBeInTheDocument();
      expect(skipBtn).toBeInTheDocument();
      expect(nextBtn).toBeInTheDocument();
    });

    it("Should handle skip, next button on click", async () => {
      let sut = hostComponent(<TooltipView dataContext={mockTooltipVM} />, mockContainer, mockThemeService);
      const view = render(sut);
      const nextBtn = screen.getByText("Next");
      const skipBtn = screen.getByText("Skip the tips");

      fireEvent.click(nextBtn);

      expect(mockTooltipVM.updateTutorialIndex).toBeCalledWith(1);

      fireEvent.click(skipBtn);

      expect(mockTooltipVM.stopTutorial).toBeCalled();

      expect(view).not.toBeNull();
      expect(screen.getByText("Tooltip 1")).toBeInTheDocument();
      expect(screen.getByText("Message for Tooltip 1")).toBeInTheDocument();
      expect(skipBtn).toBeInTheDocument();
      expect(nextBtn).toBeInTheDocument();
    });

    it("Should render 'Got it' button on last tooltip", async () => {
      mockTooltipVM.model.tutorialIndex = 1;

      let sut = hostComponent(<TooltipView dataContext={mockTooltipVM} />, mockContainer, mockThemeService);
      const view = render(sut);
      const gotItBtn = screen.getByText("Got it");
      const tooltipNumber = screen.getByText("2/2");

      expect(view).not.toBeNull();
      expect(screen.getByText("Tooltip 2")).toBeInTheDocument();
      expect(screen.getByText("Message for Tooltip 2")).toBeInTheDocument();
      expect(tooltipNumber).toBeInTheDocument();
      expect(gotItBtn).toBeInTheDocument();
    });
  });
});
