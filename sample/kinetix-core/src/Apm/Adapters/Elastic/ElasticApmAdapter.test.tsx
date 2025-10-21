// reflect-metadata is required for IOC
import "reflect-metadata";
import { IAuthenticationService } from "@kinetix/core";
import { createMock } from "ts-auto-mock";
import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import "@testing-library/jest-dom";
import {
  arrange,
  hostComponent,
  stubComponent,
} from "../../../../../../testing";
import { IApmAdapter, IRouteElementProps } from "../../IApmAdapter";

import { ElasticApmAdapter } from "./ElasticApmAdapter";
import init, {
  AgentConfigOptions,
  ApmBase,
  Transaction,
  apm,
} from "@elastic/apm-rum";

// we have to mock the module becuase of the way apm is initilized
jest.mock("@elastic/apm-rum", () => {
  const mockApm = createMock<ApmBase>();

  return {
    init: mockApm.init,
    apm: mockApm,
  };
});

// Base Package
describe("Kinetix Core", () => {
  // Scoped module
  let sut: IApmAdapter;
  let mockAuthService: IAuthenticationService;

  // Execute once before each tests
  // To create single module for each tests
  beforeEach(() => {
    mockAuthService = createMock<IAuthenticationService>();
    sut = new ElasticApmAdapter(mockAuthService);
    arrange(apm).stubMethod("init", () => apm);
  });

  afterEach(() => {
    jest.resetAllMocks();
    cleanup();
  });

  // Testing Component
  describe("ElasticApmAdapter", () => {
    it("initialize should init APM", async () => {
      const mockApm = apm;

      await sut.initialize("TestProfile", {
        apmServiceName: "TestService",
        environmentName: "test-env",
      });

      expect(apm.init).toBeCalledTimes(1);
      expect(apm.init).toBeCalledWith(
        expect.objectContaining({
          environment: "test-env",
          serviceName: "TestService",
        })
      );

      expect(mockApm.setUserContext).toBeCalledTimes(1);
    });

    it("router should render child element when APM is not active", async () => {
      const mockApm = apm;
      arrange(mockApm).stubMethod("isActive", () => false);

      await sut.initialize("TestProfile", {
        apmServiceName: "TestService",
        environmentName: "test-env",
      });

      const AdapterRouter = sut.router;
      const mockRouterProps = createMock<IRouteElementProps>();
      arrange(mockRouterProps)
        .stubProperty("route", () => {
          return {
            path: "test",
            element: ()=><>TEST</>,
          };
        })
        .stubProperty("parent", () => {
          return "ParentPath";
        });
      let adapterRouter = hostComponent(<AdapterRouter {...mockRouterProps} />);
      render(adapterRouter);
      expect(screen.getByText("TEST")).toBeInTheDocument();
      expect(apm.startTransaction).not.toBeCalled();
    });

    it("router should render child element when no active transaction", async () => {
      const mockApm = apm;
      arrange(mockApm).stubMethod("isActive", () => true);
      arrange(mockApm).stubMethod("getCurrentTransaction", () => undefined);
      await sut.initialize("TestProfile", {
        apmServiceName: "TestService",
        environmentName: "test-env",
      });

      const AdapterRouter = sut.router;
      const mockRouterProps = createMock<IRouteElementProps>();
      arrange(mockRouterProps)
        .stubProperty("route", () => {
          return {
            path: "test",
            element: ()=><>TEST</>,
          };
        })
        .stubProperty("parent", () => {
          return "ParentPath";
        });
      let adapterRouter = hostComponent(<AdapterRouter {...mockRouterProps} />);

      render(adapterRouter);

      expect(screen.getByText("TEST")).toBeInTheDocument();
      expect(apm.startTransaction).toBeCalled();
    });

    it("router should render child element when active transaction", async () => {
      const mockApm = apm;
      const mockTransaction = createMock<Transaction>();
      arrange(mockApm).stubMethod("isActive", () => true);
      arrange(mockApm).stubMethod(
        "getCurrentTransaction",
        () => mockTransaction
      );
      await sut.initialize("TestProfile", {
        apmServiceName: "TestService",
        environmentName: "test-env",
      });

      const AdapterRouter = sut.router;
      const mockRouterProps = createMock<IRouteElementProps>();
      arrange(mockRouterProps)
        .stubProperty("route", () => {
          return {
            path: "test",
            element: ()=><>TEST</>,
          };
        })
        .stubProperty("parent", () => {
          return "ParentPath";
        });
      let adapterRouter = hostComponent(<AdapterRouter {...mockRouterProps} />);

      render(adapterRouter);

      expect(screen.getByText("TEST")).toBeInTheDocument();
    });
  });
});
