import { IocInjectable, ViewModelBase, IConfigurationId, IocInject, CoreTypes, IAuthenticationServiceType, INavigationAware, CustomizedAt, INotificationServiceType, NotificationToast, NotificationSeverity, getDistinct, debounceWithResults, IStreamingServiceType } from "@kinetix/core";
import { State, SortDescriptor, CompositeFilterDescriptor, isCompositeFilterDescriptor, FilterDescriptor } from "@progress/kendo-data-query";
import { Subject, debounceTime, filter } from "rxjs";
import { BlotterModel, IBlotter, IDatasetDefinition, IDatasetView, IRefreshOptions, BlotterColumnDefinition, BlotterStream, BlotterStreamPayload } from ".";
import { SelectionSettings, SelectionMode, toCompositeFilterDescriptor, DataFilter, CompositeDataFilter, DataTypes, ListFilterModel, IFilterData, IListFilterDataProvider } from "../Data";

import { dataService } from "../Utils/blotterApi";
import { IWidgetTab } from "../Widgets";
import { GridOperationModes, IBlotterConfiguration, IColumnConfig } from "./BlotterConfiguration";
import { BlotterSelectionContext, MenuItem } from "./ContextMenu";
import { BlotterContextMenuViewModel } from "./ContextMenu/BlotterContextMenuViewModel";
import { BlotterCloseEvent } from "./Events";
import { IBlotterToolbarType, EditPages } from "./Toolbar";
import calculateSize from "calculate-size";
import type { IEventAggregator, IConfigurationService, IAuthenticationService, INotificationService, IStreamingService } from "@kinetix/core";
import { type IBlotterToolbar, type IBlotterDraggableContext, type IBlotterData, type IBlotterTransformer, Helpers, NotificationCategory } from "..";

import type { IBlotterContextMenu } from "./ContextMenu/BlotterContextMenuViewModel";
import { DATA_ITEM_KEY, NULL_DATA, SELECTED_FIELD, idGetter } from "./Utils/constants";
import { get, isDate, set } from "lodash";
import { getGroupIds } from "@progress/kendo-react-data-tools";
import { GridColumnProps } from "@progress/kendo-react-grid";

@IocInjectable()
export class BlotterViewModel extends ViewModelBase<BlotterModel> implements IBlotter {
  lastFilterState: string;
  private readonly filterChangeSubject = new Subject<void>();

  /**
   * true if configuration exists
   */
  configurable: boolean;

  readonly configurationId: IConfigurationId = {
    application: "Monza",
    category: "Workspace",
    section: "Blotter",
    item: "",
  };
  // if true: subscribes itself to WebSocket and is receives RTUs individually
  // if false: does not subscibe to WebSocket, however parent can invoke data refresh based on external RTUs
  liveUpdate: boolean = false;
  datasetDefinition: IDatasetDefinition;
  datasetView: IDatasetView;
  detailDatasetDefinition?: IDatasetDefinition;
  detailDatasetView?: IDatasetView;
  events: IEventAggregator;
  protected configSvc: IConfigurationService;
  transformer?: IBlotterTransformer;
  selectionSettings: SelectionSettings = new SelectionSettings();
  blotterContextMenu: IBlotterContextMenu;
  toolbar: IBlotterToolbar;
  rtuService: IStreamingService;
  authService: IAuthenticationService;
  private url: string = "/data/search?";
  notificationService: INotificationService;

  setURL(url: string) {
    this.url = url;
  }

  constructor(
    @IocInject(CoreTypes.IEventAggregator) events: IEventAggregator,
    @IocInject(CoreTypes.IConfigurationService)
    configSvc: IConfigurationService,
    @IocInject(IBlotterToolbarType) toolbar: IBlotterToolbar,
    @IocInject(BlotterContextMenuViewModel)
    blotterContextMenu: IBlotterContextMenu,
    @IocInject(IStreamingServiceType)
    rtuService: IStreamingService,
    @IocInject(IAuthenticationServiceType) authService: IAuthenticationService,
    @IocInject(INotificationServiceType) notificationService: INotificationService
  ) {
    super();
    this.authService = authService;
    this.notificationService = notificationService;
    this.blotterContextMenu = blotterContextMenu;
    this.rtuService = rtuService;
    this.events = events;
    this.configSvc = configSvc;
    this.selectionSettings.mode = SelectionMode.Multiple;
    this.selectionSettings.drag = true;
    this.selectionSettings.cell = true;
    this.selectionSettings.enabled = true;
    this.toolbar = toolbar;
    this.toolbar.blotter = this;
  }
  onEnrichColumn(column: GridColumnProps): GridColumnProps 
  {
    return column;
  }
 
