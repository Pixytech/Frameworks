import { IocInjectable, DelegateCommand, IocInject, CoreTypes, IRestClientType, INotificationServiceType, NotificationToast, NotificationSeverity, IndicatorColor, DelegateCommandOf } from "@kinetix/core";
import type { IContainer, IDialogService, IRestClient, IConfigurationService, IEventAggregator, INotificationService } from "@kinetix/core";
import { BlotterCloneEvent, BlotterConfigurationItem, GridOperationModes, IBlotter, IBlotterConfiguration } from "..";
import { FormViewModel, FormBooleanField, FormButtonField, IMetaDataProviderType } from "../../Forms";
import type { IMetaDataProvider } from "../../Forms";

import { BlotterToolbarModel, IBlotterToolbar } from "./IBlotterToolbar";

import { EditPages, ConfigurationEditorViewModel } from "./Editors";
import { NotificationCategory } from "../../NotificationCategory";

@IocInjectable()
export class BlotterToolbarViewModel extends FormViewModel<BlotterToolbarModel> implements IBlotterToolbar {
  blotter: IBlotter;
  autoRefresh: FormBooleanField = new FormBooleanField();

  configService: IConfigurationService;
  events: IEventAggregator;
  originalConfiguration: IBlotterConfiguration;
  editorViewModel: ConfigurationEditorViewModel | undefined;
  notificationService: INotificationService;

  constructor(@IocInject(CoreTypes.IContainer) container: IContainer, @IocInject(CoreTypes.IDialogService) dialogService: IDialogService, @IocInject(IMetaDataProviderType) metaDataProvider: IMetaDataProvider, @IocInject(IRestClientType) api: IRestClient, @IocInject(CoreTypes.IEventAggregator) events: IEventAggregator, @IocInject(CoreTypes.IConfigurationService) configService: IConfigurationService, @IocInject(INotificationServiceType) notificationService: INotificationService) {
    super(container, dialogService, metaDataProvider, api);
    this.notificationService = notificationService;
    this.events = events;
    this.configService = configService;
  }
  toggleDetailsButton: FormButtonField = new FormButtonField(
    new DelegateCommand(
      () => {
        this.blotter.toggleDetails();
        this.notifyModelChanged();
      },
      () => true
    ),
    this
  );
  toggleGroupsButton: FormButtonField = new FormButtonField(
    new DelegateCommand(
      () => {
        this.blotter.toggleGroups();
        this.notifyModelChanged();
      },
      () => true
    ),
    this
  );

  isActive(): boolean {
    return this.editorViewModel !== undefined;
  }

  clearFiltersButton: FormButtonField = new FormButtonField(
    new DelegateCommand(
      async () => {
        await this.blotter.resetAllFilter();
      },
      () => true
    ),
    this
  );

  refreshButton: FormButtonField = new FormButtonField(
    new DelegateCommand(
      async () => {
        this.updateModel((model) => (model.isLoadingData = true));
        try {
          await this.blotter.refresh({});
        } finally {
          this.updateModel((model) => (model.isLoadingData = false));
        }
      },
      () => !this.model.isLoadingData
    ),
    this
  );

  exportPdfButton: FormButtonField = new FormButtonField(
    new DelegateCommandOf<() => void>(
      (exportHandler) => {
        exportHandler();
      },
      () => this.blotter.model.configuration.settings.gridMode === GridOperationModes.Client
    ),
    this
  );

  exportExcelButton: FormButtonField = new FormButtonField(
    new DelegateCommandOf<() => void>(
      (exportHandler) => {
        exportHandler();
      },
      () => true
    ),
    this
  );

  async revertChanges(): Promise<void> {
    // dialog is cancelled
    this.blotter.updateModel((m) => {
      m.configuration = JSON.parse(JSON.stringify(this.originalConfiguration)) as IBlotterConfiguration;
    });
    await this.blotter.refresh({ reloadConfigs: false });
  }

  async restToDefaults(): Promise<boolean> {
    let result: boolean = false;
    try {
      if (this.blotter.configurable) {
        const clonedConfigs = this.blotter.model.configuration.clonedConfig;
        const isClonedblotter = clonedConfigs !== undefined;
        if (!isClonedblotter) {
          await this.configService.deleteConfiguration(this.blotter.configurationId);
          result = true;
        } else {
          await this.blotter.saveConfiguration({
            ...clonedConfigs,
            clonedConfig: clonedConfigs,
          });
        }

        this.notificationService.raise({
          title: `Blotter saved`,
          body: "Blotter configuration was reset successfully",
          toast: NotificationToast.Transient,
          severity: NotificationSeverity.Low,
          stream: {
            category: `${NotificationCategory.Blotters}`,
            type: "Custom",
          },
          indicator: {
            color: IndicatorColor.Green,
          },
        });
      }
    } catch (error) {
      this.notificationService.raise({
        title: `Error resetting`,
        body: "Failed to reset blotter configuration",
        toast: NotificationToast.Transient,
        severity: NotificationSeverity.Low,
        stream: {
          category: `${NotificationCategory.Blotters}`,
          type: "Custom",
        },
        indicator: {
          color: IndicatorColor.Red,
        },
      });

      console.error(`Failed to reset blotter coniguration.`, error);
    }
    return result;
  }
  async saveAsBlotter(): Promise<void> {
    if (this.editorViewModel) {
      if (this.blotter.configurable) {
        let blotterConfigItem = new BlotterConfigurationItem();
        blotterConfigItem.application = this.blotter.configurationId.application;
        blotterConfigItem.category = this.blotter.configurationId.category!;
        blotterConfigItem.section = this.blotter.configurationId.section!;
        blotterConfigItem.item = this.editorViewModel.blotterName.value;
        blotterConfigItem.value = {
          ...this.editorViewModel.model.settings,
          clonedConfig: this.blotter.model.configuration,
        };

        console.debug("Save As New Blotter", { blotterConfigItem });

        this.events.getEvent<BlotterCloneEvent>(BlotterCloneEvent, BlotterCloneEvent.Type).publish({
          clone: {
            refKey: "",
            id: this.editorViewModel.blotterName.value,
            clonedFromId: this.editorViewModel.blotter.model.id,
            name: this.editorViewModel.blotterName.value,
            title: this.editorViewModel.blotterName.value,
            datasetView: this.editorViewModel.blotter.datasetDefinition.id,
            parent: this.editorViewModel.blotter.model.id,
            description: this.editorViewModel.blotterDescription.value,
            config: blotterConfigItem,
          },
        });
      }
    }
  }

