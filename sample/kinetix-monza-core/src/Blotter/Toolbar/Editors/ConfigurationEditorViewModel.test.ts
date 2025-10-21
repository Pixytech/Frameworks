// reflect-metadata is required for IOC
import "reflect-metadata";
import { IContainer, IDialogService, IRestClient } from "@kinetix/core";
import { BlotterCellFormattingModel, BlotterColumnConfigModel, BlotterColumnDefinition, BlotterCustomFilterModel, BlotterModel, ConfigurationEditorViewModel, EditPages, IBlotter, IBlotterCellFormatting, IBlotterColumnConfig, IBlotterConfiguration, IBlotterCustomFilter, IColumnListItemData } from "../..";
import { createMock } from "ts-auto-mock";
import { IMetaDataProvider } from "../../../Forms";
import { FormRenderProps } from "@progress/kendo-react-form";
import { Subject } from "rxjs";
import { arrange, arrangeViewModel } from "../../../../../../testing";
import { waitFor } from "@testing-library/react";

// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped viewModel
  let sut: ConfigurationEditorViewModel;
  let mockContainer: IContainer;
  let mockDialogService: IDialogService;
  let mockMetaDataProvider: IMetaDataProvider;
  let mockRestClient: IRestClient;
  let mockBlotter: IBlotter;
  let mockCustomFilters: IBlotterCustomFilter;
  let mockColumnConfig: IBlotterColumnConfig;
  let mockCellFormattingViewModel: IBlotterCellFormatting;

  // Execute once before all tests
  // To create single module for all tests
  beforeEach(() => {
    // mockEventAggregator, mockConfigurationService, mockNotificationService
    mockContainer = createMock<IContainer>();
    mockDialogService = createMock<IDialogService>();

    mockMetaDataProvider = createMock<IMetaDataProvider>();
    mockRestClient = createMock<IRestClient>();
    mockCustomFilters = createMock<IBlotterCustomFilter>({ model: new BlotterCustomFilterModel() });
    mockColumnConfig = createMock<IBlotterColumnConfig>({ model: new BlotterColumnConfigModel() });
    mockCellFormattingViewModel = createMock<IBlotterCellFormatting>({ model: new BlotterCellFormattingModel() });

    mockBlotter = createMock<IBlotter>({ model: new BlotterModel() });
    arrangeViewModel(mockBlotter).acceptModelChanges().acceptViewChanges();
    sut = new ConfigurationEditorViewModel(mockContainer, mockDialogService, mockMetaDataProvider, mockRestClient, mockCustomFilters, mockColumnConfig, mockCellFormattingViewModel);
    sut.model.settings = createMock<IBlotterConfiguration>({
      columnConfigs: [
        {
          name: "name1",
          cellFormats: { column: { ...createMock<BlotterColumnDefinition>(), name: "name" }, conditions: [], priority: 1 },
        },
      ],
    });

    mockColumnConfig.model.columns = [{ ...createMock<IColumnListItemData>(), name: "name" }];

    mockCellFormattingViewModel.model.formats = [{ column: { ...createMock<BlotterColumnDefinition>(), name: "name" }, conditions: [], priority: 1 }];
    sut.blotter = mockBlotter;
  });

  // Testing Component
  describe("ConfigurationEditorViewModel", () => {
    it("on init call setConfiguration", async () => {
      sut.model.settings = createMock<IBlotterConfiguration>();
      await sut.formInitialize();

      expect(mockCustomFilters.setConfiguration).toBeCalledTimes(1);
      expect(mockCellFormattingViewModel.setConfiguration).toBeCalledTimes(1);
      expect(mockCellFormattingViewModel.setConfiguration).toBeCalledTimes(1);
    });

    it("reset to defaults should close the dialog", async () => {
      await sut.formInitialize();
      if (sut.resetToDefaults.canExecute()) {
        sut.resetToDefaults.execute();
      }
      expect(mockDialogService.Close).toBeCalledTimes(1);
    });

    it("select tabs should update model", async () => {
      sut.model.defaultPage = EditPages.SaveAs;
      sut.selectTabs();
      expect(sut.model.selectedTab).toBe(0);

      sut.model.defaultPage = EditPages.Columns;
      sut.selectTabs();
      expect(sut.model.selectedTab).toBe(1);

      sut.model.defaultPage = EditPages.Filters;
      sut.selectTabs();
      expect(sut.model.selectedTab).toBe(2);

      sut.model.defaultPage = EditPages.CellFormatings;
      sut.selectTabs();
      expect(sut.model.selectedTab).toBe(3);
    });

    it("reset should reset form and refresh blotter", async () => {
      await sut.formInitialize();
      sut.onFormRender(createMock<FormRenderProps>());
      await sut.reset();
      expect(mockBlotter.refresh).toBeCalledTimes(1);
    });

    it("submit should close the dialog", async () => {
      await sut.formInitialize();
      sut.onFormRender(createMock<FormRenderProps>());
      await sut.submit({});
      expect(mockDialogService.Close).toBeCalledTimes(1);
    });

    it("should trigger configurationChanged", async () => {
      const congChangeSubject = new Subject<void>();
      arrange(mockCustomFilters).stubProperty("onConfigurationChanged", () => congChangeSubject);
      arrange(mockCellFormattingViewModel).stubProperty("onConfigurationChanged", () => congChangeSubject);
      arrange(mockColumnConfig).stubProperty("onConfigurationChanged", () => congChangeSubject);

      await sut.initialize();

      sut.resetting = false;
      congChangeSubject.next();
      sut.allowGrouping.notifyModelChanged();
      sut.showToolbar.notifyModelChanged();
      await waitFor(() => {
        expect(mockBlotter.refresh).toBeCalled();
      });
    });
  });
});