  exportToExcel?: (() => Promise<void>) | undefined;
  toggleGroups(): void {
    this.updateModel((x) => {
      x.collapsedState = x.collapsedState.length ? [] : getGroupIds({ data: x.getDataResult().data });
    });
  }

  toggleDetails(): void {
    this.updateModel((x) => {
      x.detailedRowExpandState = x.detailedRowExpandState.length ? [] : x.items.map((y) => idGetter(y));
    });
  }

  notifyFilterChanged(): void {
    const filterState = JSON.stringify(this.model.state.filter || {});
    console.debug("notifyFilterChanged", this.lastFilterState);
    if (this.lastFilterState != filterState) {
      this.lastFilterState = filterState;
      this.filterChangeSubject.next();
    }
  }

  async updateListFilters(): Promise<void> {
    const listFilterColumns = this.model.columns.filter((x) => x.type == DataTypes.enum || x.type == DataTypes.list);
    console.debug("updateListFilters", listFilterColumns);
    for (const col of listFilterColumns) {
      if (col.filterProvider) {
        await col.filterProvider.refreshFilters();
      }
    }
  }

  getEditorType(type: DataTypes): "boolean" | "text" | "date" | "numeric" | undefined {
    console.debug("editor:", type);
    //'text' | 'numeric' | 'boolean' | 'date'
    switch (type) {
      case DataTypes.boolean:
        return "boolean";
      case DataTypes.date:
      case DataTypes.dateTime:
        return "date";
      case DataTypes.enum:
      case DataTypes.string:
        return "text";
      case DataTypes.int:
      case DataTypes.long:
      case DataTypes.number:
      case DataTypes.numeric:
        return "numeric";
    }

    return undefined;
  }

  onHeaderSelectionChanged(checked: boolean): void {
    const newSelectedState: { [id: string]: boolean | number[] } = {};
    this.model.items.forEach((item) => {
      newSelectedState[idGetter(item)] = checked === true;
    });

    this.updateModel((m) => (m.selectedState = newSelectedState));
  }

  onRowClick: ((selectedRow: any) => void) | undefined;
  
  draggable: IBlotterDraggableContext;

  /**
   * Force show blotter options so admin can configure blotter that doesn't have toolbar or no config exists
   *
   * @remarks
   * This method is part of the {@link core-library#Statistics | Statistics subsystem}.
   *
   * @param x - The first input number
   * @param y - The second input number
   * @returns The arithmetic mean of `x` and `y`
   */
  async showOptions(isShiftKey: boolean, key: string): Promise<void> {
    
    if (isShiftKey && key === "T") {
      const role = this.authService.GetParsedToken()?.UserRole;
      //const isDevSupport = role === UserRole.DevSupport;
      // if (isDevSupport) {
      this.configurable = true;
      this.toolbar.optionsButton.execute();
      // }
    }
  }

  async getTabOptions(tab: IWidgetTab): Promise<MenuItem[]> {
    let menu = [];
    if (!this.configurable) {
      await this.loadConfiguration();
    }
    const hasClonedConfigs = this.model.configuration.clonedConfig !== undefined;
    if (tab.IsCustomWidget) {
      menu.push(
        ...[
          {
            id: "delete",
            displayName: "Delete",
            disabled: false,
            icon: "delete",
            onSelect: async (context: BlotterSelectionContext, parent: INavigationAware) => {
              console.debug("Closing Blotter...");
              context.rows.forEach((x) => {
                this.events.getEvent<BlotterCloseEvent>(BlotterCloseEvent, BlotterCloseEvent.Type).publish({
                  close: {
                    key: x.key,
                    config: this.configurationId,
                  },
                });
              });
            },
          },
        ]
      );
    }

    if (this.model.showToolbar) {
      menu.push({
        id: "configure",
        displayName: "Configure",
        disabled: false,
        icon: "gear",
        onSelect: async (context: BlotterSelectionContext, parent: INavigationAware) => {
          console.debug("configure Blotter...");
          this.toolbar.optionsButton.execute(EditPages.Options);
        },
      });
    }

    return menu;
  }

