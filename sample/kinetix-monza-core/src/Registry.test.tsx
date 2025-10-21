// reflect-metadata is required for IOC
import "reflect-metadata";
import { Registry } from "./Registry";
import { CoreTypes, IContainer, IRestClientType, ObjectLifecycle } from "@kinetix/core";
import { createMock } from "ts-auto-mock";
import { BlotterViewModel, IBlotterToolbarType, BlotterToolbarViewModel, ConfigurationEditorViewModel, IBlotterCustomFilterType, BlotterCustomFilterViewModel, IBlotterColumnConfigType, BlotterColumnConfigViewModel, IBlotterCellFormattingType, BlotterCellFormattingViewModel, IBlotterCellFormatRowGroupType, BlotterCellFormatRowGroupViewModel, IBlotterCellFormatOptionsPopupType, BlotterCellFormatOptionsPopupViewModel, IMenuProviderType, DefaultMenuProvider, ContextMenuService } from "./Blotter";
import { BlotterContextMenuViewModel } from "./Blotter/ContextMenu/BlotterContextMenuViewModel";
import { ConfigurationService } from "./Configuration";
import { IMetaDataProviderType, MetaDataProvider } from "./Forms";
import { ToolbarItemProvider } from "./Provider/ToolbarItemProvider";
import { MainToolbarViewModel } from "./Toolbar";
import { TradingCoreTypes } from "./TradingCoreTypes";
import { ViewMapProvider } from "./ViewMapProvider";
import { RestClient } from "./Web/RestClient";
import { GlobalFilters, ITabOptionsType, TabOptionsViewModel, WidgetContainerViewModel, PieWidgetViewModel, TopNWidgetViewModel, BarWidgetViewModel, LiveInquiryWidgetViewModel, WidgetDetailsViewModel } from "./Widgets";
import { HeaderViewModel } from "./Common";


// Base Package
describe("Kinetix Monza core", () => {
  // Scoped module
  let sut: Registry;
  let mockContainer: IContainer;

  // Execute once before all tests
  // To create single module for all tests
  beforeAll(() => {
    sut = new Registry();
    mockContainer = createMock<IContainer>();
  });

  // Testing Component
  describe("Registry", () => {
    // TEST:  Kinetix Monza core > Registry > should configure dependency
    it("should configure dependency", () => {
      sut.configure(mockContainer);

      expect(mockContainer.registerType).toBeCalledWith(HeaderViewModel, ObjectLifecycle.Singleton);

      expect(mockContainer.register).toBeCalledWith(CoreTypes.IViewMapProvider, ViewMapProvider, ObjectLifecycle.Singleton);
      expect(mockContainer.register).toBeCalledWith(CoreTypes.IConfigurationService, ConfigurationService, ObjectLifecycle.Singleton);
      expect(mockContainer.register).toBeCalledWith(TradingCoreTypes.Blotter, BlotterViewModel, ObjectLifecycle.Transient);

      expect(mockContainer.register).toBeCalledWith(TradingCoreTypes.IGlobalFilters, GlobalFilters, ObjectLifecycle.Singleton);

      expect(mockContainer.register).toBeCalledWith(IRestClientType, RestClient, ObjectLifecycle.Transient);
      expect(mockContainer.register).toBeCalledWith(IBlotterToolbarType, BlotterToolbarViewModel, ObjectLifecycle.Transient);

      expect(mockContainer.register).toBeCalledWith(ITabOptionsType, TabOptionsViewModel, ObjectLifecycle.Transient);

      expect(mockContainer.registerType).toBeCalledWith(ConfigurationEditorViewModel, ObjectLifecycle.Transient);

      expect(mockContainer.register).toBeCalledWith(IBlotterCustomFilterType, BlotterCustomFilterViewModel, ObjectLifecycle.Transient);
      expect(mockContainer.register).toBeCalledWith(IBlotterColumnConfigType, BlotterColumnConfigViewModel, ObjectLifecycle.Transient);
      expect(mockContainer.register).toBeCalledWith(IBlotterCellFormattingType, BlotterCellFormattingViewModel, ObjectLifecycle.Transient);

      expect(mockContainer.register).toBeCalledWith(IBlotterCellFormatRowGroupType, BlotterCellFormatRowGroupViewModel, ObjectLifecycle.Transient);
      expect(mockContainer.register).toBeCalledWith(IBlotterCellFormatOptionsPopupType, BlotterCellFormatOptionsPopupViewModel, ObjectLifecycle.Transient);
      expect(mockContainer.registerType).toBeCalledWith(BlotterContextMenuViewModel, ObjectLifecycle.Transient);

      expect(mockContainer.register).toBeCalledWith(IMetaDataProviderType, MetaDataProvider, ObjectLifecycle.Singleton);
      expect(mockContainer.register).toBeCalledWith(IMenuProviderType, DefaultMenuProvider, ObjectLifecycle.Singleton);
      expect(mockContainer.registerType).toBeCalledWith(ContextMenuService, ObjectLifecycle.Singleton);

      expect(mockContainer.register).toBeCalledWith(TradingCoreTypes.ITicketToolbarProvider, ToolbarItemProvider, ObjectLifecycle.Singleton);
      expect(mockContainer.registerType).toBeCalledWith(WidgetContainerViewModel, ObjectLifecycle.Transient);
      expect(mockContainer.registerType).toBeCalledWith(PieWidgetViewModel, ObjectLifecycle.Transient);
      expect(mockContainer.registerType).toBeCalledWith(TopNWidgetViewModel, ObjectLifecycle.Transient);
      expect(mockContainer.registerType).toBeCalledWith(BarWidgetViewModel, ObjectLifecycle.Transient);
      expect(mockContainer.registerType).toBeCalledWith(LiveInquiryWidgetViewModel, ObjectLifecycle.Transient);

      expect(mockContainer.registerType).toBeCalledWith(WidgetDetailsViewModel, ObjectLifecycle.Transient);
      expect(mockContainer.registerType).toBeCalledWith(MainToolbarViewModel, ObjectLifecycle.Transient);

    });
  });
});