  async applyChanges(): Promise<void> {
    if (this.editorViewModel) {
      await this.blotter.saveConfiguration(this.editorViewModel.model.settings);

      this.notificationService.raise({
        title: `Blotter saved`,
        body: "Blotter configuration saved successfully",
        toast: NotificationToast.Transient,
        severity: NotificationSeverity.Low,
        stream: {
          category: `${NotificationCategory.Blotters}`,
          type: "Custom",
        },
        indicator: {
          color: IndicatorColor.Green,
        },
      });

      await this.blotter.refresh({ reloadConfigs: true });
    }
  }

  optionsButton: FormButtonField = new FormButtonField(
    new DelegateCommandOf<EditPages>(
      async (defaultPage) => {
        if (!this.editorViewModel) {
          this.editorViewModel = this.container.build<ConfigurationEditorViewModel>(ConfigurationEditorViewModel);

          this.originalConfiguration = JSON.parse(JSON.stringify(this.blotter.model.configuration)) as IBlotterConfiguration;

          this.editorViewModel.titleBar.model.title = `${this.blotter.datasetView.name} - Settings`;
          this.editorViewModel.model.settings = {
            ...this.blotter.model.configuration,
          };
          this.editorViewModel.model.defaultPage = defaultPage;

          this.editorViewModel.blotter = this.blotter;

          await this.editorViewModel.formInitialize();
          // this is required to let blotter know that toolbar window is open
          // it will disable the column order and width change.
          const autoRefreshState = this.autoRefresh.value;

          this.blotter.notifyModelChanged();

          this.autoRefresh.updateModel((m) => {
            m.disabled = true;
            m.value = false;
          });
          if (await this.dialogService.ShowDialog(this.editorViewModel)) {
            this.autoRefresh.updateModel((m) => {
              m.value = autoRefreshState;
              m.disabled = false;
            });
            try {
              if (this.editorViewModel.resetConfigsToDefault) {
                await this.restToDefaults();
                await this.blotter.refresh({ reloadConfigs: true });
              } else {
                if (this.editorViewModel.model.defaultPage === EditPages.SaveAs) {
                  await this.saveAsBlotter();
                  await this.revertChanges();
                } else {
                  await this.applyChanges();
                  await this.blotter.refresh({ reloadConfigs: false });
                }
              }
            } catch (error) {
              this.notificationService.raise({
                title: `Error saving`,
                body: "Failed to save blotter configuration",
                toast: NotificationToast.Transient,
                severity: NotificationSeverity.Low,
                stream: {
                  category: `${NotificationCategory.Blotters}`,
                  type: "Custom",
                },
                indicator: {
                  color: IndicatorColor.Red,
                },
              });

              console.error(`Failed to save blotter coniguration.`, error);
            }
          } else {
            this.autoRefresh.updateModel((m) => {
              m.value = autoRefreshState;
              m.disabled = false;
            });
            await this.revertChanges();
          }

          this.editorViewModel = undefined;
        } else {
          this.editorViewModel.updateModel((m) => (m.defaultPage = defaultPage));
          this.editorViewModel.selectTabs();
          this.dialogService.Activate(this.editorViewModel);
        }
      },
      () => true
    ),
    this
  );

  protected async onFormInitialize(): Promise<void> {
    this.autoRefresh.value = !this.blotter.model.disableAutoRefresh;
  }

  protected async onFormLoad(): Promise<void> {
    this.autoRefresh.onModelChanged.subscribe((x) => {
      if (!this.isActive()) {
        this.blotter.updateModel((m) => (m.disableAutoRefresh = !x.value));
        if (x.value === true) {
          this.blotter.refresh({});
        }
      }
    });
  }

  async onInitializeOnce(): Promise<void> {
    await this.formInitialize();
    if (super.onInitializeOnce) {
      await super.onInitializeOnce();
    }
  }

  protected createModel(): BlotterToolbarModel {
    return new BlotterToolbarModel();
  }
}
