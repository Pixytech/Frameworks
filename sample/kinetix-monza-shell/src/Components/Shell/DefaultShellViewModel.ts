import { CoreTypes, IocInject, ViewModelBase, IocInjectable, IApplicationType, IAuthenticationServiceType, IUserPermissionServiceType, ProfileType } from "@kinetix/core";
import { WorkspaceViewModel } from "../Workspace/WorkspaceViewModel";
import { IDefaultShell } from "./IDefaultShell";
import { DefaultShellModel } from "./DefaultShellModel";
import type { IApplication, IContainer, IAuthenticationService, IUserPermissionService } from "@kinetix/core"; // IocDecorate(IocInjectable(), ViewModelBase)
import type { IWorkspace } from "../Workspace/IWorkspace";

@IocInjectable()
export class DefaultShellViewModel extends ViewModelBase<DefaultShellModel> implements IDefaultShell {
  Workspace: IWorkspace;
  container: IContainer;
  authenticationService: IAuthenticationService;
  userPermissionService: IUserPermissionService;
  application: IApplication;

  constructor(
    @IocInject(CoreTypes.IContainer) builder: IContainer, 
    @IocInject(WorkspaceViewModel) Workspace: IWorkspace, 
    @IocInject(IAuthenticationServiceType) authenticationService: IAuthenticationService,
    @IocInject(IUserPermissionServiceType) userPermissionService: IUserPermissionService,
    @IocInject(IApplicationType) application: IApplication
  ) {
    super();
    this.container = builder;
    this.Workspace = Workspace;
    this.authenticationService = authenticationService;
    this.userPermissionService = userPermissionService;
    this.application = application;
  }
  readonly appName: string = "home";
  readonly themeName: string = "darkTheme";
  validateAppProfile(currentProfile: string): string {
    // Get current user information
    const userId = this.authenticationService.GetUserId();
    const userRole = this.authenticationService.GetParsedToken()?.UserRole;
    const userRoles = userRole ? [userRole] : [];
    
    // Get all available profiles excluding external ones
    const availableProfiles = this.application.appManifest.profiles
      .filter(profile => profile.type !== ProfileType.External && !profile.hidden)
      .filter(profile => {
        // Check if user has access to this profile
        return this.userPermissionService.hasAppAccess(userId, userRoles, profile);
      });
    
    // console.debug('DefaultShell: Available profiles for user', userId, ':', availableProfiles.map(p => p.name));
    
    // If user has access to only one app, redirect to that app
    if (availableProfiles.length === 1) {
      const singleAppProfile = availableProfiles[0].name;
      // console.debug('DefaultShell: User has access to only one app, redirecting to:', singleAppProfile);
      return singleAppProfile;
    }
    
    // Otherwise, stay on home page
    return currentProfile;
  }

  protected createModel(): DefaultShellModel {
    return new DefaultShellModel();
  }
}
