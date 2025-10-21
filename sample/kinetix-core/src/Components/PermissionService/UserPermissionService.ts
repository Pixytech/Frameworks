import { IocInjectable } from "../../IoC";
import { 
    IUserPermissionService, 
    IPermissionConfig, 
    IAppProfileConfig, 
    IRouteConfig 
} from "./IUserPermissionService";

@IocInjectable()
export class UserPermissionService implements IUserPermissionService {
    
    /**
     * Permission evaluation logic with precedence:
     * 1. restrictedUsers (highest priority - always deny)
     * 2. allowedUsers (override roles - allow)
     * 3. roles (check if user has required role)
     * 4. default behavior based on 'allow' property or deny
     */
    hasAccess(userId: string, userRoles: string[], permissionConfig: IPermissionConfig): boolean {
        // Step 1: Check restrictedUsers - if user is restricted, deny access
        if (permissionConfig.restrictedUsers && permissionConfig.restrictedUsers.length > 0) {
            if (this.isUserInList(userId, permissionConfig.restrictedUsers)) {
                return false;
            }
        }

        // Step 2: Check allowedUsers - if user is explicitly allowed, grant access
        if (permissionConfig.allowedUsers && permissionConfig.allowedUsers.length > 0) {
            if (this.isUserInList(userId, permissionConfig.allowedUsers)) {
                return true;
            }
        }

        // Step 3: Check roles - if user has any required role, grant access
        if (permissionConfig.roles && permissionConfig.roles.length > 0) {
            const hasRequiredRole = this.userHasAnyRole(userRoles, permissionConfig.roles);
            if (hasRequiredRole) {
                return true;
            }
        }

        // Step 4: If no specific user/role requirements, use 'allow' property
        if (permissionConfig.allow !== undefined) {
            return permissionConfig.allow;
        }

        // Default: deny access
        return false;
    }

    hasAppAccess(userId: string, userRoles: string[], appProfile: IAppProfileConfig): boolean {
        // Handle backward compatibility: if 'users' field exists but 'allowedUsers' doesn't,
        // treat 'users' as 'allowedUsers'
        const config = { ...appProfile };
        if ((appProfile as any).users && !config.allowedUsers) {
            config.allowedUsers = (appProfile as any).users;
        }
        
        return this.hasAccess(userId, userRoles, config);
    }

    hasRouteAccess(userId: string, userRoles: string[], routeConfig: IRouteConfig): boolean {
        // For routes, we need to check the 'allow' property first as a base condition
        // If allow is false, the route is disabled regardless of user permissions
        if (routeConfig.allow === false) {
            return false;
        }

        // If there are user-specific or role-specific permissions, evaluate them
        if (routeConfig.restrictedUsers || routeConfig.allowedUsers || routeConfig.roles) {
            return this.hasAccess(userId, userRoles, routeConfig);
        }

        // If no specific permissions and allow is true or undefined, grant access
        return true;
    }

    private isUserInList(userId: string, userList: string[]): boolean {
        // Case-insensitive comparison for user IDs
        const normalizedUserId = userId.toLowerCase();
        return userList.some(user => user.toLowerCase() === normalizedUserId);
    }

    private userHasAnyRole(userRoles: string[], requiredRoles: string[]): boolean {
        if (!userRoles || userRoles.length === 0) {
            return false;
        }
        
        // Check if user has any of the required roles
        return userRoles.some(userRole => 
            requiredRoles.some(requiredRole => 
                userRole.toLowerCase() === requiredRole.toLowerCase()
            )
        );
    }
}