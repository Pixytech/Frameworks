import { IocInjectable, IocInject, CoreTypes, IRestClientType, DelegateCommand, using } from "@kinetix/core";
import type { IContainer, IDialogService, IRestClient } from "@kinetix/core";

import { ConfigurationEditorModel, EditPages } from "./ConfigurationEditorModel";
import { IBlotter, IBlotterConfiguration, IColumnConfig } from "../..";
import { FormViewModel, FormTextField, IMetaDataProviderType, FormButtonField, FormBooleanField } from "../../../Forms";
import type { IMetaDataProvider } from "../../../Forms";
import { IBlotterCellFormattingType } from "./CellFormatting";
import { IBlotterColumnConfigType } from "./ColumnConfig";
import { IBlotterCustomFilterType } from "./CustomFilter";

import type { IBlotterCellFormatting } from "./CellFormatting";
import type { IBlotterColumnConfig } from "./ColumnConfig";
import type { IBlotterCustomFilter } from "./CustomFilter";

import { IConfigurationEditor } from "./IConfigurationEditor";

@IocInjectable()
export class ConfigurationEditorViewModel extends FormViewModel<ConfigurationEditorModel> implements IConfigurationEditor {
  blotter: IBlotter;
  blotterName: FormTextField = new FormTextField();
  parentBlotter: FormTextField = new FormTextField();
  blotterDescription: FormTextField = new FormTextField();
  customFilterViewModel: IBlotterCustomFilter;
  columnConfigViewModel: IBlotterColumnConfig;
  cellFormattingViewModel: IBlotterCellFormatting;
  originalConfiguration: IBlotterConfiguration;
  resetting: boolean;
  resetToDefaults: FormButtonField = new FormButtonField(
    new DelegateCommand(
      async () => {
        this.resetConfigsToDefault = true;
        this.dialogService.Close(this, true);
      },
      () => {
        return true;
      }
    ),
    this
  );
  showToolbar: FormBooleanField = new FormBooleanField();
  resetConfigsToDefault: boolean;
  allowGrouping: FormBooleanField = new FormBooleanField();

  constructor(
    @IocInject(CoreTypes.IContainer) container: IContainer,
    @IocInject(CoreTypes.IDialogService) dialogService: IDialogService,
    @IocInject(IMetaDataProviderType) metaDataProvider: IMetaDataProvider,
    @IocInject(IRestClientType) apiClient: IRestClient,
    @IocInject(IBlotterCustomFilterType)
    customFilterViewModel: IBlotterCustomFilter,
    @IocInject(IBlotterColumnConfigType)
    columnConfigViewModel: IBlotterColumnConfig,
    @IocInject(IBlotterCellFormattingType)
    cellFormattingViewModel: IBlotterCellFormatting
  ) {
    super(container, dialogService, metaDataProvider, apiClient);
    this.customFilterViewModel = customFilterViewModel;
    this.columnConfigViewModel = columnConfigViewModel;
    this.cellFormattingViewModel = cellFormattingViewModel;

    this.customFilterViewModel.Owner = this;
    this.columnConfigViewModel.Owner = this;
    this.cellFormattingViewModel.Owner = this;
  }

  protected async onFormInitialize(): Promise<void> {
    this.ticketDialog.canMinimize = false;
    this.ticketDialog.canMaximize = false;
    this.ticketDialog.cyclicTab = true;
    this.ticketDialog.isModel = false;
    this.blotterName.name = "blotterName";
    this.parentBlotter.name = "parentBlotter";
    this.blotterDescription.name = "blotterDescription";

    this.ticketDialog.initialHeight = 500;
    this.ticketDialog.initialWidth = 800;
    this.ticketDialog.draggable = true;
    this.showSubmit = true;

    this.originalConfiguration = JSON.parse(JSON.stringify(this.model.settings)) as IBlotterConfiguration;

    this.setupOptions();
    this.selectTabs();
    this.setupCustomFilterViewModel(this.blotter);
    this.setupColumnConfigViewModel(this.blotter);
    this.setupCellFormattingViewModel(this.blotter);
  }
  setupOptions() {
    this.blotterDescription.setValue(this.blotter.datasetDefinition.description);
    this.blotterName.setValue(this.blotter.model.id);
    this.parentBlotter.setValue(this.blotter.datasetView.name);
    this.showToolbar.setValue(!this.blotter.model.configuration.toolbarCollapsed);
    this.allowGrouping.setValue(!this.blotter.model.configuration.disableGrouping);
  }
  selectTabs(): void {
    switch (this.model.defaultPage) {
      case EditPages.SaveAs:
      case EditPages.Options:
        this.model.selectedTab = 0;
        if (this.model.defaultPage === EditPages.SaveAs) {
          this.blotterName.value = "";
        }
        break;
      case EditPages.Columns:
        this.model.selectedTab = 1;
        break;
      case EditPages.Filters:
        this.model.selectedTab = 2;
        break;
      case EditPages.CellFormatings:
        this.model.selectedTab = 3;
        break;
    }
  }

