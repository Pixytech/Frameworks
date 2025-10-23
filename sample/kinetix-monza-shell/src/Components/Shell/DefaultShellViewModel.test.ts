// reflect-metadata is required for IOC
import "reflect-metadata";
import { IContainer, IAuthenticationService, IUserPermissionService, IApplication, Profile, ProfileType } from "@kinetix/core";
import { createMock } from "ts-auto-mock";
import { DefaultShellViewModel } from "./DefaultShellViewModel";
import { IWorkspace } from "../Workspace/IWorkspace";

// Base Package
describe("Kinetix Monza Shell", () => {
  // Scoped module
  let sut: DefaultShellViewModel;

  let mockWorkspace: IWorkspace;
  let mockContainer: IContainer;
  let mockAuthenticationService: IAuthenticationService;
  let mockUserPermissionService: IUserPermissionService;
  let mockApplication: IApplication;

  // Execute once before all tests
  // To create single module for all tests
  beforeEach(async () => {
    mockContainer = createMock<IContainer>();
    mockWorkspace = createMock<IWorkspace>();
    mockAuthenticationService = createMock<IAuthenticationService>();
    mockUserPermissionService = createMock<IUserPermissionService>();
    mockApplication = createMock<IApplication>();
    
    // Setup default appManifest
    (mockApplication as any).appManifest = {
      profiles: [],
      default: "home",
      logLevel: undefined
    };
    
    sut = new DefaultShellViewModel(
      mockContainer, 
      mockWorkspace, 
      mockAuthenticationService,
      mockUserPermissionService,
      mockApplication
    );
    await sut.initialize();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // Testing Component
  describe("DefaultShellViewModel", () => {
    it("should have model", () => {
      expect(sut.model).not.toBeNull();
    });

    it("Should initilize live updates", async () => {
      await sut.initialize();
    });

    describe("validateAppProfile", () => {
      beforeEach(() => {
        // Setup common mocks
        mockAuthenticationService.GetUserId = jest.fn().mockReturnValue("testuser");
        mockAuthenticationService.GetParsedToken = jest.fn().mockReturnValue({ UserRole: "TestRole" });
      });

      it("should return current profile when user has access to multiple apps", () => {
        // Arrange
        const mockProfiles: Profile[] = [
          { 
            name: "home", 
            type: ProfileType.Web, 
            modules: [], 
            hidden: false,
            displayName: "Home",
            description: "Home app",
            roles: [],
            users: []
          },
          { 
            name: "agreements", 
            type: ProfileType.Web, 
            modules: [], 
            hidden: false,
            displayName: "Agreements",
            description: "Agreements app",
            roles: [],
            users: []
          },
          { 
            name: "listings", 
            type: ProfileType.Web, 
            modules: [], 
            hidden: false,
            displayName: "Listings",
            description: "Listings app",
            roles: [],
            users: []
          }
        ];
        
        (mockApplication as any).appManifest.profiles = mockProfiles;
        mockUserPermissionService.hasAppAccess = jest.fn().mockReturnValue(true);

        // Act
        const result = sut.validateAppProfile("home");

        // Assert
        expect(result).toBe("home");
        expect(mockUserPermissionService.hasAppAccess).toHaveBeenCalledTimes(3);
      });

      it("should redirect to single app when user has access to only one app", () => {
        // Arrange
        const mockProfiles: Profile[] = [
          { 
            name: "home", 
            type: ProfileType.Web, 
            modules: [], 
            hidden: false,
            displayName: "Home",
            description: "Home app",
            roles: [],
            users: []
          },
          { 
            name: "agreements", 
            type: ProfileType.Web, 
            modules: [], 
            hidden: false,
            displayName: "Agreements",
            description: "Agreements app",
            roles: [],
            users: []
          },
          { 
            name: "listings", 
            type: ProfileType.Web, 
            modules: [], 
            hidden: false,
            displayName: "Listings",
            description: "Listings app",
            roles: [],
            users: []
          }
        ];
        
        (mockApplication as any).appManifest.profiles = mockProfiles;
        mockUserPermissionService.hasAppAccess = jest.fn()
          .mockReturnValueOnce(false) // home - no access
          .mockReturnValueOnce(true)  // agreements - has access
          .mockReturnValueOnce(false); // listings - no access

        // Act
        const result = sut.validateAppProfile("home");

        // Assert
        expect(result).toBe("agreements");
        expect(mockUserPermissionService.hasAppAccess).toHaveBeenCalledTimes(3);
      });

      it("should filter out hidden profiles", () => {
        // Arrange
        const mockProfiles: Profile[] = [
          { 
            name: "home", 
            type: ProfileType.Web, 
            modules: [], 
            hidden: true,
            displayName: "Home",
            description: "Home app",
            roles: [],
            users: []
          },
          { 
            name: "agreements", 
            type: ProfileType.Web, 
            modules: [], 
            hidden: false,
            displayName: "Agreements",
            description: "Agreements app",
            roles: [],
            users: []
          }
        ];
        
        (mockApplication as any).appManifest.profiles = mockProfiles;
        mockUserPermissionService.hasAppAccess = jest.fn().mockReturnValue(true);

        // Act
        const result = sut.validateAppProfile("home");

        // Assert
        expect(result).toBe("agreements");
        expect(mockUserPermissionService.hasAppAccess).toHaveBeenCalledTimes(1);
        expect(mockUserPermissionService.hasAppAccess).toHaveBeenCalledWith("testuser", ["TestRole"], mockProfiles[1]);
      });

      it("should filter out external type profiles", () => {
        // Arrange
        const mockProfiles: Profile[] = [
          { 
            name: "home", 
            type: ProfileType.Web, 
            modules: [], 
            hidden: false,
            displayName: "Home",
            description: "Home app",
            roles: [],
            users: []
          },
          { 
            name: "external-app", 
            type: ProfileType.External, 
            modules: [], 
            hidden: false,
            displayName: "External App",
            description: "External app",
            roles: [],
            users: []
          },
          { 
            name: "agreements", 
            type: ProfileType.Web, 
            modules: [], 
            hidden: false,
            displayName: "Agreements",
            description: "Agreements app",
            roles: [],
            users: []
          }
        ];
        
        (mockApplication as any).appManifest.profiles = mockProfiles;
        mockUserPermissionService.hasAppAccess = jest.fn().mockReturnValue(true);

        // Act
        const result = sut.validateAppProfile("home");

        // Assert
        expect(result).toBe("home");
        expect(mockUserPermissionService.hasAppAccess).toHaveBeenCalledTimes(2); // Only Web type profiles
      });

      it("should handle user with no roles", () => {
        // Arrange
        mockAuthenticationService.GetParsedToken = jest.fn().mockReturnValue(null);
        
        const mockProfiles: Profile[] = [
          { 
            name: "home", 
            type: ProfileType.Web, 
            modules: [], 
            hidden: false,
            displayName: "Home",
            description: "Home app",
            roles: [],
            users: []
          },
          { 
            name: "agreements", 
            type: ProfileType.Web, 
            modules: [], 
            hidden: false,
            displayName: "Agreements",
            description: "Agreements app",
            roles: [],
            users: []
          }
        ];
        
        (mockApplication as any).appManifest.profiles = mockProfiles;
        mockUserPermissionService.hasAppAccess = jest.fn()
          .mockReturnValueOnce(false) // home - no access
          .mockReturnValueOnce(true); // agreements - has access

        // Act
        const result = sut.validateAppProfile("home");

        // Assert
        expect(result).toBe("agreements");
        expect(mockUserPermissionService.hasAppAccess).toHaveBeenCalledWith("testuser", [], expect.any(Object));
      });
    });
  });
});
