// reflect-metadata is required for IOC
import "reflect-metadata";
import { createMock } from "ts-auto-mock";
import { ElasticApmAdapter } from "./Apm/Adapters/Elastic/ElasticApmAdapter";
import { IApmAdapterType } from "./Apm/IApmAdapter";
import { DefaultAppRoutes } from "./Components/NavigationService/DefaultAppRoutes";
import { Registry } from "./Registry";
import { ViewMapProvider } from "./ViewMapProvider";
import { NotificationService } from "./Components/Notifications/NotificationService";
import { NavigationRoutesProvider, INavigationRoutesProviderType, DialogHostViewModel, INotificationServiceType, DialogService, IMessageBoxServiceType, MessageBoxService, INavigationServiceType, NavigationService, INotificationsPanelType, TooltipViewModel, IUserPermissionServiceType, UserPermissionService } from "./Components";
import { NotificationsPanel } from "./Components/Notifications/Views/NotificationsPanel";
import { IDefaultDataProviderType } from "./Configuration";
import { CoreTypes } from "./CoreTypes";
import { InteropProviderViewModel } from "./Interop";
import { IContainer, ObjectLifecycle } from "./IoC";
import { EventAggregator } from "./Messaging";
import { ViewResolver } from "./Mvvm";
import { IStreamingServiceType, StreamingService } from "./Streaming";

// Base Package
describe("Kinetix Core", () => {
  // Scoped module
  let sut: Registry;
  let mockContainer: IContainer;

  // Execute once before each tests
  // To create single module for each tests
  beforeEach(() => {
    sut = new Registry();
    mockContainer = createMock<IContainer>();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // Testing Component
  describe("Registry", () => {
    // TEST:  Kinetix Core > Registry > should configure dependency
    it("should configure dependency", () => {
      sut.configure(mockContainer);

      expect(mockContainer.register).toBeCalledWith(IDefaultDataProviderType, NavigationRoutesProvider, ObjectLifecycle.Transient);

      expect(mockContainer.register).toBeCalledWith(INavigationRoutesProviderType, NavigationRoutesProvider, ObjectLifecycle.Transient);

      expect(mockContainer.registerType).toBeCalledWith(DialogHostViewModel, ObjectLifecycle.Singleton);

      expect(mockContainer.register).toBeCalledWith(INotificationServiceType, NotificationService, ObjectLifecycle.Singleton);
      expect(mockContainer.register).toBeCalledWith(CoreTypes.IViewMapProvider, ViewMapProvider, ObjectLifecycle.Singleton);
      expect(mockContainer.register).toBeCalledWith(CoreTypes.IEventAggregator, EventAggregator, ObjectLifecycle.Singleton);
      expect(mockContainer.register).toBeCalledWith(CoreTypes.IViewResolver, ViewResolver, ObjectLifecycle.Singleton);
      expect(mockContainer.register).toBeCalledWith(CoreTypes.IInteropProvider, InteropProviderViewModel, ObjectLifecycle.Singleton);

      expect(mockContainer.register).toBeCalledWith(IApmAdapterType, ElasticApmAdapter, ObjectLifecycle.Singleton);

      expect(mockContainer.register).toBeCalledWith(CoreTypes.IDialogService, DialogService, ObjectLifecycle.Transient);

      expect(mockContainer.register).toBeCalledWith(IMessageBoxServiceType, MessageBoxService, ObjectLifecycle.Singleton);
      expect(mockContainer.register).toBeCalledWith(INavigationServiceType, NavigationService, ObjectLifecycle.Singleton);
      expect(mockContainer.register).toBeCalledWith(DefaultAppRoutes, DefaultAppRoutes, ObjectLifecycle.Singleton);

      expect(mockContainer.register).toBeCalledWith(INotificationsPanelType, NotificationsPanel, ObjectLifecycle.Singleton);

      expect(mockContainer.registerType).toBeCalledWith(TooltipViewModel, ObjectLifecycle.Transient);
      expect(mockContainer.register).toBeCalledWith(IStreamingServiceType, StreamingService, ObjectLifecycle.Singleton);
      expect(mockContainer.register).toBeCalledWith(IUserPermissionServiceType, UserPermissionService, ObjectLifecycle.Singleton);
    });
  });
});
