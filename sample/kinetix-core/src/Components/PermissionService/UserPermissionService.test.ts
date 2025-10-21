import { UserPermissionService } from './UserPermissionService';
import { IAppProfileConfig, IRouteConfig } from './IUserPermissionService';

describe('UserPermissionService', () => {
    let service: UserPermissionService;

    beforeEach(() => {
        service = new UserPermissionService();
    });

    describe('App Access Tests', () => {
        const tradingProfile: IAppProfileConfig = {
            name: 'trading360',
            displayName: 'Trading 360',
            roles: ['Trader', 'TradingMiddleOffice'],
            allowedUsers: ['james'],
            restrictedUsers: ['admin']
        };

        test('should allow user in allowedUsers even without role', () => {
            const result = service.hasAppAccess('james', [], tradingProfile);
            expect(result).toBe(true);
        });

        test('should deny user in restrictedUsers even with role', () => {
            const result = service.hasAppAccess('admin', ['Trader'], tradingProfile);
            expect(result).toBe(false);
        });

        test('should allow user with role when not in any list', () => {
            const result = service.hasAppAccess('john', ['Trader'], tradingProfile);
            expect(result).toBe(true);
        });

        test('should deny user without role and not in allowedUsers', () => {
            const result = service.hasAppAccess('john', ['SomeOtherRole'], tradingProfile);
            expect(result).toBe(false);
        });

        test('should handle case-insensitive user matching', () => {
            const result = service.hasAppAccess('JAMES', [], tradingProfile);
            expect(result).toBe(true);
        });
    });

    describe('Route Access Tests', () => {
        const adminRoute: IRouteConfig = {
            path: 'admin/users',
            allow: true,
            roles: ['Admin'],
            restrictedUsers: ['james'],
            allowedUsers: ['admin']
        };

        test('should respect allow:false regardless of user permissions', () => {
            const routeWithAllowFalse: IRouteConfig = {
                path: 'disabled',
                allow: false,
                allowedUsers: ['admin']
            };
            const result = service.hasRouteAccess('admin', ['Admin'], routeWithAllowFalse);
            expect(result).toBe(false);
        });

        test('should allow user in allowedUsers for route', () => {
            const result = service.hasRouteAccess('admin', [], adminRoute);
            expect(result).toBe(true);
        });

        test('should deny user in restrictedUsers for route', () => {
            const result = service.hasRouteAccess('james', ['Admin'], adminRoute);
            expect(result).toBe(false);
        });
    });

    describe('Backward Compatibility', () => {
        test('should treat users field as allowedUsers', () => {
            const profileWithUsers: any = {
                name: 'test',
                displayName: 'Test',
                users: ['legacy-user'],
                roles: []
            };
            const result = service.hasAppAccess('legacy-user', [], profileWithUsers);
            expect(result).toBe(true);
        });

        test('should prefer allowedUsers over users field', () => {
            const profileWithBoth: any = {
                name: 'test',
                displayName: 'Test',
                users: ['legacy-user'],
                allowedUsers: ['new-user'],
                roles: []
            };
            const result1 = service.hasAppAccess('legacy-user', [], profileWithBoth);
            const result2 = service.hasAppAccess('new-user', [], profileWithBoth);
            
            expect(result1).toBe(false); // users field ignored
            expect(result2).toBe(true);  // allowedUsers used
        });
    });
});