  get contextMenu(): IBlotterContextMenu {
    return this.blotterContextMenu;
  }

  protected createModel(): BlotterModel {
    return new BlotterModel();
  }

  async resetAllFilter(): Promise<void> {
    console.debug("Reset Blotter column filter");
    this.updateModel((m) => {
      m.state.filter = { logic: "and", filters: [] };
    });
    this.notifyFilterChanged();
    await this.refresh({ reloadConfigs: false });
  }

  async handlePageChange(skip?: number, take?: number): Promise<void> {
    console.debug("page changed", skip, take);
    this.updateModel((m) => {
      m.state = { ...m.state, skip: skip, take: take };
    });
  }

  sortChange = async (sortDescriptor: SortDescriptor[]) => {
    const isServerMode = this.model.configuration.settings.gridMode === GridOperationModes.Server;
      this.updateModel((m) => {
        m.state = {
          ...m.state,
          sort: sortDescriptor,
          skip: isServerMode ? 0 : m.state.skip,
        };
      });

      console.debug("Blotter state changed", this.model.state);

      if (isServerMode) {
        await this.loadData();
      } else {
        this.calculateColumnWidths();
      }
  };

  dataStateChange = async (state: State) => {
      this.updateModel((model) => (model.state = state));
      console.log("Blotter state changed", this.model.state);

      if (this.model.configuration.settings.gridMode === GridOperationModes.Server) {
        await this.loadData();
      } else {
        this.calculateColumnWidths();
      }

      this.notifyFilterChanged();
    this.notifyModelChanged();
  };

  private loadBlotterConfiguration = async (): Promise<void> => {
    this.configurationId.item = this.model.id;

    const configItem = await this.configSvc.getConfiguration<IBlotterConfiguration>(this.configurationId);

    this.configurable = configItem !== undefined;

    if (this.configurable) {
      this.updateModel((m) => {
        m.configuration = {
          ...m.configuration,
          ...configItem?.value,
        };

        this.model.initialSorts = m.configuration.sorts;
      });

      console.debug(`Got Blotter Config`, this.configurationId, configItem, this.model.configuration);
    }
  };

  async saveConfiguration(configuration: Partial<IBlotterConfiguration>): Promise<void> {
    let newConfiguration = {
      ...this.model.configuration,
      ...configuration,
    };

    if (this.configurable) {
      await this.configSvc.saveConfiguration({
        application: this.configurationId.application,
        category: this.configurationId.category,
        section: this.configurationId.section,
        item: this.configurationId.item,
        customizedAt: CustomizedAt.User,
        appliesTo: [],
        value: newConfiguration,
      });
    }
    this.updateModel((m) => (m.configuration = newConfiguration));
  }

  /*   formatDateTime(item: any) {
    Object.keys(item).forEach((key: string) => {
      if (typeof item[key] === "string" && item[key].includes("UTC"))
        item[key] = Helpers.localeDateTime(item[key]);
    });
    return item;
  } */

  protected async onInitializeOnce(): Promise<void> {
    try {
      
      await this.loadConfiguration();
      if (this.model.initialSorts) {
        this.model.state = { ...this.model.state, sort: this.model.initialSorts };
      }
      await this.loadData();

      if (this.liveUpdate) {
        this.rtuService
          .getAdapter<BlotterStreamPayload>(BlotterStream).stream
          .pipe(
            filter((updates) => {
              const datasets = Array.from(updates).map((update) => update.datasetID);
              return datasets.includes(this.datasetView.datasetID) || datasets.includes("");
            })
          )
          .subscribe((e) => {
            this.onBlotterRtu(e);
          });
      }

      this.filterChangeSubject.pipe(debounceTime(800)).subscribe(() => {
        this.updateListFilters();
      });
    } finally {
      this.updateModel((m) => (m.busyText = ""));
    }
  }

