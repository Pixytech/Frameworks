// reflect-metadata is required for IOC
import "reflect-metadata";
import { createMock } from "ts-auto-mock";
import {
  IApplication,
  IApplicationCache,
  IApplicationRoutes,
  IApplicationRoutesType,
  IApplicationType,
  IContainer,
  INavigationRoutesProvider,
  INavigationRoutesProviderType,
  NavigationService,
} from "../..";

import { arrange, isValidRouteElement } from "../../../../../testing";
import { DefaultAppRoutes } from "./DefaultAppRoutes";
import React from "react";

// Base Package
describe("Kinetix Core", () => {
  // Scoped module
  let sut: NavigationService;
  let mockContainer: IContainer;
  let mockApplication: IApplication;

  // Execute once before all tests
  // To create single module for all tests
  beforeEach(() => {
    mockContainer = createMock<IContainer>();
    mockApplication = createMock<IApplication>({cache:createMock<IApplicationCache>({appState:{"app.name":"app1Route"}})});
    
    arrange(mockContainer).stubMethod("build", () => mockApplication, [
      IApplicationType,
    ]);
    sut = new NavigationService(mockContainer);
  });

  // Testing Component
  describe("NavigationService", () => {
    // TEST:  Kinetix Core > Registry > instance should be created
    it("should call buildRoutes and applyConfiguration", async () => {
      let mockNavigationProvider = createMock<INavigationRoutesProvider>();
      const mockAppRoutes: IApplicationRoutes = {
        element: ()=><div></div>,
        path: "/app1Route",
        icon: "app1RouteIcon",
        link: "app1Link",
        text: "app1RouteText",
        routes: [
          {
            element: ()=><div></div>,
            path: "app1RouteChild1",
            icon: "app1RouteChild1Icon",
            link: "app1Child1Link",
            text: "app1RouteChild1Text",
          },
          {
            element: ()=><div></div>,
            path: "app1RouteChild2",
            icon: "app1RouteChild2Icon",
            link: "app1Child2Link",
            text: "app1RouteChild2Text",
          },
          {
            element: ()=><div></div>,
            path: "app1RouteChild3",
            icon: "app1RouteChild3Icon",
            link: "app1Child3Link",
            text: "app1RouteChild3Text",
          },
        ],
      };

      arrange(mockContainer)
        .stubMethod("build", () => mockNavigationProvider, [
          INavigationRoutesProviderType,
        ])
        .stubMethod("buildAll", () => [mockAppRoutes], [
          IApplicationRoutesType,
        ]);

      await sut.buildRoutes();
      expect(mockNavigationProvider.applyConfiguration).toBeCalledWith(
        mockAppRoutes
      );
    });

    it("should create default route", async () => {
      arrange(mockContainer)
      .stubMethod("build", () => new DefaultAppRoutes(mockContainer), [
        DefaultAppRoutes,
      ])

      await sut.buildRoutes();;
      expect(sut.currentAppRoute).toBeDefined();
      expect(isValidRouteElement(sut.currentAppRoute)).toBe(true);
    });
  });
});
