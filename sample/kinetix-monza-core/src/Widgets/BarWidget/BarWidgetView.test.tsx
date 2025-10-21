// reflect-metadata is required for IOC
import "reflect-metadata";
import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { BarWidgetView, BarWidgetViewModel, BarWidgetModel } from ".";
import { hostComponent } from "../../../../../testing";
import { createMock } from "ts-auto-mock";

class TestMessageBoxModel extends BarWidgetModel {
  test: string;
}
// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped module

  let viewModel: BarWidgetViewModel;

  beforeEach(() => {
    viewModel = createMock<BarWidgetViewModel>({
      model: {
        xAxisField: "1",
        yAxisField: "2",
        totalCount: 0,
        selectedIntervalTab: 0,
      },
    });
  });

  // Note: running cleanup afterEach is done automatically for you in @testing-library/react@9.0.0 or higher
  // unmount and cleanup DOM after the test is finished.
  afterEach(cleanup);

  // Testing Component
  describe("BarWidgetView", () => {
    /*it("component should render", () => {
      viewModel.model.items = [];
      viewModel.model.totalCount = 0;
      let sut = hostComponent(<BarWidgetView viewModel={viewModel} />);
      render(sut);
      waitFor(() => {
        expect(screen.getByText("No Content")).toBeInTheDocument();
      });
    });
*/
    it("component should render with data", () => {
      viewModel.model.items = [
        {
          name: "Test1",
          data: [
            {
              category: "TestKey1",
              value: 2000,
            },
          ],
          color: "green",
        },
        {
          name: "Test2",
          data: [
            {
              category: "TestKey2",
              value: 3000,
            },
          ],
          color: "red",
        },
      ];
      viewModel.model.totalCount = viewModel.model.items.length;

      let sut = hostComponent(<BarWidgetView viewModel={viewModel} />);

      render(sut);
      //screen.debug();
      waitFor(() => {
        expect(screen.getByText("No Content")).toBeNull();
        expect(screen.getByText("Test1")).toBeInTheDocument();
        expect(screen.getByText("Test2")).toBeInTheDocument();
        let tabEle = screen.getByText("Yearly");
        fireEvent.click(tabEle);
        expect(viewModel.handleIntervalTabChange).toBeCalled();
      });
    });
  });
});
