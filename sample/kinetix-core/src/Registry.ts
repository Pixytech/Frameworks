

import { IApmAdapterType } from "./Apm";
import { ElasticApmAdapter } from "./Apm/Adapters/Elastic/ElasticApmAdapter";
import { MultiUserSessionViewModel } from "./Auth";
import { DialogHostViewModel, DialogService, INotificationServiceType, INotificationsPanelType, NotificationsPanel, INotificationFilterType, IMessageBoxServiceType, MessageBoxService, INavigationServiceType, NavigationService, NavigationRoutesProvider, INavigationRoutesProviderType, IUserPermissionServiceType, NotificationFilter, TooltipViewModel, UserPermissionService } from "./Components";
import { DefaultAppRoutes } from "./Components/NavigationService/DefaultAppRoutes";
import { NotificationService } from "./Components/Notifications/NotificationService";
import { IDefaultDataProviderType } from "./Configuration";
import { CoreTypes } from "./CoreTypes";
import { InteropProviderViewModel } from "./Interop";
import { IRegistry, IContainer, ObjectLifecycle } from "./IoC";
import { EventAggregator } from "./Messaging";
import { ViewResolver } from "./Mvvm";
import { INotificationsCategoryProviderType, NotificationsCategoryProvider } from "./NotificationCategory";
import { ISpeechRecognitionType, SpeechRecognition } from "./Speach";
import { IStreamingServiceType, StreamingService, IMessageStreamType } from "./Streaming";
import { AppStream } from "./Streaming/AppStream";
import { DefaultTagAdapter, GoogleTagAdapter, ITagAdapterType } from "./TagManager";
import { IndexedDBService, BackgroundSyncService, CrossTabSyncService, IIndexedDBServiceType, IBackgroundSyncServiceType, ICrossTabSyncServiceType } from "./IndexedDB";

import { ViewMapProvider } from "./ViewMapProvider";

export class Registry implements IRegistry {
  configure(container: IContainer): void {
    container.register(CoreTypes.IViewMapProvider, ViewMapProvider, ObjectLifecycle.Singleton);

    container.register(CoreTypes.IEventAggregator, EventAggregator, ObjectLifecycle.Singleton);

    container.register(IApmAdapterType, ElasticApmAdapter, ObjectLifecycle.Singleton);
    container.register(ISpeechRecognitionType, SpeechRecognition, ObjectLifecycle.Singleton);
    container.register(ITagAdapterType, GoogleTagAdapter, ObjectLifecycle.Singleton);
    container.register(DefaultTagAdapter, DefaultTagAdapter, ObjectLifecycle.Singleton);

    container.register(CoreTypes.IViewResolver, ViewResolver, ObjectLifecycle.Singleton);
    container.register(CoreTypes.IInteropProvider, InteropProviderViewModel, ObjectLifecycle.Singleton);
    container.registerType(DialogHostViewModel, ObjectLifecycle.Singleton);
    container.register(CoreTypes.IDialogService, DialogService, ObjectLifecycle.Transient);

    container.register(IMessageBoxServiceType, MessageBoxService, ObjectLifecycle.Singleton);
    container.register(INavigationServiceType, NavigationService, ObjectLifecycle.Singleton);
    container.register(INotificationServiceType, NotificationService, ObjectLifecycle.Singleton);
    container.register(INotificationsPanelType, NotificationsPanel, ObjectLifecycle.Singleton);

    container.register(DefaultAppRoutes, DefaultAppRoutes, ObjectLifecycle.Singleton);

    container.register(IDefaultDataProviderType, NavigationRoutesProvider, ObjectLifecycle.Transient);

    container.register(INavigationRoutesProviderType, NavigationRoutesProvider, ObjectLifecycle.Transient);
    container.register(INotificationsCategoryProviderType, NotificationsCategoryProvider, ObjectLifecycle.Transient);
    container.register(INotificationFilterType, NotificationFilter, ObjectLifecycle.Transient);
    container.registerType(TooltipViewModel, ObjectLifecycle.Transient);
    container.register(IStreamingServiceType, StreamingService, ObjectLifecycle.Singleton);
    container.register(IMessageStreamType, AppStream, ObjectLifecycle.Singleton);
    container.register(MultiUserSessionViewModel, MultiUserSessionViewModel, ObjectLifecycle.Singleton);

    // Register User Permission Service
    container.register(IUserPermissionServiceType, UserPermissionService, ObjectLifecycle.Singleton);

    // Register IndexedDB Services
    container.register(IIndexedDBServiceType, IndexedDBService, ObjectLifecycle.Singleton);
    container.register('IndexedDBService', IndexedDBService, ObjectLifecycle.Singleton);
    
    // Register Background Sync Service
    container.register(IBackgroundSyncServiceType, BackgroundSyncService, ObjectLifecycle.Singleton);
    container.register('BackgroundSyncService', BackgroundSyncService, ObjectLifecycle.Singleton);
    
    // Register Cross-Tab Sync Service
    container.register(ICrossTabSyncServiceType, CrossTabSyncService, ObjectLifecycle.Singleton);
    container.register('CrossTabSyncService', CrossTabSyncService, ObjectLifecycle.Singleton);
  }
}
