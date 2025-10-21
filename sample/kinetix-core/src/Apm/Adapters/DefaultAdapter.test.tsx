// reflect-metadata is required for IOC
import "reflect-metadata";
import { IContainer } from "@kinetix/core";
import { createMock } from "ts-auto-mock";
import { cleanup, render, screen } from "@testing-library/react";
import { arrange, hostComponent } from "../../../../../testing";
import { DefaultApmAdapter } from "./DefaultAdapter";
import { IApmAdapter, IRouteElementProps } from "../IApmAdapter";
import React from "react";
import "@testing-library/jest-dom";

// Base Package
describe("Kinetix Core", () => {
  // Scoped module
  let sut: IApmAdapter;

  // Execute once before each tests
  // To create single module for each tests
  beforeEach(() => {
    sut = new DefaultApmAdapter();
  });

  afterEach(() => {
    jest.resetAllMocks();
    cleanup();
  });

  // Testing Component
  describe("DefaultAdapter", () => {
    it("router should render child element", async () => {
      await sut.initialize("TestProfile", { apmServiceName: "TestService" });
      const AdapterRouter = sut.router;
      const mockRouterProps = createMock<IRouteElementProps>();
      arrange(mockRouterProps).stubProperty("route", () => {
        return {
          path: "test",
          element: ()=><>TEST</>,
        };
      });
      let adapterRouter = hostComponent(<AdapterRouter {...mockRouterProps} />);

      render(adapterRouter);

      expect(screen.getByText("TEST")).toBeInTheDocument();
    });
  });
});
