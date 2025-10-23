// reflect-metadata is required for IOC
import "reflect-metadata";

import { ApplicationModel, AuthenticationModel, IApplication, IApplicationCache, IAuthenticationService, IContainer, IDialogService, IInteropClient, IInteropProvider, ProfileType, IUserPermissionService } from "@kinetix/core";
import { createMock } from "ts-auto-mock";
import { AppsViewModel } from "./AppsViewModel";
import { arrange } from "../../../../../../testing";
import { ExternalAppLauncher } from "./ExternalAppLauncher";
// Base Package
describe("Kinetix Monza Shell", () => {
  // Scoped sut
  let sut: AppsViewModel;
  let mockApplication: IApplication;
  let mockAuth: IAuthenticationService;
  let mockInteropProvider: IInteropProvider;
  let mockDialogService: IDialogService;
  let mockContainer: IContainer;
  let mockUserPermissionService: IUserPermissionService;

  // Execute once before each tests
  // To create single sut for each tests
  beforeEach(() => {
    mockApplication = createMock<IApplication>({ model: new ApplicationModel() });
    mockApplication.navigator = jest.fn();
    arrange(mockApplication).stubProperty("cache",()=>{
      return createMock<IApplicationCache>({ appState:{}
    })});

    mockAuth = createMock<IAuthenticationService>({ model: new AuthenticationModel() });
    mockInteropProvider = createMock<IInteropProvider>();
    mockDialogService = createMock<IDialogService>();
    mockContainer = createMock<IContainer>();
    mockUserPermissionService = createMock<IUserPermissionService>();

    // Mock the hasAppAccess method to return true by default
    mockUserPermissionService.hasAppAccess = jest.fn().mockReturnValue(true);

    const client: IInteropClient = createMock<IInteropClient>({
      PlatformMessage: "SOME-Platform",
    });
    arrange(mockInteropProvider).stubProperty("interop", () => client);

    sut = new AppsViewModel(mockApplication, mockAuth, mockInteropProvider, mockDialogService, mockContainer, mockUserPermissionService);
    sut.navigator = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("AppsViewModel", () => {
    it("should launch web profiles", async () => {
      //arrange(window).stubProperty("location",()=>createMock<Location>());

      sut.launchProfile({
        description: "test",
        displayName: "test",
        hidden: false,
        name: "profileName",
        roles: [],
        users:[],
        type: ProfileType.Web,
        modules: [],
      });

      //expect(window.location.href).toBe("/profileName");
    });

    it("should launch external profiles", async () => {
      const mockAppLauncher = createMock<ExternalAppLauncher>();
      arrange(mockContainer).stubMethod("build", () => mockAppLauncher, [ExternalAppLauncher]);

      sut.launchProfile({
        description: "test",
        displayName: "test",
        hidden: false,
        name: "profileName",
        roles: [],
        users:[],
        type: ProfileType.External,
        modules: ["/externalUrl"],
      });

      expect(mockAppLauncher.setClickOnce).toBeCalled();
      expect(mockDialogService.ShowDialog).toBeCalled();
    });

    it("should filter apps based on role", async () => {
      arrange(mockAuth).stubMethod("GetUserId", () => "testUser");
      arrange(mockAuth).stubMethod("GetParsedToken", () => {
        return {
          UserRole: "testRole",
        };
      });

      if (mockInteropProvider.interop) {
        arrange(mockInteropProvider.interop).stubProperty("isPlatformInstalled", () => true);
      }

      // Mock permission service to allow only app1 based on role
      mockUserPermissionService.hasAppAccess = jest.fn().mockImplementation((userId, userRoles, profile) => {
        // app1 has role "testRole" which matches user's role
        if (profile.name === "app1Name" && profile.roles.includes("testRole")) return true;
        // app2 has role "testRole2" which doesn't match user's role "testRole"
        if (profile.name === "app2Name") return false;
        return false;
      });

      //mockApplication.model.profileName = "testProfile";
      arrange(mockApplication).stubProperty("appManifest",()=>{
        return {
          default: "testProfile",
          profiles: [
            {
              displayName: "app1",
              description: "app1Desc",
              hidden: false,
              name: "app1Name",
              roles: ["testRole"],
              users: [],
              allowedUsers: [],
              type: ProfileType.Web,
              modules: [],
            },
  
            {
              displayName: "app2",
              description: "app2Desc",
              hidden: false,
              name: "app2Name",
              roles: ["testRole2"],
              users: [],
              allowedUsers: [],
              type: ProfileType.Web,
              modules: [],
            },
          ],
        }
      })
      

      await sut.initialize();
      expect(sut.model.applications.length).toBe(1);
      expect(sut.model.applications[0].name).toBe("app1Name");
      expect(mockUserPermissionService.hasAppAccess).toHaveBeenCalledTimes(2);
      expect(sut.model.isInBrowser).toBe(true);
      expect(sut.model.PlatformMessage).toBe("SOME-Platform");
      expect(sut.model.DesktopPlatformInstalled).toBe(true);
    });

    it("should filter apps based on user which overrides the roles", async () => {
       arrange(mockAuth).stubMethod("GetUserId",()=>"user1")
      arrange(mockAuth).stubMethod("GetParsedToken", () => {
        return {
          UserRole: "testRole1",
        };
      });

      if (mockInteropProvider.interop) {
        arrange(mockInteropProvider.interop).stubProperty("isPlatformInstalled", () => true);
      }

      //mockApplication.model.profileName = "testProfile";
      arrange(mockApplication).stubProperty("appManifest",()=>{
        return {
          default: "testProfile",
          profiles: [
            {
              displayName: "app1",
              description: "app1Desc",
              hidden: false,
              name: "app1Name",
              roles: ["testRole"],
              users: ["user1"],
              allowedUsers: ["user1"],
              type: ProfileType.Web,
              modules: [],
            },
  
            {
              displayName: "app2",
              description: "app2Desc",
              hidden: false,
              name: "app2Name",
              roles: ["testRole1"],
              users: [],
              allowedUsers: [],
              type: ProfileType.Web,
              modules: [],
            },
          ],
        }});
      
      await sut.initialize();
      expect(sut.model.applications.length).toBe(2);
      expect(sut.model.isInBrowser).toBe(true);
      expect(sut.model.PlatformMessage).toBe("SOME-Platform");
      expect(sut.model.DesktopPlatformInstalled).toBe(true);
    });

    it("should filter apps based on role, when no role", async () => {
      arrange(mockAuth).stubMethod("GetParsedToken", () => {
        return {
          UserRole: "testRole",
        };
      });

      if (mockInteropProvider.interop) {
        arrange(mockInteropProvider.interop).stubProperty("isPlatformInstalled", () => true);
      }

      //mockApplication.model.profileName = "testProfile";
      arrange(mockApplication).stubProperty("appManifest",()=>{
        return {
          default: "testProfile",
          profiles: [
            {
              displayName: "app1",
              description: "app1Desc",
              hidden: false,
              name: "app1Name",
              roles: [],
              users: [],
              allowedUsers: [],
              type: ProfileType.Web,
              modules: [],
            },
  
            {
              displayName: "app2",
              description: "app2Desc",
              hidden: false,
              name: "app2Name",
              roles: [],
              users: [],
              allowedUsers: [],
              type: ProfileType.Web,
              modules: [],
            },
          ],
        }});
      
      await sut.initialize();
      expect(sut.model.applications.length).toBe(2);
      expect(sut.model.isInBrowser).toBe(true);
      expect(sut.model.PlatformMessage).toBe("SOME-Platform");
      expect(sut.model.DesktopPlatformInstalled).toBe(true);
    });

    it("should deny access to apps when user is in restrictedUsers list", async () => {
      arrange(mockAuth).stubMethod("GetUserId", () => "blockedUser");
      arrange(mockAuth).stubMethod("GetParsedToken", () => {
        return {
          UserRole: "adminRole",
        };
      });

      if (mockInteropProvider.interop) {
        arrange(mockInteropProvider.interop).stubProperty("isPlatformInstalled", () => true);
      }

      // Mock permission service to test restrictedUsers logic
      mockUserPermissionService.hasAppAccess = jest.fn().mockImplementation((userId, userRoles, profile) => {
        // app1: blockedUser is in restrictedUsers, should be denied
        if (profile.name === "app1Name") return false;
        // app2: user has no restrictions, should have access
        if (profile.name === "app2Name") return true;
        return false;
      });

      arrange(mockApplication).stubProperty("appManifest",()=>{
        return {
          default: "testProfile",
          profiles: [
            {
              displayName: "app1",
              description: "app1Desc",
              hidden: false,
              name: "app1Name",
              roles: ["adminRole"],
              users: [],
              allowedUsers: ["otherUser"],
              restrictedUsers: ["blockedUser"],
              type: ProfileType.Web,
              modules: [],
            },
  
            {
              displayName: "app2",
              description: "app2Desc",
              hidden: false,
              name: "app2Name",
              roles: ["adminRole"],
              users: [],
              allowedUsers: [],
              restrictedUsers: [],
              type: ProfileType.Web,
              modules: [],
            },
          ],
        }});
      
      await sut.initialize();
      expect(sut.model.applications.length).toBe(1);
      expect(sut.model.applications[0].name).toBe("app2Name");
      expect(mockUserPermissionService.hasAppAccess).toHaveBeenCalledWith("blockedUser", ["adminRole"], expect.objectContaining({ name: "app1Name", restrictedUsers: ["blockedUser"] }));
      expect(mockUserPermissionService.hasAppAccess).toHaveBeenCalledWith("blockedUser", ["adminRole"], expect.objectContaining({ name: "app2Name" }));
    });
  });
});
