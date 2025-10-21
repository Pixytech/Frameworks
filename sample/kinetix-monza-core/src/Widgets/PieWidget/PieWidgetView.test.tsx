import "reflect-metadata";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { createMock } from "ts-auto-mock";

import { PieWidgetView } from "./PieWidgetView";
import React from "react";
import { arrangeViewModel, hostComponent } from "../../../../../testing";
import { IPieWidget } from "./IPieWidget";
import { PieWidgetModel } from "./PieWidgetModel";
import { AutomationHelper } from "@kinetix/core";
import { ITermWidget } from "../models";
import { AggregationType } from "../../Utils/analyticsService";
// Base Package
describe("Kinetix Monza Core", () => {
  let mockPieWidget: IPieWidget;

  beforeEach(() => {
    mockPieWidget = createMock<IPieWidget>({
      model: new PieWidgetModel(),
    });
    mockPieWidget.model.isFirstRender = false;
    mockPieWidget.model.isLoading = false;
    arrangeViewModel(mockPieWidget).acceptModelChanges().acceptViewChanges();
  });

  // Note: running cleanup afterEach is done automatically for you in @testing-library/react@9.0.0 or higher
  // unmount and cleanup DOM after the test is finished.
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });
  // Testing Component
  describe("PieWidgetView", () => {
    it("component should render", () => {
      mockPieWidget.model.items = [];
      mockPieWidget.model.totalCount = 0;
      let sut = hostComponent(<PieWidgetView viewModel={mockPieWidget} />);
      render(sut);
      waitFor(() => {
        expect(screen.getByText("No Content")).toBeInTheDocument();
      });
    });

    it("component should render loader", () => {
      mockPieWidget.model.items = [];
      mockPieWidget.model.totalCount = 0;
      mockPieWidget.model.isFirstRender = true;
      mockPieWidget.model.isLoading = true;
      mockPieWidget.model.showFullView = true;
      let sut = hostComponent(<PieWidgetView viewModel={mockPieWidget} />);
      render(sut);
    });

    it("component should render with data less then 1000", async () => {
      mockPieWidget.model.items = [
        {
          displayName: "Test1",
          key: "TestKey1",
          value: 200,
          color: "red",
        },
        {
          displayName: "Test2",
          key: "TestKey2",
          value: 300,
          color: "red",
        },
      ];
      mockPieWidget.model.totalCount = mockPieWidget.model.items.length;
      mockPieWidget.model.showFullView = true;
      let sut = hostComponent(
        <div style={{ height: "100%", width: "100%" }}>
          <PieWidgetView viewModel={mockPieWidget} />
        </div>
      );

      render(sut);

      await waitFor(() => expect(mockPieWidget.model.showFullView).toBe(true));
    });

    it("component should render term def", async () => {
      mockPieWidget.model.items = [
        {
          displayName: "Test1",
          key: "TestKey1",
          value: 200,
          color: "red",
        },
        {
          displayName: "Test2",
          key: "TestKey2",
          value: 300,
          color: "red",
        },
      ];
      mockPieWidget.model.totalCount = mockPieWidget.model.items.length;
      mockPieWidget.model.showFullView = true;

      const termDef = mockPieWidget as unknown as ITermWidget;
      termDef.aggregationType = AggregationType.Count;

      let sut = hostComponent(
        <div style={{ height: "100%", width: "100%" }}>
          <PieWidgetView viewModel={mockPieWidget} />
        </div>
      );

      render(sut);

      await waitFor(() => expect(mockPieWidget.model.showFullView).toBe(true));
    });

    it("component should render term def with no data", async () => {
      mockPieWidget.model.items = [];
      mockPieWidget.model.totalCount = mockPieWidget.model.items.length;
      mockPieWidget.model.showFullView = true;

      const termDef = mockPieWidget as unknown as ITermWidget;
      termDef.aggregationType = AggregationType.Count;

      let sut = hostComponent(
        <div style={{ height: "100%", width: "100%" }}>
          <PieWidgetView viewModel={mockPieWidget} />
        </div>
      );

      render(sut);

      await waitFor(() => expect(mockPieWidget.model.showFullView).toBe(true));
    });

    it("component should render with data", async () => {
      mockPieWidget.model.items = [
        {
          displayName: "Test1",
          key: "TestKey1",
          value: 2000,
          color: "red",
        },
        {
          displayName: "Test2",
          key: "TestKey2",
          value: 3000,
          color: "red",
        },
      ];
      mockPieWidget.model.totalCount = mockPieWidget.model.items.length;
      mockPieWidget.model.showFullView = true;
      let sut = hostComponent(
        <div style={{ height: "100%", width: "100%" }}>
          <PieWidgetView viewModel={mockPieWidget} />
        </div>
      );

      render(sut);

      await waitFor(() => expect(mockPieWidget.model.showFullView).toBe(true));
    });

    it("component should donut", async () => {
      mockPieWidget.isDonut = true;
      mockPieWidget.model.items = [
        {
          displayName: "Test1",
          key: "TestKey1",
          value: 2000,
          color: "red",
        },
        {
          displayName: "Test2",
          key: "TestKey2",
          value: 3000,
          color: "red",
        },
      ];
      mockPieWidget.model.totalCount = mockPieWidget.model.items.length;
      mockPieWidget.model.showFullView = true;
      let sut = hostComponent(
        <div data-automationid="host" style={{ height: "100%", width: "100%" }}>
          <PieWidgetView viewModel={mockPieWidget} />
        </div>
      );

      render(sut);
      const host = screen.getByTestId("host");

      await waitFor(() => expect(mockPieWidget.model.showFullView).toBe(true));
    });

    it("component should donut term ", async () => {
      mockPieWidget.isDonut = true;
      const termDef = mockPieWidget as unknown as ITermWidget;
      termDef.aggregationType = AggregationType.Count;

      mockPieWidget.model.items = [
        {
          displayName: "Test1",
          key: "TestKey1",
          value: 2000,
          color: "red",
        },
        {
          displayName: "Test2",
          key: "TestKey2",
          value: 3000,
          color: "red",
        },
      ];
      mockPieWidget.model.totalCount = mockPieWidget.model.items.length;
      mockPieWidget.model.showFullView = true;
      let sut = hostComponent(
        <div style={{ height: "100%", width: "100%" }}>
          <PieWidgetView viewModel={mockPieWidget} />
        </div>
      );

      render(sut);

      await waitFor(() => expect(mockPieWidget.model.showFullView).toBe(true));
    });

    it("component should render with data in small size widget", async () => {
      mockPieWidget.model.items = [
        {
          displayName: "Test1",
          key: "TestKey1",
          value: 2000,
          color: "red",
        },
        {
          displayName: "Test2",
          key: "TestKey2",
          value: 3000,
          color: "red",
        },
      ];
      mockPieWidget.model.totalCount = mockPieWidget.model.items.length;
      mockPieWidget.model.showFullView = false;
      let sut = hostComponent(
        <div data-automationid="host" style={{ height: "100%", width: "100%" }}>
          <PieWidgetView viewModel={mockPieWidget} />
        </div>
      );
      render(sut);

      await waitFor(() => expect(mockPieWidget.model.showFullView).toBe(false));
      //todo : not sure what to test
    });

    it("show details on click", async () => {
      mockPieWidget.model.items = [
        {
          displayName: "Test1",
          key: "TestKey1",
          value: 2000,
          color: "red",
        },
        {
          displayName: "Test2",
          key: "TestKey2",
          value: 3000,
          color: "red",
        },
      ];
      mockPieWidget.model.totalCount = mockPieWidget.model.items.length;

      let sut = hostComponent(
        <div style={{ height: "100%", width: "100%" }}>
          <PieWidgetView viewModel={mockPieWidget} />
        </div>
      );

      render(sut);
      fireEvent.click(screen.getByTestId(AutomationHelper.GetId("left content")));
      await waitFor(() => expect(mockPieWidget.showDetails).toBeCalled());

      fireEvent.click(screen.getByTestId(AutomationHelper.GetId("chart")));
      await waitFor(() => expect(mockPieWidget.showDetails).toBeCalled());

      fireEvent.click(screen.getByTestId(AutomationHelper.GetId("right content")));
      await waitFor(() => expect(mockPieWidget.showDetails).toBeCalled());
    });
  });
});
