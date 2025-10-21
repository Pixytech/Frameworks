import "reflect-metadata";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { createMock } from "ts-auto-mock";
import React from "react";
import { hostComponent } from "../../../../../testing";
import { LiveInquiryWidgetView } from "./LiveInquiryWidgetView";
import { ILiveInquiryWidget, LiveInquiryWidgetViewModel } from ".";

// Base Package
describe("Kinetix Monza Core", () => {
  let viewModel: ILiveInquiryWidget;

  beforeEach(() => {
    viewModel = createMock<LiveInquiryWidgetViewModel>({
      model: {},
    });
  });

  // Note: running cleanup afterEach is done automatically for you in @testing-library/react@9.0.0 or higher
  // unmount and cleanup DOM after the test is finished.
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });
  // Testing Component
  describe("LiveInquiryWidgetView", () => {
    it("component should render", () => {
      viewModel.model.items = [];
      viewModel.model.totalCount = 0;
      let sut = hostComponent(<LiveInquiryWidgetView viewModel={viewModel} />);
      render(sut);
      waitFor(() => {
        expect(screen.getByText("No Content")).toBeInTheDocument();
      });
    });

    it("component should render with data", () => {
      viewModel.model.items = [
        {
          msgTimeout: 100,
          leg: "1",
          direction: "Buy",
          quantity: 500,
          quote: 1.3,
          legalEntity: "test",
          cusip: "456",
          sourceId: "456",
          venue: "testVen",
          instrumentDesc: "testins",
        },
        {
          msgTimeout: 100,
          leg: "2",
          direction: "Sell",
          quantity: 200,
          quote: 0.3,
          legalEntity: "testEnt",
          cusip: "123",
          sourceId: "123",
          venue: "testVen2",
          instrumentDesc: "testinst",
        },
      ];
      viewModel.model.totalCount = viewModel.model.items.length;

      let sut = hostComponent(<LiveInquiryWidgetView viewModel={viewModel} />);

      render(sut);

      waitFor(() => {
        let ele = screen.getByText("testinst");
        fireEvent.doubleClick(ele);
        expect(viewModel.onRowDoubleClick).toBeCalled();
      });
    });
  });
});