  async loadDatasetDefinition(datasetId: string | undefined) {
    const configColumns = this.model.configuration.columnConfigs;
    const source = async () => {
      const datasetDefinition: IDatasetDefinition = await dataService.getDatasetDefinition(datasetId);
      const columns = Object.values(datasetDefinition.columns);
      const result = {
        ...datasetDefinition,
        columns: columns.map((x) => {
          const configCol = configColumns?.find((y) => y.name == x.name);
          if (configCol) {
            return { ...x, configCol };
          } else {
            return x;
          }
        }),
      } as IDatasetDefinition;
      return result;
    };

    let result: IDatasetDefinition;
    const transformerCallBack = this.transformer?.getDatasetDefinition;
    if (transformerCallBack) {
      result = await transformerCallBack(source, datasetId);
    } else {
      result = await source();
    }

    console.debug(`Get dataset Definition${this.model.id}`, result);
    return result;
  }
  async getBlotterData(state: State, skip?: number, take?: number, searchAfterNext?: string[]): Promise<IBlotterData> {
    const result = await this.getBlotterDataInternal(state,skip,take,searchAfterNext);
    return result;
  };



   getBlotterDataInternal = debounceWithResults(async (state: State, skip?: number, take?: number, searchAfterNext?: string[]): Promise<IBlotterData>=> {
    const source = async () => {
      const response = await dataService.getDatasetDataByRequest(this.datasetView?.id, skip, take, searchAfterNext ?? [], this.datasetDefinition, this.datasetView?.userId, state, this.url);
      const rawData = response as IBlotterData;
      console.debug(`source rx data ${this.model.id}`,rawData);
      const finalData = this.cleanupBlotterData({...rawData});
      console.debug(`returning final data ${this.model.id}`,finalData);
      this.model.totalServerCountBeforeTransform = finalData.totalCount;
      return finalData;
    };

    let result: IBlotterData;

    if (this.transformer?.getBlotterData) {
      const transFormedData = await this.transformer.getBlotterData(source, state, skip, take, searchAfterNext);
      console.debug(`Transform blotter data ${this.model.id}`,transFormedData,this.transformer);
      result = this.cleanupBlotterData({... transFormedData});
    } else {
      console.debug(`Getting blotter data  from source${this.model.id}`);
      result = await source();
    }
    console.debug(`Get Blotter Data ${this.model.id}`, result);
    return result;
  },200);

  private cleanupBlotterData(rawData: IBlotterData) {
    const blotterColumns = this.datasetDefinition?.columns ? this.datasetDefinition.columns: this.model.columns;

    return this.cleanupData(rawData, blotterColumns);
  }

  private cleanupDetailBlotterData(rawData: IBlotterData) {
    const blotterColumns = this.detailDatasetDefinition?.columns ? this.detailDatasetDefinition.columns: this.model.detailColumns;

    return this.cleanupData(rawData, blotterColumns);
  }

  private cleanupData(rawData: IBlotterData, blotterColumns: BlotterColumnDefinition[]): IBlotterData {
    const dateColumns = blotterColumns.filter(x=>x.type == DataTypes.date).map((x) => x.name);
    const dateTimeColumns = blotterColumns.filter(x=>x.type == DataTypes.dateTime).map((x) => x.name);
    const allColumns = blotterColumns.map((x) => x.name);

    const items = rawData.items ?? [];
   
    const finaldata =  {
      totalCount: rawData.totalCount,
      view: rawData.view,
      items: items.map((row) => {
        const columnNames = Object.keys(row);

        const dateColumnsName = dateColumns.filter((c: string) => columnNames.includes(c));
        dateColumnsName.forEach((key) => set(row, key,isDate(row[key])?row[key]: row[key]?Helpers.parseDate(row[key],"YYYY-MM-DD",true):NULL_DATA))

        const dateTimeColumnsName = dateTimeColumns.filter((c: string) => columnNames.includes(c));
        dateTimeColumnsName.forEach((key) => set(row, key,isDate(row[key])?row[key]: row[key]?Helpers.parseDateTime(row[key],"YYYY-MM-DD HH:mm:ss.SSS UTC",true):NULL_DATA));

        const missingColumns = allColumns.filter((c: string) => !columnNames.includes(c));
        missingColumns.forEach((key) => set(row, key, NULL_DATA));
        return row;
      }),
    };
    console.debug(`cleanupData Blotter Data ${this.model.id}`, finaldata,rawData);
    return finaldata;
  }

