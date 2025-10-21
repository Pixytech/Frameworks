export interface IUserPermissionService {
    /**
     * Evaluates if a user has access based on the permission configuration
     * @param userId The user ID (preferred_username from auth token)
     * @param userRoles The roles assigned to the user
     * @param permissionConfig The permission configuration object
     * @returns true if user has access, false otherwise
     */
    hasAccess(userId: string, userRoles: string[], permissionConfig: IPermissionConfig): boolean;

    /**
     * Evaluates if a user has access to an app profile
     * @param userId The user ID (preferred_username from auth token)
     * @param userRoles The roles assigned to the user
     * @param appProfile The app profile configuration
     * @returns true if user has access, false otherwise
     */
    hasAppAccess(userId: string, userRoles: string[], appProfile: IAppProfileConfig): boolean;

    /**
     * Evaluates if a user has access to a navigation route
     * @param userId The user ID (preferred_username from auth token)
     * @param userRoles The roles assigned to the user
     * @param routeConfig The route configuration
     * @returns true if user has access, false otherwise
     */
    hasRouteAccess(userId: string, userRoles: string[], routeConfig: IRouteConfig): boolean;
}

export interface IPermissionConfig {
    roles?: string[];
    allowedUsers?: string[];
    restrictedUsers?: string[];
    allow?: boolean;
}

export interface IAppProfileConfig extends IPermissionConfig {
    name: string;
    displayName: string;
    description?: string;
    type?: string;
    modules?: string[];
}

export interface IRouteConfig extends IPermissionConfig {
    path: string;
    link?: string;
    text?: string;
    icon?: string;
    routes?: IRouteConfig[];
}

export const IUserPermissionServiceType = Symbol("IUserPermissionService");