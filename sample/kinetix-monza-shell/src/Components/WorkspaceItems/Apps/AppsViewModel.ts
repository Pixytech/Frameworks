import { CoreTypes, IApplicationType, IAuthenticationServiceType, IocInject, IocInjectable, IViewModelBase, ProfileType, ViewModelBase, IUserPermissionServiceType } from "@kinetix/core";
import { IWorkspaceItem } from "../../Workspace/IWorkspace";
import { AppsModel } from "./AppsModel";
import type { IApplication, IAuthenticationService, IContainer, IDialogService, IInteropProvider, INavigationAware, Profile, IUserPermissionService } from "@kinetix/core";

import { ExternalAppLauncher } from "./ExternalAppLauncher";
import { Params, NavigateFunction, Location } from "react-router-dom";

export interface IAppsWorkspaceItem extends IViewModelBase<AppsModel>, IWorkspaceItem {
  launchProfile(profile: Profile): Promise<void>;
  interopProvider: IInteropProvider;
}

@IocInjectable()
export class AppsViewModel extends ViewModelBase<AppsModel> implements IAppsWorkspaceItem,INavigationAware {
  interopProvider: IInteropProvider;
  isFocusLost: boolean;
  dialogService: IDialogService;
  conatiner: IContainer;

  protected createModel(): AppsModel {
    return new AppsModel();
  }

  authService: IAuthenticationService;
  protected application: IApplication;
  private userPermissionService: IUserPermissionService;
  
  constructor(
    @IocInject(IApplicationType) application: IApplication, 
    @IocInject(IAuthenticationServiceType) authService: IAuthenticationService, 
    @IocInject(CoreTypes.IInteropProvider) interopProvider: IInteropProvider, 
    @IocInject(CoreTypes.IDialogService) dialogService: IDialogService, 
    @IocInject(CoreTypes.IContainer) conatiner: IContainer,
    @IocInject(IUserPermissionServiceType) userPermissionService: IUserPermissionService
  ) {
    super();
    this.conatiner = conatiner;
    this.dialogService = dialogService;
    this.interopProvider = interopProvider;
    this.authService = authService;
    this.application = application;
    this.userPermissionService = userPermissionService;
  }
  QueryParams: Readonly<Params<string>>;
  navigator: NavigateFunction;
  location: Location<any>;

  async launchProfile(profile: Profile): Promise<void> {
    if (profile.type == ProfileType.Web) {
      this.navigator(`/${profile.name}`);
    } else {
      const launcher = this.conatiner.build<ExternalAppLauncher>(ExternalAppLauncher);
      launcher.setClickOnce(profile);
      await this.dialogService.ShowDialog(launcher, { canClose: false, className: "externalAppWindow" });
    }
  }

  async onInitializeOnce(): Promise<void> {
    const userRole = this.authService.GetParsedToken()?.UserRole;
    const userId = this.authService.GetUserId();
    const userRoles = userRole ? [userRole] : [];
    const desktopPlatformInstalled = this.interopProvider.interop ? await this.interopProvider.interop.isPlatformInstalled : false;

    this.updateModel((m) => {
      m.isLoading = false;
      m.applications = this.filterUserApps(userId, userRoles);

      if (this.interopProvider.interop) {
        m.isInBrowser = !this.interopProvider.isPlatformAvailable;
        m.PlatformMessage = this.interopProvider.interop.PlatformMessage;
        m.DesktopPlatformInstalled = desktopPlatformInstalled;
      }
    });
  }

  filterUserApps(userId: string, userRoles: string[]): Profile[] {
    console.log('=== AppsViewModel: Filtering apps for user ===');
    console.log('User ID:', userId, 'User Roles:', userRoles);
  
    
    return this.application.appManifest.profiles.filter((x) => {
      if (x.hidden) return false;

      // Use the userPermissionService to check access with proper precedence:
      // 1. restrictedUsers (highest priority - deny)
      // 2. allowedUsers (override roles - allow)
      // 3. roles (check if user has required role)
      // 4. default (if no restrictions, allow)
      const hasAccess = this.userPermissionService.hasAppAccess(userId, userRoles, x);
     
      return hasAccess;
      
    });
  }
}
