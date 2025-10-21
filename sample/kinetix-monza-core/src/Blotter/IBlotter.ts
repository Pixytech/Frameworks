import { IConfigurationId, IViewModelBase } from "@kinetix/core";
import { SortDescriptor, State, DataResult } from "@progress/kendo-data-query";
import { IBlotterToolbar, MenuItem, IBlotterConfiguration, GridOperationModes } from ".";
import { IBlotterContextMenu } from "./ContextMenu/BlotterContextMenuViewModel";
import { CompositeDataFilter, DataTypes, GridModel, IFilterData, IListFilterDataProvider, SelectionSettings } from "../Data";
import { IWidgetTab } from "../Widgets";
import { GridCustomCellProps } from "@progress/kendo-react-grid";
import { ComponentType } from "react";

export interface IBlotterDatasetColumn {
  name: string;
  hidden: boolean;
  format: string;
  editable?: boolean;
  type?: DataTypes;
  locked?:boolean;
}

export interface IDatasetView {
  parentDatasetView: string;
  datasetID: string;
  datasetViewType: string;
  name: string;
  columns: IBlotterDatasetColumn[];
  userId: string;
  id: string;
}

export interface BlotterColumnDefinition {
  filterProvider?: IListFilterDataProvider;
  name: string;
  displayName: string;
  editable?: boolean;
  displayField: string;
  order?: number;
  type: DataTypes;
  field: string;
  objectName: string;
  groupable: boolean;
  aggregable: boolean;
  useAsParameter: boolean;
  isArray: boolean;
  locked?:boolean
  sortable: boolean;
  allowMultipleValues: boolean;
  forceUTC: boolean;
  primaryDisplayName: boolean;
  defaultColumn: boolean;
  nested: boolean;
  possibleValues: any[];
  enumType: string;
  alternativeFields: string[];
}

export interface IDatasetDefinition {
  id: string;
  name: string;
  collectionNameOverride: string;
  description: string;
  columns: BlotterColumnDefinition[];
  hasPermission: boolean;
  hasFeature: boolean;
  loaded: boolean;
  columnNames: string[];
  defaultParameters: any;
}

export interface IRefreshOptions {
  reloadConfigs: boolean;
  isRtu: boolean;
}

export interface IBlotterDraggableContext {
  enable: boolean;
  reorder(item: any): void;
  dragEnd(): void;
  activeDragItem: any;
}

export interface IBlotterData {
  totalCount: number;
  view: {
    offset: number;
    searchAfterNext: any[];
  };
  items: any[];
}
export interface IBlotterTransformer {
  getListFilterData?(blotter: IBlotter, column: BlotterColumnDefinition): Promise<IFilterData[]>;
  getDatasetDefinition?(source: () => Promise<IDatasetDefinition>, datasetId?: string): Promise<IDatasetDefinition>;
  getBlotterData?(source: () => Promise<IBlotterData>, state: State, skip?: number, take?: number, searchAfterNext?: string[]): Promise<IBlotterData>;
}

export interface IBlotter extends IViewModelBase<BlotterModel> {
  exportToExcel?: () => Promise<void>;
  toggleGroups(): void;
  toggleDetails(): void;
  getEditorType(type: DataTypes): "boolean" | "text" | "date" | "numeric" | undefined;
  onHeaderSelectionChanged(checked: boolean): void;
  handleOnItemChange(field: string | undefined, dataItem: any, value: any): void;
  showOptions(isAltKey: boolean, key: string): Promise<void>;
  toolbar: IBlotterToolbar;
  draggable: IBlotterDraggableContext;
  readonly configurable: boolean;
  readonly configurationId: IConfigurationId;
  get contextMenu(): IBlotterContextMenu;
  datasetView: IDatasetView;
  datasetDefinition: IDatasetDefinition;
  detailDatasetView?: IDatasetView;
  detailDatasetDefinition?: IDatasetDefinition;
  transformer?: IBlotterTransformer;
  liveUpdate: boolean;
  selectionSettings: SelectionSettings;
  onRowClick?: (selectedRow: any) => void;
  getTabOptions(tab: IWidgetTab): Promise<MenuItem[]>;
  handlePageChange(skip?: number, take?: number): Promise<void>;
  sortChange(sortDescriptor: SortDescriptor[]): void;
  dataStateChange(state: State): Promise<void>;
  resetAllFilter(): Promise<void>;
  saveConfiguration(configuration: Partial<IBlotterConfiguration>): Promise<void>;
  loadData(): Promise<void>;
  loadExportData(): Promise<void>;
  refresh(options: Partial<IRefreshOptions>): Promise<void>;
  handleGridExpandChange(dataItem: any, expanded: boolean, dataIndex: number): Promise<void>;
  handleGridColumnReorder(columns: { name: string; orderIndex: number }[]): Promise<void>;
  handleGridColumnResize(columnName: string, index: number, newWidth: number): void;
  setURL(url: string): void;
}
const MINIMUM_CLIENT_SIDE_PAGE_SIZE = 10000;
const DEFAULT_EXPORT_SIZE = 20000;

export class BlotterModel extends GridModel {
  configuration: IBlotterConfiguration = {
    settings: {
      gridMode: GridOperationModes.Server,
      pageSize: MINIMUM_CLIENT_SIDE_PAGE_SIZE,
      exportSize: DEFAULT_EXPORT_SIZE,
      allowGrouping: false,
    },
  };

  totalServerCount: number = 0;
  isLoadingData: boolean = false;
  initialFilter?: CompositeDataFilter;
  initialSorts?: SortDescriptor[];
  columnFilters: boolean = true;
  quickFilters: boolean = false;
  showToolbar: boolean = true;
  isGroupable: boolean = true;
  columnWidths: { name: string; width: number }[] = [];
  disableAutoRefresh: boolean = false;
  busyText: string;
  searchAfterNext: string[][] = [];
  exportItems: any[] = [];
  detailState: State = { skip: 0, take: MINIMUM_CLIENT_SIDE_PAGE_SIZE, sort: [], group: [] };
  masterDetailKey: string[];
  detailKey: string[];
  detailSelectedState: { [id: string]: boolean | number[] }[] = [];
  detailItems: any[][] = [];
  sortable: boolean = true;
  
  editable: boolean = false;
  columns: BlotterColumnDefinition[] = [];
  detailColumns: BlotterColumnDefinition[] = [];
  tags: {
    [x: string]: any;
  } = {};
  totalServerCountBeforeTransform: number;
  protected onProcessData(): DataResult {
    if (this.configuration.settings.gridMode === GridOperationModes.Client) {
      return super.onProcessData();
    } else {
      return { data: this.items ? this.items : [], total: this.items ? this.items.length : 0 };
    }
  }
}

export interface IBlotterContext {
  model: BlotterModel;
  datasetDefinition: IDatasetDefinition;
  missingCellTemplate?: ComponentType<GridCustomCellProps>;
}