  loadConfiguration = async (): Promise<void> => {
    

    if(this.datasetView){

      //load blotter custom config
        await this.loadBlotterConfiguration();

        console.debug(`loadConfiguration ${this.model.id}`, this.datasetView);
    
    this.datasetDefinition = await this.loadDatasetDefinition(this.datasetView.datasetID);
    if (this.detailDatasetView) {
      this.detailDatasetDefinition = await this.loadDatasetDefinition(this.detailDatasetView.datasetID);
    }

     this.updateModel((m) => {
      m.columns = this.getActiveColumns();
      m.detailColumns = this.getActiveDetailColumns();
    });
  }

   
  };

  private getQueryStateFilter(): CompositeFilterDescriptor {
    let columnFilters =
      this.model.configuration.settings.gridMode === GridOperationModes.Server && this.model.state.filter
        ? this.model.state.filter.filters.map((x) => {
            if (isCompositeFilterDescriptor(x)) {
              return {filters: [x.filters.at(0)], logic: "and"} as CompositeFilterDescriptor
            }

            return {filters: [x], logic: "and"} as CompositeFilterDescriptor ;
          })
        : [];

    let customFilters = this.model.configuration.filters ? toCompositeFilterDescriptor(this.model.configuration.filters).filters : [];

    let initialFilters = this.model.initialFilter ? toCompositeFilterDescriptor(this.model.initialFilter).filters : [];

    return {
      logic: "and",
      filters: [...initialFilters, ...customFilters, ...columnFilters],
    };
  }

  getSearchAfterNextParam(skip?: number, take?: number): string[] {
    if (skip && take && this.model.configuration.settings.gridMode === GridOperationModes.Server) {
      let pageIndex = skip / take;
      if (this.model.searchAfterNext[pageIndex]) {
        return this.model.searchAfterNext[pageIndex];
      }
    }

    return [];
  }

  loadData = async (): Promise<void> => {
    console.debug(`loadData Blotter data ${this.model.id}`)
    this.setIsLoadingData(true);

    const oldState = {selectionState:this.model.selectedState, collapsedState: this.model.collapsedState,detailSelectedState : this.model.detailSelectedState, detailedRowExpandState : this.model.detailedRowExpandState};

    
    try {
      let queryState: State = {
        ...this.model.state,
        filter: this.getQueryStateFilter(),
      };

      

      const isServerMode = this.model.configuration.settings.gridMode === GridOperationModes.Server;

      let dataRes: IBlotterData;
      if (isServerMode) {
        dataRes = await this.getBlotterData(queryState, queryState.skip, queryState.take, this.getSearchAfterNextParam(queryState.skip, queryState.take));
      } else {
        dataRes = await this.getBlotterData(queryState, 0, this.model.configuration.settings.pageSize);
      }

      if (this.model.isGroupable && this.model.state.group) {
        for (let item of dataRes.items) {
          for (let groupCol of this.model.state.group) {
            item[groupCol.field] = item[groupCol.field] || "";
          }
        }
      }

      console.debug("Got this blotter data from query", dataRes.items);

      if (dataRes.items) {
        this.updateModel((m) => {
          m.items = dataRes.items;
          m.totalServerCount = dataRes.totalCount;
          
          if (isServerMode) {
            let pageSize = queryState.take || 20;
            if (dataRes.view?.offset === 0) {
              m.searchAfterNext.length = 0;
            }

            let pageIndex = dataRes.view?.offset || 1 / pageSize;
            if (!m.searchAfterNext[pageIndex + 1] && dataRes.view) {
              m.searchAfterNext[pageIndex + 1] = dataRes.view.searchAfterNext;
            }
          }
        });
      }

      this.calculateColumnWidths();
    } catch (error) {
      console.error("Error loading blotter data for dataset view", this.datasetView, error);
    } finally {
      this.updateModel((m) => {
        m.selectedState = oldState.selectionState;
        m.collapsedState = oldState.collapsedState;
        m.detailSelectedState = oldState.detailSelectedState;
        m.detailedRowExpandState = oldState.detailedRowExpandState;
      });
      this.setIsLoadingData(false);
    }
    await this.updateListFilters();
    this.notifyModelChanged();
  };

