// reflect-metadata is required for IOC
import "reflect-metadata";
import { createBrowserRouter } from "react-router-dom";
import { createMock } from "ts-auto-mock";
import { mockFetch, arrange } from "../../../testing";
import { ApmType, Application, AppManifest, BuildManifest, CoreTypes, IApplicationPlugin, IAuthenticationService, IApplicationCache, IApplicationCacheType, IContainer, IInteropClient, IInteropProvider, IModule, INavigationService, INavigationServiceType, IShellBase, ITagManagerService, IThemeService, IViewResolver, ProfileType, TagManagerType, ThemeService, IStreamingServiceType, IStreamingService } from ".";
import { when } from "jest-when";
import { IApmService } from "./Apm/IApmService";
import { SVGIcon } from "@progress/kendo-react-common";
import { ICrossTabSyncService, ICrossTabSyncServiceType } from "./IndexedDB";
import { of } from "rxjs";

const dummyTagManagerConfig = 'eyJndG1fYXV0aCI6IllYVjBhQ0k2SWs1RVIiLCJndG1fcHJldmlldyI6ImVudi1UZXN0IiwiZ3RtSWQiOiJHVE0tMTIzNDU2In0='

// Base Package
describe("Kinetix Core", () => {
  // Scoped module
  let sut: Application;
  let mockContainer: IContainer;
  let mockThemeService: IThemeService;
  let mockAuthService: IAuthenticationService;
  let mockNavigationService: INavigationService;
  let mockApmService: IApmService;
  let mockShell: IShellBase;
  let mockInteropProvider: IInteropProvider;
  let mockTagService: ITagManagerService;
  let mockCache: IApplicationCache;
  let mockStreamingService: IStreamingService
  let mockCrossTabSyncService: ICrossTabSyncService;
  let mockModuleFactory: (module: string) => Promise<{ entry: IModule; name: string } | null>;

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Execute once before all tests
  // To create single module for all tests
  beforeEach(() => {
    mockContainer = createMock<IContainer>();
    mockStreamingService = createMock<IStreamingService>();
    mockApmService = createMock<IApmService>();
    mockThemeService = new ThemeService() //createMockThemeService();
    mockAuthService = createMock<IAuthenticationService>();
    mockInteropProvider = createMock<IInteropProvider>();
    mockNavigationService = createMock<INavigationService>();
    mockCache = createMock<IApplicationCache>({appState:{}})
    mockShell = createMock<IShellBase>();
    mockTagService = createMock<ITagManagerService>();
    mockCrossTabSyncService = createMock<ICrossTabSyncService>({
      initialize: jest.fn().mockReturnValue(of(void 0)),
      cleanup: jest.fn().mockReturnValue(of(void 0))
    });

    //mock window lcoation
    global.window = Object.create(window);
    Object.defineProperty(window, "location", {
      value: {
        href: "",
      },
    });
    mockModuleFactory = jest.fn();
    sut = new Application(mockContainer, mockModuleFactory, mockThemeService, mockAuthService, mockApmService, mockTagService,mockCache);
    sut.navigator = jest.fn();

    arrange(mockContainer)
      .stubMethod("buildAll", () => [mockShell], [CoreTypes.IShell])
      .stubMethod("build", () => mockCache, [IApplicationCacheType])
      .stubMethod("build", () => mockStreamingService, [IStreamingServiceType])
      .stubMethod("build", () => mockCrossTabSyncService, [ICrossTabSyncServiceType])
      .stubMethod(
        "build",
        () => {
          return mockInteropProvider;
        },
        [CoreTypes.IInteropProvider]
      );

    arrange(mockShell).stubMethod("validateAppProfile", () => "test");
  });

  // Testing Component
  describe("Application", () => {
    // TEST:  Kinetix Core > Registry > instance should be created
    it("should return the correct tagger (ITagLogger)", () => {
      const tagger = sut.tagger;
  
      expect(tagger).toBe(mockTagService.Tag); 
    });

    it("Application should bootstrap", async () => {
      const router = createBrowserRouter([{ path: "/desktop/*" }, { path: "/*", index: true }]);

      // Arrange
      arrange(mockContainer)
        .stubMethod("build", () => mockNavigationService, [INavigationServiceType])
        .stubMethod(
          "build",
          () => {
            return createMock<IViewResolver>();
          },
          [CoreTypes.IViewResolver]
        );

      mockFetch<BuildManifest>(
        {
          buildId: "test-buildId",
          version: "test-version",
          environmentName: "test-env",
          apmServiceName: "",
          apmServiceType: ApmType.None,
          tagManagerType: TagManagerType.Google,
          tagManagerConfigs: dummyTagManagerConfig,
          
        },
        ["/desktop/build.json"]
      );

      mockFetch<AppManifest>(
        {
          default: "test", 
          profiles: [
            {
              name: "test",
              description: "testDesc",
              displayName: "Test",
              hidden: false,
              roles: [],
              users:[],
              modules: ["ModuleA", "ModuleB"],
              features: [{enableChat: true}],
              type: ProfileType.Web,
              helpUrl:"https://somelink",
              plugins: ["Some-invalid-plugin"],
              icons:[createMock<SVGIcon>({name:'SomeIcon'})]
            },
          ],
        },
        ["/app.json"]
      );

      sut.router = {
        ...router,
        state: {
          ...router.state,
          location: { ...router.state.location, pathname: "test" },
        },
      };

      const moduleA: IModule = createMock<IModule>({ onLoad: jest.fn() });
      const moduleB: IModule = createMock<IModule>({ onLoad: jest.fn() });

      when(mockModuleFactory).calledWith("ModuleA").mockResolvedValue({ entry: moduleA, name: "ModuleA" });
      when(mockModuleFactory).calledWith("ModuleB").mockResolvedValue({ entry: moduleB, name: "ModuleB" });

      await sut.initialize();

      expect(mockNavigationService.buildRoutes).toBeCalledTimes(1);
      expect(mockApmService.initialize).toBeCalledTimes(1);
      expect(mockStreamingService.initialize).toBeCalledTimes(1);
      expect(mockCache.appState["app.name"]).toBe("test");
    });

    it("Application should bootstrap when no profile match", async () => {
      const router = createBrowserRouter([{ path: "/desktop/*" }, { path: "/*", index: true }]);

      arrange(mockContainer)
        .stubMethod(
          "build",
          () => {
            return createMock<IViewResolver>();
          },
          [CoreTypes.IViewResolver]
        )
        .stubMethod("build", () => mockNavigationService, [INavigationServiceType]);

      mockFetch<BuildManifest>(
        {
          buildId: "test-buildId",
          version: "test-version",
          environmentName: "test-env",
          apmServiceName: "",
          apmServiceType: ApmType.None,
          tagManagerType: TagManagerType.Google,
          tagManagerConfigs: dummyTagManagerConfig,
        },
        ["/desktop/build.json"]
      );

      mockFetch<AppManifest>(
        {
          default: "test",
          profiles: [
            {
              name: "test",
              description: "testDesc",
              displayName: "Test",
              hidden: false,
              roles: [],
              users:[],
              modules: ["ModuleA", "ModuleB"],
              type: ProfileType.Web,
            },
            {
              name: "test2",
              description: "testDesc",
              displayName: "Test2",
              hidden: false,
              roles: [],
              users:[],
              modules: ["ModuleA", "ModuleB"],
              type: ProfileType.Web,
            },
          ],
        },
        ["/app.json"]
      );

      sut.router = {
        ...router,
        state: {
          ...router.state,
          location: { ...router.state.location, pathname: "test-noMATCH" },
        },
      };

      const moduleA: IModule = createMock<IModule>({ onLoad: jest.fn() });

      const moduleB: IModule = createMock<IModule>({ onLoad: jest.fn() });

      when(mockModuleFactory).calledWith("ModuleA").mockResolvedValue({ entry: moduleA, name: "ModuleA" });

      when(mockModuleFactory).calledWith("ModuleB").mockResolvedValue({ entry: moduleB, name: "ModuleB" });

      await sut.initialize();

      expect(mockNavigationService.buildRoutes).toBeCalledTimes(1);
      expect(mockCache.appState["app.name"]).toBe("test");
      expect(moduleA.onInitialized).toBeCalled();
      expect(moduleB.onInitialized).toBeCalled();

      expect(moduleA.onLoad).toBeCalled();
      expect(moduleB.onLoad).toBeCalled();
    });

    it("Application should bootstrap with interop modules deployed", async () => {
      const router = createBrowserRouter([{ path: "/desktop/*" }, { path: "/*", index: true }]);

      arrange(mockContainer)
        .stubMethod(
          "build",
          () => {
            return createMock<IViewResolver>();
          },
          [CoreTypes.IViewResolver]
        )
        .stubMethod(
          "build",
          () => {
            return createMock<IInteropClient>();
          },
          [CoreTypes.IInteropClient]
        )
        .stubMethod("build", () => mockNavigationService, [INavigationServiceType])
        

      mockFetch<BuildManifest>(
        {
          buildId: "test-buildId",
          version: "test-version",
          environmentName: "test-env",
          apmServiceName: "",
          apmServiceType: ApmType.None,
          tagManagerType: TagManagerType.Google,
          tagManagerConfigs: dummyTagManagerConfig,
        },
        ["/desktop/build.json"]
      );

      mockFetch<AppManifest>(
        {
          default: "test",
          profiles: [
            {
              name: "test",
              description: "testDesc",
              displayName: "Test",
              hidden: false,
              roles: [],
              users:[],
              modules: ["ModuleA", "ModuleB"],
              type: ProfileType.Web,
            },
          ],
        },
        ["/app.json"]
      );

      sut.router = {
        ...router,
        state: {
          ...router.state,
          location: { ...router.state.location, pathname: "test" },
        },
      };

      const moduleA: IModule = createMock<IModule>({ onLoad: jest.fn() });

      const moduleB: IModule = createMock<IModule>({ onLoad: jest.fn() });

      when(mockModuleFactory).calledWith("ModuleA").mockResolvedValue({ entry: moduleA, name: "ModuleA" });

      when(mockModuleFactory).calledWith("ModuleB").mockResolvedValue({ entry: moduleB, name: "ModuleB" });

      await sut.initialize();

      expect(mockNavigationService.buildRoutes).toBeCalledTimes(1);
      expect(mockCache.appState["app.name"]).toBe("test");
      expect(moduleA.onInitialized).toBeCalled();
      expect(moduleB.onInitialized).toBeCalled();

      expect(moduleA.onLoad).toBeCalled();
      expect(moduleB.onLoad).toBeCalled();
    });

    it("Application should bootstrap with APM", async () => {
      const router = createBrowserRouter([{ path: "/desktop/*" }, { path: "/*", index: true }]);

      arrange(mockContainer)
        .stubMethod(
          "build",
          () => {
            return createMock<IViewResolver>();
          },
          [CoreTypes.IViewResolver]
        )
        .stubMethod("build", () => mockNavigationService, [INavigationServiceType]);

      mockFetch<BuildManifest>(
        {
          buildId: "test-buildId",
          version: "test-version",
          environmentName: "test-env",
          apmServiceName: "APM-SERVICE_NAME",
          apmServiceType: ApmType.Elastic,
          tagManagerType: TagManagerType.Google,
          tagManagerConfigs: dummyTagManagerConfig,
        },
        ["/desktop/build.json"]
      );

      mockFetch<AppManifest>(
        {
          default: "test",
          profiles: [
            {
              name: "test",
              description: "testDesc",
              displayName: "Test",
              hidden: false,
              roles: [],
              users:[],
              modules: ["ModuleA", "ModuleB"],
              type: ProfileType.Web,
              plugins: ["customer-specific-plugin"],
            },
            {
              name: "test2",
              description: "testDesc",
              displayName: "Test2",
              hidden: false,
              roles: [],
              users:[],
              modules: ["ModuleA", "ModuleB"],
              type: ProfileType.Web,
            },
          ],
        },
        ["/app.json"]
      );

      sut.router = {
        ...router,
        state: {
          ...router.state,
          location: { ...router.state.location, pathname: "test-noMATCH" },
        },
      };

      const moduleA: IModule = createMock<IModule>({ onLoad: jest.fn() });

      const moduleB: IModule = createMock<IModule>({ onLoad: jest.fn() });

      when(mockModuleFactory).calledWith("ModuleA").mockResolvedValue({ entry: moduleA, name: "ModuleA" });

      when(mockModuleFactory).calledWith("ModuleB").mockResolvedValue({ entry: moduleB, name: "ModuleB" });

      await sut.initialize();

      expect(mockNavigationService.buildRoutes).toBeCalledTimes(1);
      expect(mockCache.appState["app.name"]).toBe("test"); //bootstrap to default
      expect(moduleA.onInitialized).toBeCalled();
      expect(moduleB.onInitialized).toBeCalled();

      expect(moduleA.onLoad).toBeCalled();
      expect(moduleB.onLoad).toBeCalled();
    });

    it("should activate customer specific plugin", async () => {
      const mockPluginA = createMock<IApplicationPlugin>({ name: "customer-specific-plugin" });
      const mockPluginB = createMock<IApplicationPlugin>({ name: "some-other-plugin" });
      arrange(mockContainer).stubMethod(
        "buildAll",
        () => {
          throw new Error("not implemented");
        },
        [CoreTypes.IApplicationPlugin]
      );

      await sut.startPlugins(["no-exception-if-not-configured-with-di"]);

      arrange(mockContainer).stubMethod("buildAll", () => [mockPluginA, mockPluginB], [CoreTypes.IApplicationPlugin]);
      const original = mockPluginA.onInitialized;
      mockPluginA.onInitialized = async () => {
        throw new Error("Some init error");
      };
      mockPluginA.onInitialized = original;
      await sut.startPlugins(["customer-specific-plugin"]);

      expect(mockPluginA.onInitialized).toBeCalledTimes(1);
      expect(mockPluginB.onInitialized).not.toBeCalled();
    });
  });
});
