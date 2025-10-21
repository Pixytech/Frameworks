// reflect-metadata is required for IOC
import "reflect-metadata";
import React from "react";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  ConfigurationItem,
  CustomizedAt,
  IApplicationRoutes,
  IApplicationRoutesType,
  IConfigurationService,
  IContainer,
  INavigationConfiguration,
  INavigationRoute,
  NavigationRoutesProvider,
  UserPermissionService,
  IAuthenticationService,
} from "../..";

// Base Package
describe("Kinetix Core", () => {
  // Scoped module

  let sut: NavigationRoutesProvider;
  let mockConfigurationService: IConfigurationService;
  let mockContainer: IContainer;
  let mockAuthenticationService: IAuthenticationService;
  let mockUserPermissionService: UserPermissionService;

  beforeEach(() => {
    mockContainer = jest.createMockFromModule<IContainer>("../..");
    mockConfigurationService =
      jest.createMockFromModule<IConfigurationService>("../..");
    mockAuthenticationService =
      jest.createMockFromModule<IAuthenticationService>("../..");
    mockUserPermissionService =
      jest.createMockFromModule<UserPermissionService>("../..");

    // Set up default mock implementations
    mockAuthenticationService.GetUserId = jest.fn().mockReturnValue("testuser");
    mockAuthenticationService.GetParsedToken = jest.fn().mockReturnValue({ UserRole: "User" });
    mockUserPermissionService.hasRouteAccess = jest.fn().mockReturnValue(true);

    sut = new NavigationRoutesProvider(
      mockContainer, 
      mockConfigurationService,
      mockUserPermissionService,
      mockAuthenticationService
    );
  });

  // Note: running cleanup afterEach is done automatically for you in @testing-library/react@9.0.0 or higher
  // unmount and cleanup DOM after the test is finished.
  afterEach(cleanup);

  // Testing Component
  describe("NavigationRoutesProvider", () => {
    // TEST:  Kinetix Core > NavigationRoutesProvider > component should be created without style attribute
    it("getDefaultConfigurations should create configs for all app routes", async () => {
      const mockAppRoutes: IApplicationRoutes[] = [
        {
          element: ()=><div></div>,
          path: "app1",
          icon: "app1Icon",
          link: "app1Link",
          text: "app1Text",
          routes: [
            {
              element: ()=><div></div>,
              path: "app1Child1",
              icon: "app1Child1Icon",
              link: "app1Child1Link",
              text: "app1Child1Text",
            },
          ],
        },
        {
          element: ()=><div></div>,
          path: "app2",
          icon: "app2Icon",
          link: "app2Link",
          text: "app2Text",
          routes: [
            {
              element: ()=><div></div>,
              path: "app2Child1",
              icon: "app2Child1Icon",
              link: "app2Child1Link",
              text: "app2Child1Text",
            },
          ],
        },
      ];
      mockContainer.buildAll = jest.fn().mockReturnValue(mockAppRoutes);

      const configItems = await sut.getDefaultConfigurations();

      expect(mockContainer.buildAll).toBeCalledWith(IApplicationRoutesType);
      expect(configItems.length).toBe(2);
      expect(configItems[0].application).toBe("Monza");
      expect(configItems[0].category).toBe("App");
      expect(configItems[0].section).toBe("Navigation");
      expect(configItems[0].item).toBe("app1Link");
      expect((configItems[0].value as INavigationConfiguration).allow).toBe(
        true
      );
      expect(
        (configItems[0].value as INavigationConfiguration).routes?.length
      ).toBe(1);

      expect(configItems[1].application).toBe("Monza");
      expect(configItems[1].category).toBe("App");
      expect(configItems[1].section).toBe("Navigation");
      expect(configItems[1].item).toBe("app2Link");
    });

    it("applyConfiguration should get configs for app", async () => {
      const mockAppRoutes: INavigationRoute = {
        element: ()=><div></div>,
        path: "app1",
        icon: "app1Icon",
        link: "app1Link",
        text: "app1Text",
        routes: [
          {
            element: ()=><div></div>,
            path: "app1Child1",
            icon: "app1Child1Icon",
            link: "app1Child1Link",
            text: "app1Child1Text",
          },
        ],
      };

      mockConfigurationService.getConfiguration = jest.fn();

      await sut.applyConfiguration(mockAppRoutes);
      expect(mockConfigurationService.getConfiguration).toBeCalledWith(
        expect.objectContaining({
          application: "Monza",
          category: "App",
          section: "Navigation",
          item: "app1Link",
        })
      );
    });

    it("applyConfiguration should create routes for allowed routes", async () => {
      // Set up hasRouteAccess mock to return false for routes with allow: false
      mockUserPermissionService.hasRouteAccess = jest.fn().mockImplementation((userId, userRoles, routeConfig) => {
        // Return false for routes with allow: false
        return routeConfig.allow !== false;
      });
      const mockAppRoutes: INavigationRoute = {
        element: ()=><div></div>,
        path: "app1Route",
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

      const mockconfigurationValue: INavigationConfiguration = {
        path: "app1",
        icon: "app1Icon",
        link: "app1Link",
        text: "app1Text",
        allow: true,
        routes: [
          {
            path: "app1RouteChild1",
            icon: "app1Child1Icon",
            link: "app1Child1Link",
            text: "app1Child1Text",
            allow: true,
          },
          {
            path: "app1RouteChild2",
            icon: "app1Child2Icon",
            link: "app1Child2Link",
            text: "app1Child2Text",
            allow: false,
          },
        ],
      };

      const mockConfig: ConfigurationItem<INavigationConfiguration> = {
        application: "Monza",
        category: "App",
        section: "Navigation",
        item: "app2Link",
        appliesTo: [],
        customizedAt: CustomizedAt.User,
        value: mockconfigurationValue,
      };

      mockConfigurationService.getConfiguration = jest
        .fn()
        .mockResolvedValue(mockConfig);

      const newRoutes = await sut.applyConfiguration(mockAppRoutes);
      expect(mockConfigurationService.getConfiguration).toBeCalledWith({
        application: "Monza",
        category: "App",
        section: "Navigation",
        item: "app1Link",
      });

      // config overrides the values
      expect(newRoutes.path).toBe("app1Route");
      expect(newRoutes.icon).toBe("app1Icon");
      expect(newRoutes.link).toBe("app1Link");
      expect(newRoutes.text).toBe("app1Text");
      expect(newRoutes.routes?.length).toBe(2); // one app is not allowed

      expect(newRoutes.routes ? newRoutes.routes[0].link : {}).toBe(
        "app1Child1Link"
      ); // one app is not allowed
      expect(newRoutes.routes ? newRoutes.routes[1].link : {}).toBe(
        "app1Child3Link"
      ); // one app is not allowed
    });
  });
});