  private queryExportData = async (): Promise<any[]> => {
    const maxPageSize = 10000;
    const exportTotal = Math.min(this.model.totalServerCountBeforeTransform , this.model.configuration.settings.exportSize || 20000);
    const take = Math.min(exportTotal, maxPageSize);
    const queryState: State = {
      ...this.model.state,
      filter: this.getQueryStateFilter(),
    };

    const batchCount = Math.floor(exportTotal / maxPageSize) + (exportTotal % maxPageSize ? 1 : 0);

    let skip = 0;
    let searchAfterNext: any[] = [];
    let items: any[] = [];
    for (let i = 0; i < batchCount; ++i) {
      const data = await this.getBlotterData(queryState, skip, take, searchAfterNext);

      if (data.items) {
        for (const element of data.items) {
          items.push(element);
        }

        searchAfterNext = data.view.searchAfterNext;
      }

      skip += maxPageSize;
    }

    return items;
  };

  loadExportData = async (): Promise<void> => {
    let items = this.model.items;

    const isServerMode = this.model.configuration.settings.gridMode === GridOperationModes.Server;
    if (isServerMode) {
      try {
        this.setIsLoadingData(true);

        items = await this.queryExportData();
      } catch (error) {
        console.error("Error loading blotter data for export", this.datasetView.id, error);
      } finally {
        this.setIsLoadingData(false);
      }
    }

    this.updateModel((m) => (m.exportItems = items));
  };

  async refresh(options: Partial<IRefreshOptions>): Promise<void> {
    if (options?.reloadConfigs) {
      await this.loadConfiguration();
    }

    const autoRefreshDisabled = this.model.disableAutoRefresh === true;

    if (autoRefreshDisabled && options?.isRtu) {
      this.notificationService.raise({
        title: `Recieved new data`,
        body: "There is more recent data avilable. Please refresh.",
        toast: NotificationToast.Transient,
        severity: NotificationSeverity.Low,
        stream: {
          category: `${NotificationCategory.Blotters}`,
          type: "Custom",
        },
      });

      this.toolbar.updateModel((model) => model.rtuCount++);
    } else {
      await this.loadData();
      this.toolbar.updateModel((model) => (model.rtuCount = 0));
    }
  }

  private async onBlotterRtu(data: BlotterStreamPayload[]) {
    if (this.liveUpdate) {
      
      await this.refresh({ isRtu: true });
    }
  }

  private setIsLoadingData = (loading: boolean) => {
    this.updateModel((model) => (model.isLoadingData = loading));
    this.toolbar.updateModel((m) => (m.isLoadingData = loading));
  };

  getColumns = (datasetView: IDatasetView, datasetDefinition: IDatasetDefinition, columnConfigs?: IColumnConfig[]): BlotterColumnDefinition[] => {
    if (!datasetDefinition?.columns) {
      return [];
    }

    // get the columns from datasetView and update from configs
    const columns = datasetView.columns
      .filter((x) => !x.hidden)
      .map((x) => {
        let column = { ...x, order: -1, hidden: true, displayName: "", editable: false };

        const config = columnConfigs?.find((y) => y.name === x.name);

        if (config) {
          column.order = config.order!;
          column.hidden = config.hidden!;
          if (config.displayName) {
            column.displayName = config.displayName;
          }
          if (config.locked) {
            column.locked = config.locked;
          }

          if (config.editable) {
            column.editable = config.editable;
          }

          if (config.type) {
            column.type = config.type;
          }
        }

        return column;
      })
      .filter((x) => !x.hidden);

    columns.sort((x, y) => x.order - y.order);

    const activeColumnDefs = columns
      .map((col) => {
        const column = datasetDefinition.columns.find((element, index, array) => element.name === col.name);
        if (column) {
          if (col.displayName) {
            column.displayName = col.displayName;
          }

          if (col.locked) {
            column.locked = col.locked;
          }

          if (col.type) {
            column.type = col.type;
          }

          if (col.editable) {
            column.editable = col.editable;
          } else if (column.editable !== true) {
            column.editable = false;
          }
        }

        return column!;
      })
      .filter((x) => x);

    return (activeColumnDefs.length > 0 ? activeColumnDefs : datasetDefinition.columns).map((col) => {
      if (!col.filterProvider && (col.type == DataTypes.enum || col.type == DataTypes.list)) {
        col.filterProvider = new ListFilterDataProvider(this, col);
      }
      return col;
    });
  };