  protected override async onFormLoad(): Promise<void> {
    this.allowGrouping.onModelChanged.subscribe(async (x) => {
      await this.configurationChanged();
    });

    this.showToolbar.onModelChanged.subscribe(async (x) => {
      await this.configurationChanged();
    });

    this.customFilterViewModel.onConfigurationChanged.subscribe(async () => {
      await this.configurationChanged();
    });
    this.columnConfigViewModel.onConfigurationChanged.subscribe(async () => {
      await this.configurationChanged();
    });
    this.cellFormattingViewModel.onConfigurationChanged.subscribe(async () => {
      await this.configurationChanged();
    });
  }

  async configurationChanged(): Promise<void> {
    this.onChange("", undefined);

    if (!this.resetting) {
      using(this.SuspendNotifications(), () => {
        this.updateModel(
          (m) =>
            (m.settings = {
              ...m.settings,
              filters: this.customFilterViewModel?.model?.filters.filters ? this.customFilterViewModel.model.filters : undefined,
              columnConfigs: this.mapColumnConfigs(),
              toolbarCollapsed: !this.showToolbar.value,
              disableGrouping: !this.allowGrouping.value,
            })
        );
      });

      this.blotter.updateModel((m) => {
        m.configuration = this.model.settings;
      });

      console.debug("Configuration Changed", this.model.settings);
      await this.blotter.refresh({ reloadConfigs: false });
    }
  }

  private setupCustomFilterViewModel = (source: IBlotter) => {
    this.updateModel((model) => {
      this.customFilterViewModel.columns = source.datasetDefinition.columns.filter((colDef) => source.datasetView.columns.some((col) => col.name === colDef.name));
      this.customFilterViewModel.setConfiguration(this.model.settings.filters!, source.model.configuration.settings.gridMode);
    });
  };

  private setupColumnConfigViewModel = (source: IBlotter) => {
    this.updateModel((model) => this.columnConfigViewModel.setConfiguration(source.datasetView, source.datasetDefinition, this.model.settings.columnConfigs!));
  };

  private setupCellFormattingViewModel = (source: IBlotter) => {
    this.updateModel((model) => {
      this.cellFormattingViewModel.columns = source.datasetDefinition.columns.filter((colDef) => source.datasetView.columns.some((col) => col.name === colDef.name));
      const cellFormats = this.model.settings.columnConfigs?.flatMap((x) => x.cellFormats!).filter((x) => x);
      if (cellFormats) {
        this.cellFormattingViewModel.formats = cellFormats;
      } else {
        this.cellFormattingViewModel.formats = [];
      }
      this.cellFormattingViewModel.setConfiguration(source.model.configuration.settings.gridMode);
    });
  };

  private mapColumnConfigs(): IColumnConfig[] {
    console.debug("Mapping Column Configs", this.columnConfigViewModel.model.columns, this.cellFormattingViewModel.model.formats);
    let columnConfigs: IColumnConfig[] = this.columnConfigViewModel.model.columns.map((col, index, list) => {
      let colConfig = this.model.settings.columnConfigs?.find((x) => x.name === col.name);

      let config: IColumnConfig = { ...colConfig, order: index, name: col.name, hidden: !col.selected, width: colConfig?.width! };

      if (this.cellFormattingViewModel?.formatGroups) {
        const cellFormats = this.cellFormattingViewModel.formatGroups.find((x) => x.model.format.column.name === col.name);

        if (cellFormats) {
          config.cellFormats = cellFormats.model.format;
        }
      }

      return config;
    });

    return columnConfigs;
  }

  async onSubmit(request: any): Promise<void> {
    this.dialogService.Close(this, true);
  }

  async reset(): Promise<void> {
    try {
      this.onFormReset();
      this.resetting = true;
      this.updateModel((m) => (m.settings = JSON.parse(JSON.stringify(this.originalConfiguration)) as IBlotterConfiguration));

      this.blotter.updateModel((m) => {
        m.configuration = this.model.settings;
      });

      this.setupOptions();
      this.setupCustomFilterViewModel(this.blotter);
      this.setupColumnConfigViewModel(this.blotter);
      this.setupCellFormattingViewModel(this.blotter);
    } finally {
      this.resetting = false;
      this.configurationChanged();
      this.notifyModelChanged();
    }
  }

  protected createModel(): ConfigurationEditorModel {
    return new ConfigurationEditorModel();
  }
}
