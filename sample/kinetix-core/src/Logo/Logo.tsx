import { useViewModel } from "../Mvvm";
import { CoreTypes } from "../CoreTypes";
import { IThemeService } from "../Theme/IThemeService";
import { ThemeModel } from "../Theme/ThemeModel";
import { Link } from "react-router-dom";
import { Button } from "@progress/kendo-react-buttons";
import { questionCircleIcon } from "@progress/kendo-svg-icons";
import { IAuthenticationService, IAuthenticationServiceType } from "../Auth";
import { IApplication, IApplicationType } from "../IApplication";
import { IInteropProvider } from "../Interop";
import { useContainer } from "../IoC";
import { IUserPermissionService, IUserPermissionServiceType } from "../Components/PermissionService/IUserPermissionService";
import { ProfileType } from "../Components/AppManifest";
import { Icon } from "../Theme/Icons/Icon";
import { useMemo } from "react";

interface IconsProps {
  color?: string;
  className?: string;
}
export const Logo = ({ className, color, ...props }: IconsProps) => {
  const container = useContainer();
  const interopProvider = container.build<IInteropProvider>(CoreTypes.IInteropProvider);
  const application = container.build<IApplication>(IApplicationType);
  const authenticationService = container.build<IAuthenticationService>(IAuthenticationServiceType);
  const userPermissionService = container.build<IUserPermissionService>(IUserPermissionServiceType);
  const themeService = useViewModel<ThemeModel, IThemeService>(CoreTypes.IThemeService);
  
  // Check how many apps the user has access to
  const userId = authenticationService.GetUserId();
  const userRole = authenticationService.GetParsedToken()?.UserRole;
  const userRoles = userRole ? [userRole] : [];
  
  const availableProfiles = application.appManifest.profiles
    .filter(profile => profile.type !== ProfileType.External && !profile.hidden)
    .filter(profile => userPermissionService.hasAppAccess(userId, userRoles, profile));
  
  const hasOnlyOneApp = availableProfiles.length === 1;
  
  // Check if customer logo is defined for the current profile
  const logoIcon = useMemo(() => {
    const currentProfile = application.cache.appState["app.name"];
    const profileConfig = application.appManifest.profiles.find(p => p.name === currentProfile);
    
    // Check if this profile has a customer-logo icon defined
    const hasCustomerLogo = profileConfig?.icons?.some((icon: any) => icon.name === 'customer-logo');
    
    // Return customer-logo if available, otherwise use theme icon
    return hasCustomerLogo ? "customer-logo" : themeService.model.Theme.Icon;
  }, [application.cache.appState["app.name"], application.appManifest.profiles, themeService.model.Theme.Icon]);
  
  // If user has only one app, render logo without link (no navigation)
  if (hasOnlyOneApp) {
    return (
      <span className="drawer-item-span" style={{ cursor: 'default' }}>
        <Icon icon={logoIcon} className={`${className} ${color}-icon`} />
      </span>
    );
  }
  
  // Otherwise, render with navigation as before
  return (
    <>
      {interopProvider?.isPlatformAvailable ? (
        <Link className="drawer-item-span interop" to={application.navigationService.currentAppRoute.link ?? "/"}>
          <Icon icon={logoIcon}  className={`${className} ${color}-icon`} />
        </Link>
      ) : (
        <Link className="drawer-item-span"  to={`/${application.appManifest.default}`}>
          <Icon icon={logoIcon} className={`${className} ${color}-icon`} />
        </Link>
      )}
    </>
  );
};


export const AppHelp = () =>{
  const container = useContainer();
  const application = container.build<IApplication>(IApplicationType);
  return application && application.model.helpUri? <Button style={{marginLeft:"8px",marginRight:"8px", borderRadius:"4px"}} themeColor={"primary"} fillMode={"solid"} svgIcon={questionCircleIcon} onClick={()=>{window.open(application.model.helpUri);}} >
    Tutorial
  </Button>:<></>
}