  getActiveColumns = (): BlotterColumnDefinition[] => {
    const cols = this.getColumns(this.datasetView, this.datasetDefinition, this.model.configuration.columnConfigs);
    console.debug("getActiveColumns", cols);
    return cols;
  };

  getActiveDetailColumns = (): BlotterColumnDefinition[] => {
    return this.getColumns(this.detailDatasetView!, this.detailDatasetDefinition!, this.model.configuration.detailColumnConfigs);
  };

  handleGridExpandChange = async (dataItem: any, expanded: boolean, dataIndex: number) => {
    const item = dataItem;

    if (item.groupId) {
      const collapsedIds = !expanded ? [...this.model.collapsedState, item.groupId] : this.model.collapsedState.filter((groupId) => groupId !== item.groupId);
      this.updateModel((model) => (model.collapsedState = collapsedIds));
    } else {
      const fieldId = idGetter(item);

      if (expanded) {
        const detailData = await this.getDetailData(item);

        const items = detailData.map((item, index) => {
          const key = Helpers.getCompositeKey(item, index, this.model.detailKey);
          const detailRowSelectedState = this.model.detailSelectedState[dataIndex] || [];
          return Object.assign({ [SELECTED_FIELD]: detailRowSelectedState[idGetter(item)], [DATA_ITEM_KEY]: key }, item);
        });

        this.updateModel((m) => {
          m.detailItems[dataIndex] = items;
        });
      }

      const detailedRowExpansionIds = expanded ? [...this.model.detailedRowExpandState, fieldId] : [...this.model.detailedRowExpandState.filter((id) => id !== fieldId)];
      this.updateModel((model) => (model.detailedRowExpandState = detailedRowExpansionIds));
    }
  };

  handleOnItemChange(field: string | undefined, dataItem: any, value: any): void {
    let fieldName = field ?? "";
    const fieldId = idGetter(dataItem);
    let newData = this.model.items.map((item) => {
      if (idGetter(item) === fieldId) {
        set(item, fieldName, value);
        return item;
      }
      return item;
    });
    this.updateModel((m) => (m.items = newData));
  }

  getDetailData = async (masterItem: any): Promise<any[]> => {
    if (!this.detailDatasetView) {
      return [];
    }

    let filters = this.model.masterDetailKey
      .filter((key) => get(masterItem, key, undefined) !== undefined)
      .map((key) => {
        let filter: DataFilter = {
          field: key,
          operator: "eq",
          type: DataTypes.string,
          value: get(masterItem, key),
          ignoreCase: true,
        };

        return filter;
      });

    let filter: CompositeDataFilter = {
      logic: "and",
      filters: filters,
    };

    let detailState: State = { ...this.model.detailState, filter: filter };

    let result = await dataService.getDatasetDataByRequest(this.detailDatasetView.id, 0, 20, [], this.detailDatasetDefinition, this.detailDatasetView.userId, detailState, this.url);

    result = this.cleanupDetailBlotterData(result);

    return result.items;
  };

