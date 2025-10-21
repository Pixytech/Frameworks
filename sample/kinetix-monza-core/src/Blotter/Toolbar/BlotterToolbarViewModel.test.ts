// reflect-metadata is required for IOC
import "reflect-metadata";
import { CustomizedAt, IConfigurationService, IContainer, IDialogService, IEventAggregator, INotificationService, IRestClient, NotificationModel } from "@kinetix/core";
import { BlotterModel, BlotterToolbarViewModel, ConfigurationEditorViewModel, IBlotter, IMetaDataProvider } from "../..";
import { createMock } from "ts-auto-mock";
import { arrange, createMockEventAggregator } from "../../../../../testing";

// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped viewModel
  let sut: BlotterToolbarViewModel;
  let mockContainer: IContainer;
  let mockDialogService: IDialogService;
  let mockNotificationService: INotificationService;
  let mockMetaDataProvider: IMetaDataProvider;
  let mockRestClient: IRestClient;
  let mockEventAggregator: IEventAggregator;
  let mockConfigurationService: IConfigurationService;
  let mockBlotter: IBlotter;

  // Execute once before all tests
  // To create single module for all tests
  beforeEach(() => {
    mockContainer = createMock<IContainer>();
    mockDialogService = createMock<IDialogService>();
    mockNotificationService = createMock<INotificationService>({ model: new NotificationModel() });
    mockMetaDataProvider = createMock<IMetaDataProvider>();
    mockRestClient = createMock<IRestClient>();
    mockEventAggregator = createMockEventAggregator();
    mockConfigurationService = createMock<IConfigurationService>();
    mockBlotter = createMock<IBlotter>({ model: new BlotterModel() });
    sut = new BlotterToolbarViewModel(mockContainer, mockDialogService, mockMetaDataProvider, mockRestClient, mockEventAggregator, mockConfigurationService, mockNotificationService);

    sut.blotter = mockBlotter;
  });

  // Testing Component
  describe("BlotterToolbarViewModel", () => {
    it("refresh button should refresh blotter", async () => {
      await sut.initialize();
      await sut.refreshButton.execute();

      expect(sut.blotter.refresh).toBeCalledTimes(1);
    });

    it("toggleGroups button should toggle blotter groups", async () => {
      await sut.initialize();
      await sut.toggleGroupsButton.execute();

      expect(sut.blotter.toggleGroups).toBeCalledTimes(1);
    });

    it("clearFilters button should clear filters", async () => {
      await sut.initialize();
      await sut.clearFiltersButton.execute();

      expect(sut.blotter.resetAllFilter).toBeCalledTimes(1);
    });

    it("toggleDetails button should toggle blotter groups", async () => {
      await sut.initialize();
      await sut.toggleDetailsButton.execute();

      expect(sut.blotter.toggleDetails).toBeCalledTimes(1);
    });

    it("When auto refreshed turned on it should refresh the blotter", async () => {
      sut.blotter.model.disableAutoRefresh = false;

      await sut.initialize();

      sut.autoRefresh.setValue(true);
      expect(sut.blotter.updateModel).toBeCalledTimes(1);
    });

    it("reset raise notification on success save", async () => {
      sut.blotter.model.disableAutoRefresh = false;
      arrange(mockBlotter).stubProperty("configurable", () => true);
      await sut.initialize();
      await sut.restToDefaults();
      expect(mockNotificationService.raise).toBeCalledTimes(1);
    });

    it("reset raise notification on error save", async () => {
      sut.blotter.model.disableAutoRefresh = false;
      arrange(mockBlotter).stubProperty("configurable", () => true);
      mockConfigurationService.deleteConfiguration = jest.fn(() => Promise.reject("Error Saving"));
      await sut.initialize();
      await sut.restToDefaults();
      expect(mockNotificationService.raise).toBeCalledTimes(1);
    });

    it("applyChanges raise notification on success save", async () => {
      sut.blotter.model.disableAutoRefresh = false;
      sut.editorViewModel = createMock<ConfigurationEditorViewModel>();

      arrange(mockBlotter).stubProperty("configurable", () => true);
      await sut.initialize();
      await sut.applyChanges();
      expect(mockNotificationService.raise).toBeCalledTimes(1);
    });
  });
});
