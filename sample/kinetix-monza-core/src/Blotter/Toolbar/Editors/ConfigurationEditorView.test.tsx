// reflect-metadata is required for IOC
import "reflect-metadata";
import React from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { createMock } from "ts-auto-mock";
import { arrange, arrangeViewModel, createMockViewResolver, hostComponent } from "../../../../../../testing";

import { CoreTypes, DelegateCommand, ICommand, IContainer, IDialogService, IRestClient } from "@kinetix/core";
import { FormModel, FormViewModel, IMetaDataProvider, TicketLayout } from "../../../Forms";
import { ConfigurationEditorView, ConfigurationEditorViewProps } from "./ConfigurationEditorView";
import { ConfigurationEditorViewModel } from "./ConfigurationEditorViewModel";
import { ConfigurationEditorModel } from "./ConfigurationEditorModel";
import { BlotterCustomFilterModel, IBlotterCustomFilter } from "./CustomFilter";
import { BlotterColumnConfigModel, IBlotterColumnConfig } from "./ColumnConfig";
import { BlotterCellFormattingModel, IBlotterCellFormatting } from "./CellFormatting";
import { BlotterModel, IBlotter, IBlotterConfiguration } from "../..";

// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped module
  let mockViewModel: ConfigurationEditorViewModel;

  let mockContainer: IContainer;
  let mockDialogService: IDialogService;
  let mockMetaDataProvider: IMetaDataProvider;
  let mockRestClient: IRestClient;
  let mockBlotter: IBlotter;
  let mockCustomFilters: IBlotterCustomFilter;
  let mockColumnConfig: IBlotterColumnConfig;
  let mockCellFormattingViewModel: IBlotterCellFormatting;
  let mockFormViewModel: MockFormViewModel;
  class MockFormViewModel extends FormViewModel<FormModel> {
    protected async onFormInitialize(): Promise<void> {}

    protected createModel(): FormModel {
      return new (class extends FormModel {})();
    }

    field: ConfigurationEditorViewModel;
  }

  beforeEach(() => {
    mockContainer = createMock<IContainer>();
    mockDialogService = createMock<IDialogService>();

    mockMetaDataProvider = createMock<IMetaDataProvider>();
    mockRestClient = createMock<IRestClient>();
    mockCustomFilters = createMock<IBlotterCustomFilter>({ model: new BlotterCustomFilterModel() });
    mockColumnConfig = createMock<IBlotterColumnConfig>({ model: new BlotterColumnConfigModel() });
    mockCellFormattingViewModel = createMock<IBlotterCellFormatting>({ model: new BlotterCellFormattingModel() });

    mockBlotter = createMock<IBlotter>({ model: new BlotterModel() });
    arrangeViewModel(mockBlotter).acceptModelChanges().acceptViewChanges();

    mockViewModel = new ConfigurationEditorViewModel(mockContainer, mockDialogService, mockMetaDataProvider, mockRestClient, mockCustomFilters, mockColumnConfig, mockCellFormattingViewModel);
    mockViewModel.blotter = mockBlotter;
    mockViewModel.model.settings = createMock<IBlotterConfiguration>();

    const viewResolver = createMockViewResolver();
    arrange(mockContainer).stubMethod("build", () => viewResolver, [CoreTypes.IViewResolver]);
    arrange(viewResolver).stubMethod("renderInstance", () => "SOME-CONTENT");

    mockFormViewModel = createMock<MockFormViewModel>({ model: new (class x extends FormModel {})() });
    arrangeViewModel(mockFormViewModel)
      .acceptModelChanges()
      .acceptViewChanges()
      .stubProperty("field", () => mockViewModel);
  });

  afterEach(() => {
    cleanup();
    jest.resetAllMocks();
  });

  // Testing Component
  describe("ConfigurationEditorView", () => {
    it("should render  tabs", async () => {
      await mockFormViewModel.field.formInitialize();
      let sut = hostComponent(
        <TicketLayout viewModel={mockFormViewModel}>
          <ConfigurationEditorView dataContext={mockFormViewModel.field}></ConfigurationEditorView>
        </TicketLayout>,
        mockContainer
      );

      const view = render(sut);

      // uncomment to see the html code
      // screen.debug();

      expect(view).not.toBeNull();

      await waitFor(() => {
        expect(screen.getByText("Overview")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Overview"));
      expect(mockViewModel.model.selectedTab).toBe(0);

      fireEvent.click(screen.getByText("Columns"));
      expect(mockViewModel.model.selectedTab).toBe(1);

      fireEvent.click(screen.getByText("Custom Filters"));
      expect(mockViewModel.model.selectedTab).toBe(2);

      fireEvent.click(screen.getByText("Cell Formatting"));
      expect(mockViewModel.model.selectedTab).toBe(3);
    });
  });
});