  handleGridColumnReorder = async (reOrderedCols: { name: string; orderIndex: number }[]): Promise<void> => {
    if (this.toolbar.isActive()) {
      console.warn("Blotter columns reorder not allowed when editor is open");
      return;
    }

    let columnConfigs = reOrderedCols.map((col) => {
      let conf = this.model.configuration.columnConfigs?.find((x) => x.name === col.name);

      if (conf) {
        conf.order = col.orderIndex;
      } else {
        conf = {
          name: col.name,
          order: col.orderIndex,
          hidden: false,
        };
      }

      return conf;
    });

    await this.saveConfiguration({ columnConfigs });

    await this.loadBlotterConfiguration();

    this.calculateColumnWidths();
  };

  handleGridColumnResize = async (columnName: string, index: number, newWidth: number) => {
    if (this.toolbar.isActive()) {
      console.debug("Blotter columns resize not allowed when editor is open");
      return;
    }

    const updatedColumn = this.datasetDefinition.columns.find((x) => x.name === columnName)!;

    let newConfig: IBlotterConfiguration = { ...this.model.configuration };

    if (newConfig.columnConfigs) {
      const itemIndex = newConfig.columnConfigs?.findIndex((col) => col.name === updatedColumn.name);
      if (itemIndex && itemIndex >= 0) {
        newConfig.columnConfigs[itemIndex].width = newWidth;
      } else {
        newConfig.columnConfigs.push({
          name: updatedColumn.name,
          width: newWidth,
        });
      }
    } else {
      newConfig.columnConfigs = [{ name: updatedColumn.name, width: newWidth }];
    }

    await this.saveConfiguration(newConfig);

    this.updateModel((model) => {
      this.calculateColumnWidths();
    });
  };

  calculateColumnWidth = (column: BlotterColumnDefinition, currentPage: any[]) => {
    if (this.model.configuration.columnConfigs?.length! > 0) {
      const widthData = this.model.configuration.columnConfigs?.find((item) => item.name === column.name);
      if (widthData?.width) {
        return widthData.width;
      }
    }

    let headerWidth = calculateSize(column.displayName ? column.displayName : "", {
      font: "Roboto",
      fontSize: "1rem",
      fontWeight: "400",
    }).width;

    let contentWidth = 0;

    currentPage.forEach((row) => {
      const content = row[column.name];
      const size = calculateSize(content, {
        font: "Roboto",
        fontSize: "1rem",
        fontWeight: "400",
      }); // pass the font properties based on the application
      if (size.width > contentWidth) {
        contentWidth = size.width;
      }
    });
    const finalWidth = Math.max(headerWidth + 60, contentWidth + 16);
    return finalWidth;
  };

  calculateColumnWidths = () => {
    let widths: { name: string; width: number }[] = [];
    const currentPage = this.model.configuration.settings.gridMode === GridOperationModes.Client ? this.model.items.slice(this.model.state.skip, this.model.state.skip! + this.model.state.take!) : this.model.items;

    this.model.columns.forEach((column) => {
      const width = this.calculateColumnWidth(column, currentPage);
      widths.push({ name: column.name, width: width });
    });

    this.updateModel((model) => (model.columnWidths = widths));
    console.debug("Blotter column widths updated", this.model.columnWidths);
  };
}

export class ListFilterDataProvider extends ViewModelBase<ListFilterModel> implements IListFilterDataProvider {
  blotter: IBlotter;
  column: BlotterColumnDefinition;

  constructor(blotter: IBlotter, column: BlotterColumnDefinition) {
    super();
    this.blotter = blotter;
    this.column = column;
  }

  async dataFactory(): Promise<IFilterData[]> {
    const getData = () => {
      return this.column.possibleValues
        ? this.column.possibleValues.map((x) => {
            return { text: get(x, "displayName", ""), value: get(x, "value") };
          })
        : getDistinct(this.blotter.model.items, this.column.name).map((x) => {
            return { text: x, value: x };
          });
    };
    const getFilterDataCallBack = this.blotter.transformer?.getListFilterData;
    return getFilterDataCallBack ? await getFilterDataCallBack(this.blotter, this.column) : getData();
  }

  async refreshFilters(): Promise<void> {
    const data = await this.dataFactory();
    this.updateModel((m) => {
      m.data = data;
    });
  }

  protected createModel(): ListFilterModel {
    return new ListFilterModel();
  }

  protected async onInitializeOnce(): Promise<void> {
    await this.refreshFilters();
  }
}
