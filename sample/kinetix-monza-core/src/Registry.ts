import { IRegistry, IContainer, ObjectLifecycle, CoreTypes, IRestClientType, IRestClientWithHeadType, IDefaultDataProviderType, INotificationsCategoryProviderType, IMessageStreamType } from "@kinetix/core";
import { ToolbarItemProvider } from "./Provider/ToolbarItemProvider";
import { TradingCoreTypes } from "./TradingCoreTypes";
import { PieWidgetViewModel } from "./Widgets/PieWidget";
import { ViewMapProvider } from "./ViewMapProvider";
import { TopNWidgetViewModel } from "./Widgets/TopNWidget";
import { BarWidgetViewModel } from "./Widgets/BarWidget";
import { LiveInquiryWidgetViewModel, WidgetDetailsViewModel, GlobalFilters, WidgetContainerViewModel, ITabOptionsType, TabOptionsViewModel } from "./Widgets";
import { IMetaDataProviderType, MetaDataProvider } from "./Forms/Services/MetaDataProvider";
import { BlotterCellFormatOptionsPopupViewModel, BlotterCellFormatRowGroupViewModel, BlotterCellFormattingViewModel, BlotterColumnConfigViewModel, BlotterCustomFilterViewModel, BlotterStream, BlotterToolbarViewModel, BlotterViewModel, ConfigurationEditorViewModel, ContextMenuService, DefaultMenuProvider, IBlotterCellFormatOptionsPopupType, IBlotterCellFormatRowGroupType, IBlotterCellFormattingType, IBlotterColumnConfigType, IBlotterCustomFilterType, IBlotterToolbarType, IMenuProviderType } from "./Blotter";
import { BlotterContextMenuViewModel } from "./Blotter/ContextMenu/BlotterContextMenuViewModel";
import { ConfigurationService } from "./Configuration";
import { RestClient } from "./Web/RestClient";
import { RestClientWithHead } from "./Web/RestClientWithHead";
import { MainToolbarViewModel } from "./Toolbar";
import { UserPreferenceDataProvider } from "./Provider/UserPreferenceDataProvider";
import { UserSettings } from "./UserSettings";
import { HeaderViewModel, WorkspaceFooterViewModel } from "./Common";
import { NotificationsCategoryProvider } from "./NotificationCategory";
import { PdfFilePopup } from "./Forms/Fields/FormUpload/FileViewers/PdfFilePopup";
import { AzureStorageService } from "./Forms/Fields/FormUpload/Services/AzureStorageService";
import { IRemoteStorageServiceType } from "./Forms/Fields/FormUpload/Services/IRemoteStorageService";
import { RemoteFileBrowserField } from "./Forms/Fields/FormUpload/RemoteFileBrowser/RemoteFileBrowserField";

export class Registry implements IRegistry {
  configure(container: IContainer): void {
    container.registerType(HeaderViewModel, ObjectLifecycle.Singleton);

    container.register(CoreTypes.IViewMapProvider, ViewMapProvider, ObjectLifecycle.Singleton);
    container.register(CoreTypes.IConfigurationService, ConfigurationService, ObjectLifecycle.Singleton);
    container.register(TradingCoreTypes.Blotter, BlotterViewModel, ObjectLifecycle.Transient);

    container.register(TradingCoreTypes.IGlobalFilters, GlobalFilters, ObjectLifecycle.Singleton);
    container.registerType(UserSettings, ObjectLifecycle.Singleton);
    container.registerType(PdfFilePopup, ObjectLifecycle.Transient);
    container.registerType(RemoteFileBrowserField, ObjectLifecycle.Transient);
    container.register(IDefaultDataProviderType, UserPreferenceDataProvider, ObjectLifecycle.Transient);

    container.register(IRestClientType, RestClient, ObjectLifecycle.Transient);
    container.register(IRestClientWithHeadType, RestClientWithHead, ObjectLifecycle.Transient);
    container.register(IBlotterToolbarType, BlotterToolbarViewModel, ObjectLifecycle.Transient);

    container.register(ITabOptionsType, TabOptionsViewModel, ObjectLifecycle.Transient);

    container.registerType(ConfigurationEditorViewModel, ObjectLifecycle.Transient);

    container.register(IBlotterCustomFilterType, BlotterCustomFilterViewModel, ObjectLifecycle.Transient);
    container.register(IBlotterColumnConfigType, BlotterColumnConfigViewModel, ObjectLifecycle.Transient);
    container.register(IBlotterCellFormattingType, BlotterCellFormattingViewModel, ObjectLifecycle.Transient);

    container.register(IBlotterCellFormatRowGroupType, BlotterCellFormatRowGroupViewModel, ObjectLifecycle.Transient);
    container.register(IBlotterCellFormatOptionsPopupType, BlotterCellFormatOptionsPopupViewModel, ObjectLifecycle.Transient);
    container.registerType(BlotterContextMenuViewModel, ObjectLifecycle.Transient);

    container.register(IMetaDataProviderType, MetaDataProvider, ObjectLifecycle.Singleton);
    container.register(IMenuProviderType, DefaultMenuProvider, ObjectLifecycle.Singleton);
    container.registerType(ContextMenuService, ObjectLifecycle.Singleton);

    container.register(TradingCoreTypes.ITicketToolbarProvider, ToolbarItemProvider, ObjectLifecycle.Singleton);
    container.register(IMessageStreamType, BlotterStream, ObjectLifecycle.Singleton);
    container.registerType(WidgetContainerViewModel, ObjectLifecycle.Transient);
    container.registerType(PieWidgetViewModel, ObjectLifecycle.Transient);
    container.registerType(TopNWidgetViewModel, ObjectLifecycle.Transient);
    container.registerType(BarWidgetViewModel, ObjectLifecycle.Transient);
    container.registerType(LiveInquiryWidgetViewModel, ObjectLifecycle.Transient);

    container.registerType(WidgetDetailsViewModel, ObjectLifecycle.Transient);
    container.registerType(MainToolbarViewModel, ObjectLifecycle.Transient);
    container.registerType(WorkspaceFooterViewModel, ObjectLifecycle.Singleton);

    container.register(INotificationsCategoryProviderType, NotificationsCategoryProvider, ObjectLifecycle.Transient);
    
    // Remote storage services
    container.register(IRemoteStorageServiceType, AzureStorageService, ObjectLifecycle.Transient);
  }
}
