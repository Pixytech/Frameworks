// reflect-metadata is required for IOC
import "reflect-metadata";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { arrange, createMockThemeService, hostComponent } from "../../../../testing";
import { createMock } from "ts-auto-mock";
import { AppHelp, Logo } from "./Logo";
import { IAuthenticationService, IAuthenticationServiceType } from "../Auth";
import { IUserPermissionService, INavigationService, INavigationRoute, ProfileType, IUserPermissionServiceType } from "../Components";
import { CoreTypes } from "../CoreTypes";
import { IApplication, ApplicationModel, IApplicationType } from "../IApplication";
import { IInteropProvider } from "../Interop";
import { IContainer } from "../IoC";
import { IThemeService } from "../Theme";

// Base Package
describe("Kinetix Core", () => {
  // Scoped module

  let mockContainer: IContainer;
  let mockThemeService: IThemeService;
  let mockInteropProvider: IInteropProvider;
  let mockApplication: IApplication;
  let mockAuthenticationService: IAuthenticationService;
  let mockUserPermissionService: IUserPermissionService;
  let navigationService: INavigationService;
  let mockAppRoute: INavigationRoute;
  
  beforeEach(() => {
    mockContainer = createMock<IContainer>();
    navigationService = createMock<INavigationService>();
    mockThemeService = createMockThemeService();
    mockApplication = createMock<IApplication>({ model: new ApplicationModel() });
    mockInteropProvider = createMock<IInteropProvider>();
    mockAuthenticationService = createMock<IAuthenticationService>();
    mockUserPermissionService = createMock<IUserPermissionService>();
    mockAppRoute = createMock<INavigationRoute>();
    
    // Setup default app manifest
    (mockApplication as any).appManifest = {
      profiles: [
        { name: "home", type: ProfileType.Web, modules: [], hidden: false, displayName: "Home", description: "Home app", roles: [], users: [] },
        { name: "agreements", type: ProfileType.Web, modules: [], hidden: false, displayName: "Agreements", description: "Agreements app", roles: [], users: [] }
      ],
      default: "home"
    };
    
    // Setup default authentication
    mockAuthenticationService.GetUserId = jest.fn().mockReturnValue("testuser");
    mockAuthenticationService.GetParsedToken = jest.fn().mockReturnValue({ UserRole: "TestRole" });
    
    // Setup default permission service (allow all by default)
    mockUserPermissionService.hasAppAccess = jest.fn().mockReturnValue(true);
    
    arrange(mockContainer)
      .stubMethod("build", () => mockApplication, [IApplicationType])
      .stubMethod("build", () => mockThemeService, [CoreTypes.IThemeService])
      .stubMethod("build", () => mockAuthenticationService, [IAuthenticationServiceType])
      .stubMethod("build", () => mockUserPermissionService, [IUserPermissionServiceType]);

    arrange(navigationService).stubProperty("currentAppRoute", () => mockAppRoute);

    arrange(mockApplication)
      .stubProperty("themeService", () => mockThemeService)
      .stubProperty("navigationService", () => navigationService);
  });

  afterEach(() => {
    cleanup();
    jest.resetAllMocks();
  });

  // Note: running cleanup afterEach is done automatically for you in @testing-library/react@9.0.0 or higher
  // unmount and cleanup DOM after the test is finished.
  afterEach(cleanup);

  // Testing Component
  describe("Logo", () => {
    it("should render logo in browser mode", async () => {
      arrange(mockContainer).stubMethod("build", () => mockInteropProvider, [CoreTypes.IInteropProvider]);
      let sut = hostComponent(<Logo color="red" className="test" />, mockContainer);
      const view = render(sut);
      expect(view).not.toBeNull();
    });

    it("should render logo using icon from theme", async () => {
      mockThemeService = createMockThemeService(true);
      mockThemeService.model.Theme.Icon = "test-icon";
      arrange(mockApplication) .stubProperty("themeService", () => mockThemeService)
  

      let sut = hostComponent(<Logo color="red" className="test" />, mockContainer);
      const view = render(sut);
      expect(view).not.toBeNull();
    });

    it("should render logo without interop provider", async () => {
      let sut = hostComponent(<Logo color="red" className="test" />, mockContainer);
      const view = render(sut);
      expect(view).not.toBeNull();
    });

    it("should render logo in interop mode without link", async () => {
      arrange(mockContainer).stubMethod("build", () => mockInteropProvider, [CoreTypes.IInteropProvider]);
      arrange(mockInteropProvider).stubProperty("isPlatformAvailable", () => true);
      let sut = hostComponent(<Logo color="red" className="test" />, mockContainer);
      const view = render(sut);
      expect(view).not.toBeNull();
    });

    it("should render logo in interop mode with link", async () => {
      mockAppRoute.link = "/SOME-LINK";
      arrange(mockContainer).stubMethod("build", () => mockInteropProvider, [CoreTypes.IInteropProvider]);
      arrange(mockInteropProvider).stubProperty("isPlatformAvailable", () => true);
      let sut = hostComponent(<Logo color="red" className="test" />, mockContainer);
      const view = render(sut);
      expect(view).not.toBeNull();
    });

    it("should render AppHelp", async () => {
      mockApplication.model.helpUri = "https://somehelp/page";

      window.open = jest.fn();
      
      let sut = hostComponent(<AppHelp />, mockContainer);
      const view = render(sut);

      const btn = screen.getAllByText("Tutorial");
      fireEvent.click(btn[0]);
      expect(window.open).toBeCalledWith("https://somehelp/page");
    });

    it("should render logo without link when user has only one app", async () => {
      // Setup app manifest with only visible apps
      (mockApplication as any).appManifest = {
        profiles: [
          { name: "home", type: ProfileType.Web, modules: [], hidden: false, displayName: "Home", description: "Home app", roles: [], users: [] },
          { name: "agreements", type: ProfileType.Web, modules: [], hidden: false, displayName: "Agreements", description: "Agreements app", roles: [], users: [] }
        ],
        default: "home"
      };
      
      // Setup cache state for current app
      (mockApplication as any).cache = {
        appState: {
          "app.name": "agreements"
        }
      };
      
      // Setup user to have access to only one app
      mockUserPermissionService.hasAppAccess = jest.fn((userId, roles, profile) => {
        return profile.name === 'agreements'; // Only agreements is accessible
      });
      
      arrange(mockContainer).stubMethod("build", () => mockInteropProvider, [CoreTypes.IInteropProvider]);
      
      let sut = hostComponent(<Logo color="red" className="test" />, mockContainer);
      const view = render(sut);
      
      // Wait for component to render completely
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check that span is rendered instead of Link
      const logoElement = view.container.querySelector('span.drawer-item-span');
      expect(logoElement).not.toBeNull();
      expect(logoElement?.tagName).toBe('SPAN');
      expect(logoElement).toHaveStyle({ cursor: 'default' });
      
      // Verify no Link element is present
      const linkElement = view.container.querySelector('a');
      expect(linkElement).toBeNull();
    });

    it("should render logo with link when user has multiple apps", async () => {
      // Setup cache state for current app
      (mockApplication as any).cache = {
        appState: {
          "app.name": "home"
        }
      };
      
      // Setup user to have access to multiple apps (default setup)
      mockInteropProvider.isPlatformAvailable = false;
      arrange(mockContainer).stubMethod("build", () => mockInteropProvider, [CoreTypes.IInteropProvider]);
      
      let sut = hostComponent(<Logo color="red" className="test" />, mockContainer);
      const view = render(sut);
      
      // Wait for component to render completely
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check that Link is rendered - could be with or without .interop class
      const linkElement = view.container.querySelector('a.drawer-item-span') || view.container.querySelector('a.drawer-item-span.interop');
      expect(linkElement).not.toBeNull();
      expect(linkElement?.getAttribute('href')).toBe('/home');
    });

  });
});
