import "reflect-metadata";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { createMock } from "ts-auto-mock";

import React from "react";

import { TabOptionView } from "./TabOptionView";
import { ITabOptions } from "./TabOptionsViewModel";
import { TabOptonModel } from "./TabOptionModel";
import { arrangeViewModel, hostComponent } from "../../../../../../testing";
import { IWidgetTab } from "../WidgetContainerModel";
// Base Package
describe("Kinetix Monza Core", () => {
  let mockTabOptions: ITabOptions;
  let mockTab: IWidgetTab;
  beforeEach(() => {
    mockTab = createMock<IWidgetTab>();
    mockTabOptions = createMock<ITabOptions>({
      model: new TabOptonModel(),
      OnTabFocus: jest.fn(),
      OnItemClick: jest.fn(),
    });

    arrangeViewModel(mockTabOptions).acceptModelChanges().acceptViewChanges();
  });

  // Note: running cleanup afterEach is done automatically for you in @testing-library/react@9.0.0 or higher
  // unmount and cleanup DOM after the test is finished.
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });
  // Testing Component
  describe("TabOptionView", () => {
    it("component should render", async () => {
      mockTabOptions.model.show = false;
      mockTabOptions.model.options = [
        {
          id: "1",
          onSelect: (a, b) => {
            return Promise.resolve();
          },
          displayName: "TEST_MENU",
          isSeparator: false,
        },
        {
          id: "2",
          onSelect: (a, b) => {
            return Promise.resolve();
          },
          isSeparator: true,
        },
        {
          id: "3",
          onSelect: (a, b) => {
            return Promise.resolve();
          },
          displayName: "TEST_MENU_2",
          isSeparator: false,
        },
      ];

      let sut = hostComponent(<TabOptionView dataContext={mockTabOptions} tab={mockTab} />);
      render(sut);

      const options = screen.getByTestId("options");
      fireEvent.focus(options);
      fireEvent.click(options);

      await waitFor(()=>{
        expect(screen.getByText("TEST_MENU")).toBeDefined();
      })
      const menu = screen.getByText("TEST_MENU");
      expect(menu).toBeInTheDocument();
      expect(mockTabOptions.OnTabFocus).toBeCalled();
      fireEvent.click(menu);
      expect(mockTabOptions.OnItemClick).toBeCalled();

      const body = screen.queryByRole("theme");
      if (body) {
        fireEvent.click(body);
      }

      await waitFor(() => {
        expect(mockTabOptions.model.show).toBe(false);
      });
    });
  });
});
