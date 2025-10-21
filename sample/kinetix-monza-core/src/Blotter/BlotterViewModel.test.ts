// reflect-metadata is required for IOC
import "reflect-metadata";
import { IAuthenticationService, IConfigurationService, IEventAggregator, INavigationAware, INotificationService, IStreamingService, NotificationModel } from "@kinetix/core";

import { ContextMenuModel, IBlotterContextMenu } from "./ContextMenu/BlotterContextMenuViewModel";
import { dataService } from "../Utils/blotterApi";
import { arrange, createMockEventAggregator } from "../../../../testing";
import { createMock } from "ts-auto-mock";
import { SortDescriptor } from "@progress/kendo-data-query";
import { Subject } from "rxjs";
import { DATA_ITEM_KEY } from "./Utils/constants";
import { waitFor } from "@testing-library/react";
import { process } from "@progress/kendo-data-query";
import { BlotterColumnDefinition, IDatasetView } from ".";
import { DataTypes } from "../Data";
import { FormButtonField } from "../Forms";
import { UserRole } from "../Provider/UserRole";
import { ITabOptions, WidgetTypes } from "../Widgets";
import { GridOperationModes } from "./BlotterConfiguration";
import { BlotterStream, BlotterStreamPayload, BlotterUpdateType } from "./BlotterStream";
import { BlotterViewModel } from "./BlotterViewModel";
import { BlotterCloseEvent } from "./Events";
import { IBlotterToolbar, BlotterToolbarModel } from "./Toolbar";
// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped viewModel
  let sut: BlotterViewModel;
  let mockEvents: IEventAggregator;
  let mockNotificationService: INotificationService;
  let mockConfigService: IConfigurationService;
  let mockToolbar: IBlotterToolbar;
  let mockRtuService: IStreamingService;
  let mockContextMenu: IBlotterContextMenu;
  let mockNavigationAware: INavigationAware;
  let mockAuthenticationService: IAuthenticationService;
  let mockRtuSubject: Subject<BlotterStreamPayload[]>;

  // this is real data service mocking
  let mockdataService: typeof dataService = dataService;

  let blotterColumns: BlotterColumnDefinition[];

  // Execute once before all tests
  // To create single module for all tests
  beforeEach(() => {
    mockEvents = createMockEventAggregator();

    mockConfigService = createMock<IConfigurationService>();
    mockAuthenticationService = createMock<IAuthenticationService>();
    mockNavigationAware = createMock<INavigationAware>();
    mockNotificationService = createMock<INotificationService>({ model: new NotificationModel() });
    mockToolbar = createMock<IBlotterToolbar>({
      model: new BlotterToolbarModel(),
    });
    mockRtuService = createMock<IStreamingService>();
    mockRtuSubject = new Subject<BlotterStreamPayload[]>();
    const adapter = createMock<BlotterStream>({stream:mockRtuSubject});
    arrange(mockRtuService).stubMethod("getAdapter", () => adapter);
   
    mockContextMenu = createMock<IBlotterContextMenu>({
      model: new ContextMenuModel(),
    });

    //assetClass - enum,testField - list, name -string,bookId -int,date - date,valid - boolean
    blotterColumns = [
      {
        name: "assetClass",
        displayName: "Asset",
        displayField: "assetClass",
        order: 0,
        type: DataTypes.enum,
        field: "assetClass",
        objectName: "assetClass",
        groupable: true,
        aggregable: true,
        useAsParameter: true,
        isArray: true,
        sortable: true,
        allowMultipleValues: true,
        forceUTC: true,
        primaryDisplayName: true,
        defaultColumn: true,
        nested: true,
        enumType: "string",
        alternativeFields: [],
        possibleValues: [
          { displayName: "assetClassValue1", value: "assetClassValue1" },
          { displayName: "assetClassValue2", value: "assetClassValue2" },
        ],
      },
      {
        name: "testField",
        displayName: "testField",
        displayField: "testField",
        order: 0,
        type: DataTypes.list,
        field: "testField",
        objectName: "testField",
        groupable: true,
        aggregable: true,
        useAsParameter: true,
        isArray: true,
        sortable: true,
        allowMultipleValues: true,
        forceUTC: true,
        primaryDisplayName: true,
        defaultColumn: true,
        nested: true,
        possibleValues: [],
        enumType: "string",
        alternativeFields: [],
      },
      {
        name: "name",
        displayName: "Name",
        displayField: "name",
        order: 1,
        type: DataTypes.string,
        field: "name",
        objectName: "name",
        groupable: true,
        aggregable: true,
        useAsParameter: true,
        isArray: true,
        sortable: true,
        allowMultipleValues: true,
        forceUTC: true,
        primaryDisplayName: true,
        defaultColumn: true,
        nested: true,
        possibleValues: [],
        enumType: "string",
        alternativeFields: [],
      },

      {
        name: "bookId",
        displayName: "Book Id",
        displayField: "bookId",
        order: 0,
        type: DataTypes.number,
        field: "bookId",
        objectName: "bookId",
        groupable: true,
        aggregable: true,
        useAsParameter: true,
        isArray: true,
        sortable: true,
        allowMultipleValues: true,
        forceUTC: true,
        primaryDisplayName: true,
        defaultColumn: true,
        nested: true,
        possibleValues: [],
        enumType: "string",
        alternativeFields: [],
      },

      {
        name: "date",
        displayName: "date",
        displayField: "date",
        order: 4,
        type: DataTypes.date,
        field: "date",
        objectName: "date",
        groupable: true,
        aggregable: true,
        useAsParameter: true,
        isArray: true,
        sortable: true,
        allowMultipleValues: true,
        forceUTC: true,
        primaryDisplayName: true,
        defaultColumn: true,
        nested: true,
        possibleValues: [],
        enumType: "string",
        alternativeFields: [],
      },
      {
        name: "dateTime",
        displayName: "dateTime",
        displayField: "dateTime",
        order: 4,
        type: DataTypes.dateTime,
        field: "dateTime",
        objectName: "dateTime",
        groupable: true,
        aggregable: true,
        useAsParameter: true,
        isArray: true,
        sortable: true,
        allowMultipleValues: true,
        forceUTC: true,
        primaryDisplayName: true,
        defaultColumn: true,
        nested: true,
        possibleValues: [],
        enumType: "string",
        alternativeFields: [],
      },
      {
        name: "valid",
        displayName: "valid",
        displayField: "valid",
        order: 5,
        type: DataTypes.boolean,
        field: "valid",
        objectName: "valid",
        groupable: true,
        aggregable: true,
        useAsParameter: true,
        isArray: true,
        sortable: true,
        allowMultipleValues: true,
        forceUTC: true,
        primaryDisplayName: true,
        defaultColumn: true,
        nested: true,
        possibleValues: [],
        enumType: "string",
        alternativeFields: [],
      },
    ];

    sut = new BlotterViewModel(mockEvents, mockConfigService, mockToolbar, mockContextMenu, mockRtuService, mockAuthenticationService, mockNotificationService);
    sut.model.initialSorts = []
    sut.datasetView = createMock<IDatasetView>();

    sut.configurationId.item = "testBlotter";
    sut.datasetView.datasetID = "testDatasetId";
    //assetClass - enum,testField - list, name -string,bookId -int,date - date,valid - boolean
    sut.datasetView.columns = [
      {
        name: "assetClass",
        hidden: false,
        format: "number",
      },
      {
        name: "b/s",
        hidden: false,
        format: "string",
      },
      {
        name: "book",
        hidden: false,
        format: "number",
      },
      {
        name: "bookId",
        hidden: false,
        format: "number",
      },
      {
        name: "testField",
        hidden: false,
        format: "",
      },
      {
        name: "name",
        hidden: false,
        format: "",
      },
      {
        name: "date",
        hidden: false,
        format: "",
      },
      {
        name: "dateTime",
        hidden: false,
        format: "",
      },
      
      {
        name: "valid",
        hidden: false,
        format: "",
      },
    ];

    sut.detailDatasetView = createMock<IDatasetView>();
    sut.detailDatasetView.datasetID = "testSubDatasetId";
    sut.detailDatasetView.columns = [
      {
        name: "bookId",
        hidden: false,
        format: "number",
      },
      {
        name: "bookDescription",
        hidden: false,
        format: "string",
      },
    ];

    arrange(mockConfigService).stubMethod("getConfiguration", () =>
      Promise.resolve({
        value: {
          clonedConfig: {},
          filters: {
            logic: "and",
            filters: [],
          },
          columnConfigs: [
            {
              name: "b/s",
              hidden: false,
              order: 1,
              width: 70,
            },
            {
              name: "assetClass",
              displayName: "assetClass",
              type: DataTypes.enum,
              order: 0,
              hidden: false,
              width: 80,
              editable: true,
            },

            {
              name: "testField",
              displayName: "testField",
              order: 0,
              hidden: false,
              width: 80,
            },
            {
              name: "name",
              displayName: "name",
              order: 0,
              hidden: false,
              width: 80,
            },
            {
              name: "date",
              displayName: "date",
              order: 0,
              hidden: false,
              width: 80,
            },
            {
              name: "dateTime",
              displayName: "dateTime",
              order: 0,
              hidden: false,
              width: 80,
            },
            
            {
              name: "valid",
              displayName: "valid",
              order: 0,
              hidden: false,
              width: 80,
            },
          ],
          detailColumnConfigs: [
            {
              name: "bookId",
              order: 0,
            },
            {
              name: "bookDescription",
              order: 1,
            },
          ],
        },
      })
    );

    arrange(mockdataService)
      .stubMethod("getDatasetDataByRequest", () =>
        Promise.resolve({
          totalCount: 3,
          items: [
            {
              assetClass: "BOND",
              "b/s": "Buy",
              bookId: "646464",
              testField: "testField",
              name: "name",
              date: "26/10/2022",
              dateTime: "2013-07-30 00:00:00.000 UTC",
              valid: true,
            },
            {
              assetClass: "BOND",
              "b/s": "Buy",
              book: "BONDS-NA",
              bookId: "646464",
              testField: "testField",
              name: "name1",
              date: "26/10/2022",
              dateTime: "2013-07-30 00:00:00.000 UTC",
              valid: false,
            },
            {
              assetClass: "BOND",
              "b/s": "Sell",
              book: "BONDS-NA",
              bookId: "646464",
              testField: "testField",
              name: "name1",
              date: "26/10/2022",
              dateTime: "2013-07-30 00:00:00.000 UTC",
              valid: false,
            },
            {
              assetClass: "BOND",
              "b/s": "Sell",
              book: "BONDS-NA",
              bookId: "646464",
              testField: "testField",
              name: "name1",
              date: "",
              dateTime: "",
              valid: false,
            },
          ],
          view: {
            offset: 0,
            searchAfterNext: ["10000"],
          },
        })
      )
      .stubMethod(
        "getDatasetDefinition",
        () =>
          Promise.resolve({
            id: "1",
            name: "dummy",
            collectionNameOverride: "override",
            description: "desc",
            columns: blotterColumns,
            hasPermission: true,
            hasFeature: true,
            loaded: true,
            columnNames: [],
            defaultParameters: {},
          }),
        ["testDatasetId"]
      )
      .stubMethod(
        "getDatasetDefinition",
        () =>
          Promise.resolve({
            id: "2",
            name: "dummy",
            collectionNameOverride: "override",
            description: "desc",
            columns: blotterColumns,
            hasPermission: true,
            hasFeature: true,
            loaded: true,
            columnNames: [],
            defaultParameters: {},
          }),
        ["testSubDatasetId"]
      );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("BlotterViewModel", () => {
    it("instance should be created", () => {
      expect(sut).not.toBeNull();
      sut.setURL("Something");
    });

    it("initialization should load data for Blotter model", async () => {
      let mockIsLoad = jest.spyOn(sut as any, "setIsLoadingData");
      sut.liveUpdate = true;
      sut.model.initialSorts = [{ field: "some", dir: "asc" }];
      await sut.initialize();

      expect(mockConfigService.getConfiguration).toBeCalledTimes(1);
      expect(mockIsLoad).toBeCalledTimes(2);
      expect(sut.model.totalServerCount).toBe(3);
      expect(mockRtuService.getAdapter).toBeCalled();
      expect(sut.model.items.length).toBe(4);
    });

    // TEST:  Kinetix Monza Core > BlotterViewModel > getTabOptions should return delete menu for custom blotter
    it("getTabOptions should return delete menu for custom blotter", async () => {
      let mockVM = createMock<ITabOptions>();

      let options = await sut.getTabOptions({
        key: "custom",
        title: "TestBlotter",
        widgetType: WidgetTypes.Blotter,
        IsCustomWidget: true,
        optionVM: mockVM,
      });

      let deleteMenu = options.find((x) => x.id === "delete");
      expect(options).not.toBeNull();
      expect(options.length).toBeGreaterThan(0);
      expect(deleteMenu).not.toBeNull();
      expect(deleteMenu?.disabled).toBeFalsy();
      expect(deleteMenu?.displayName).toBe("Delete");
      expect(deleteMenu?.icon).toBe("delete");
      expect(deleteMenu?.onSelect).not.toBeNull();
    });

    it("should show hidden toolbar options for blotter on shift+T", async () => {
      let formButton = createMock<FormButtonField>();
      arrange(mockToolbar).stubProperty("optionsButton", () => formButton);
      arrange(mockAuthenticationService).stubMethod("GetParsedToken", () => {
        return { UserRole: UserRole.DevSupport };
      });

      await sut.showOptions(true, "T");
      expect(sut.configurable).toBe(true);
      expect(sut.toolbar.optionsButton.execute).toBeCalled();
    });

    it("getTabOptions on select should raise events for delete", async () => {
      let mockVM = createMock<ITabOptions>();

      // has cloend config and is custom blotter
      sut.model.configuration.clonedConfig = sut.model.configuration;
      let options = await sut.getTabOptions({
        key: "custom",
        title: "TestBlotter",
        widgetType: WidgetTypes.Blotter,
        IsCustomWidget: true,
        optionVM: mockVM,
      });

      let deleteMenu = options.find((x) => x.id === "delete");
      expect(deleteMenu).not.toBeNull();

      deleteMenu?.onSelect({ rows: [{ key: "test" }] }, mockNavigationAware);

      expect(mockEvents.getEvent(BlotterCloseEvent, BlotterCloseEvent.Type).publish).toBeCalled();
    });

    it("getTabOptions on select should update toolbar on configure", async () => {
      let mockVM = createMock<ITabOptions>();
      let formButton = createMock<FormButtonField>();
      arrange(mockToolbar).stubProperty("optionsButton", () => formButton);

      sut.model.showToolbar = true;
      let options = await sut.getTabOptions({
        key: "custom",
        title: "TestBlotter",
        widgetType: WidgetTypes.Blotter,
        IsCustomWidget: true,
        optionVM: mockVM,
      });

      let configureMenu = options.find((x) => x.id === "configure");
      expect(configureMenu).not.toBeNull();
      configureMenu?.onSelect({ rows: [] }, mockNavigationAware);
      expect(sut.contextMenu).toBe(mockContextMenu);
      expect(mockToolbar.optionsButton.execute).toBeCalled();
    });

    it("saveConfiguration should update model  but not config for non configured blotter", async () => {
      await sut.saveConfiguration({ disableGrouping: true });
      expect(sut.model.configuration.disableGrouping).toBe(true);
      expect(mockConfigService.saveConfiguration).not.toBeCalled();
    });

    it("Reset filter should reset filters and refresh blotter", async () => {
      let mockRefresh = jest.spyOn(sut, "refresh");
      await sut.resetAllFilter();
      expect(sut.model.state.filter?.filters.length).toBe(0);
      expect(mockRefresh).toBeCalledWith(expect.objectContaining({ reloadConfigs: false }));
    });

    it("Page change update the blotter state", async () => {
      await sut.handlePageChange(10, 20);
      expect(sut.model.state.skip).toBe(10);
      expect(sut.model.state.take).toBe(20);
    });

    it("Sort update the blotter state", () => {
      sut.model.configuration.settings.gridMode = GridOperationModes.Client;
      let mockupdateModel = jest.spyOn(sut, "updateModel");
      let mocknotifyModelChanged = jest.spyOn(sut, "notifyModelChanged");
      let sortDescriptor: SortDescriptor[] = [{ field: "testField", dir: "asc" }];
      sut.model.state.skip = 20;
      sut.sortChange(sortDescriptor);

      expect(mockupdateModel).toBeCalled();
      expect(mocknotifyModelChanged).toBeCalled();

      expect(sut.model.state.sort).toBe(sortDescriptor);
      expect(sut.model.state.skip).toBe(20);
    });

    it("filter change should refresh list filters", async () => {
      sut.model.configuration.settings.gridMode = GridOperationModes.Client;
      sut.model.state.skip = 20;

      await sut.initialize();

      await sut.dataStateChange({
        filter: {
          logic: "or",
          filters: [{ field: "testField", value: "some", operator: "eq" }],
        },
      });

      sut.notifyFilterChanged();

      sut.model.state.filter = {
        logic: "or",
        filters: [{ field: "testField", value: "some1", operator: "eq" }],
      };

      const filterColumns = sut.model.columns.map((x) => (x.filterProvider ? x.filterProvider : undefined)).filter((x) => x != undefined);
      sut.notifyFilterChanged();

      const mockRefreshFilters = jest.fn();
      filterColumns.forEach((x) => {
        if (x) {
          x.refreshFilters = mockRefreshFilters;
        }
      });

      await waitFor(() => {
        expect(mockRefreshFilters).toBeCalled();
      });
    });

    it("Server mode sort call loadData", () => {
      sut.model.configuration.settings.gridMode = GridOperationModes.Server;
      let mockupdateModel = jest.spyOn(sut, "updateModel");
      let mockloaddata = jest.spyOn(sut, "loadData");
      let sortDescriptor: SortDescriptor[] = [{ field: "testField", dir: "asc" }];
      sut.model.state.skip = 20;
      sut.sortChange(sortDescriptor);

      expect(mockupdateModel).toBeCalled();
      expect(mockloaddata).toBeCalled();
      expect(sut.model.state.skip).toBe(0);
    });

    it("Datastate update the blotter state", () => {
      let mockupdateModel = jest.spyOn(sut, "updateModel");
      let mocknotifyModelChanged = jest.spyOn(sut, "notifyModelChanged");
      const state = { ...sut.model.state, skip: 10 };
      sut.dataStateChange(state);

      expect(mockupdateModel).toBeCalled();
      expect(mocknotifyModelChanged).toBeCalled();

      expect(sut.model.state).toBe(state);
    });

    it("Server mode datastate call loadData", () => {
      sut.model.configuration.settings.gridMode = GridOperationModes.Server;
      let mockupdateModel = jest.spyOn(sut, "updateModel");
      let mockloaddata = jest.spyOn(sut, "loadData");
      const state = { ...sut.model.state, skip: 10 };
      sut.dataStateChange(state);

      expect(mockupdateModel).toBeCalled();
      expect(mockloaddata).toBeCalled();
    });

    it("Server mode without initial filter", () => {
      sut.model.configuration.settings.gridMode = GridOperationModes.Server;
      sut.model.state.filter = {
        logic: "and",
        filters: [
          {
            logic: "and",
            filters: [{ field: "direction", operator: "startsWith", value: "Buy" }],
          },
        ],
      };

      let getblotterdatamock = jest.spyOn(sut, "getBlotterData");
      const state = { ...sut.model.state, skip: 10 };
      sut.dataStateChange(state);
 
      let queryState = {
        filter: {
          
          filters:  [{filters: [{field: "direction", operator: "startsWith", value: "Buy"}], logic: "and"}],
          logic: "and",
        },
      };

      expect(getblotterdatamock).toBeCalledWith(expect.objectContaining(queryState), expect.anything(), expect.anything(), expect.anything());
      expect(sut.model.state.filter?.filters.length).toBe(1);
    });

    it("Server mode combine filters", () => {
      sut.model.configuration.settings.gridMode = GridOperationModes.Server;
      sut.model.initialFilter = {
        logic: "and",
        filters: [
          {
            field: "state",
            operator: "startsWith",
            value: "Done",
            type: DataTypes.enum,
          },
        ],
      };

      sut.model.configuration.filters = {
        logic: "and",
        filters: [
          {
            field: "trader",
            operator: "eq",
            value: "trader1",
            type: DataTypes.string,
          },
        ],
      };

      sut.model.state.filter = {
        logic: "and",
        filters: [
          {
            logic: "and",
            filters: [{ field: "direction", operator: "startsWith", value: "Buy" }],
          },
        ],
      };

      let getblotterdatamock = jest.spyOn(sut, "getBlotterData");
      const state = { ...sut.model.state, skip: 10 };
      sut.dataStateChange(state);

      let queryState = {
        filter: {
          filters: [
            {logic: "and",filters: [{ field: "state", operator: "startsWith", value: "Done" }]},
            {logic: "and",filters: [{ field: "trader", operator: "eq", value: "trader1" }]},
            {logic: "and",filters: [{ field: "direction", operator: "startsWith", value: "Buy" }]},
          ],
          logic: "and",
        },
      };
      

      expect(getblotterdatamock).toBeCalledWith(expect.objectContaining(queryState), expect.anything(), expect.anything(), expect.anything());
      expect(sut.model.state.filter?.filters.length).toBe(1);
    });

    it("Server mode combine filters - unnested column filter", () => {
      sut.model.configuration.settings.gridMode = GridOperationModes.Server;
      sut.model.initialFilter = {
        logic: "and",
        filters: [
          {
            field: "state",
            operator: "startsWith",
            value: "Done",
            type: DataTypes.enum,
          },
        ],
      };

      sut.model.state.filter = {
        logic: "and",
        filters: [{ field: "direction", operator: "startsWith", value: "Buy" }],
      };

      let getblotterdatamock = jest.spyOn(sut, "getBlotterData");
      const state = { ...sut.model.state, skip: 10 };
      sut.dataStateChange(state);

      let queryState = {
        filter: {
          filters: [
            {filters: [{field: "state", operator: "startsWith", value: "Done"}], "logic": "and"}, 
            {filters: [{field: "direction", operator: "startsWith", value: "Buy"}], "logic": "and"}
          ], logic: "and"}
        };

      expect(getblotterdatamock).toBeCalledWith(expect.objectContaining(queryState), expect.anything(), expect.anything(), expect.anything());
      expect(sut.model.state.filter?.filters.length).toBe(1);
    });

    it("handleGridExpandChange update the blotter state", () => {
      let mockupdateModel = jest.spyOn(sut, "updateModel");
      sut.handleGridExpandChange({ groupId: "groupId" }, true, 0);
      expect(mockupdateModel).toBeCalled();
    });

    it("handleGridExpandChange expand detail", async () => {
      sut.model.masterDetailKey = ["detailId"];
      const masterItem = {
        detailId: "myDetailId",
        [DATA_ITEM_KEY]: "myId",
      };

      await sut.handleGridExpandChange(masterItem, true, 0);
      expect(sut.model.detailedRowExpandState).toContain("myId");
    });

    it("toggleDetails expand detail", async () => {
      let mockupdateModel = jest.spyOn(sut, "updateModel");
      await sut.toggleDetails();
      expect(mockupdateModel).toBeCalled();
      //expect(sut.model.detailedRowExpandState).toContain("myId");
    });



    it("toggleGroups expands groups", () => {
      
      sut.toggleGroups();
      expect(sut.model.collapsedState.length).toBe(0);
      const items = [{key:'key1'},{key:'key2'}]
      
      const groupedData =  process(items , {group:[{field:'key'}]});

      arrange(sut.model).stubMethod("getDataResult",()=>groupedData)
      
      sut.model.collapsedState=['key1'];
      sut.toggleGroups();
      expect(sut.model.collapsedState.length).toBe(0);
    });

    it("saveConfiguration should save config", async () => {
      // this will invoke to get config server and determin if blotter is confiogurable or not
      await sut.initialize();
      await sut.saveConfiguration({ disableGrouping: true });
      expect(sut.model.configuration.disableGrouping).toBe(true);
      expect(mockConfigService.saveConfiguration).toBeCalledTimes(1);
    });

    it("refresh should invoke loadconfigs", async () => {
      await sut.refresh({ reloadConfigs: true });

      expect(mockdataService.getDatasetDefinition).toBeCalledTimes(2);
      expect(sut.toolbar.updateModel).toBeCalled();
      expect(mockdataService.getDatasetDataByRequest).toBeCalledTimes(1);
    });

    it("Should update on rtu", async () => {
      sut.liveUpdate = true;
      await sut.initialize();
      mockRtuSubject.next([{
        datasetID: "",
        type: BlotterUpdateType.Single,
      }]);
      expect(mockdataService.getDatasetDefinition).toBeCalledTimes(2);
      expect(sut.toolbar.updateModel).toBeCalled();
      expect(mockdataService.getDatasetDataByRequest).toBeCalledTimes(1);
    });

    it("blotter should load data on rtu when autorefresh enabled", async () => {
      sut.model.disableAutoRefresh = false;

      await sut.refresh({ isRtu: true });

      await waitFor(()=>{
        expect(mockdataService.getDatasetDefinition).not.toBeCalled();

        expect(sut.toolbar.updateModel).toBeCalled();
        expect(mockdataService.getDatasetDataByRequest).toBeCalled();
      })
      
    });

    it("blotter handleGridColumnReorder when toolbar is active should not update", async () => {
      sut.model.disableAutoRefresh = false;
      arrange(mockToolbar).stubMethod("isActive", () => true);
      sut.handleGridColumnReorder([]);
      expect(mockConfigService.saveConfiguration).not.toBeCalled();
    });

    it("blotter should raise notification on rtu when autorefresh disabled", async () => {
      sut.model.disableAutoRefresh = true;

      await sut.refresh({ isRtu: true });

      expect(mockNotificationService.raise).toBeCalled();

      expect(mockdataService.getDatasetDefinition).not.toBeCalled();

      expect(sut.toolbar.updateModel).toBeCalled();
      expect(mockdataService.getDatasetDataByRequest).not.toBeCalled();
    });

    it("calculateColumnWidths should recalculate width of columns", async () => {
      sut.datasetDefinition = {
        id: "1",
        name: "dummy",
        collectionNameOverride: "override",
        description: "desc",
        columns: [blotterColumns[0]],
        hasPermission: true,
        hasFeature: true,
        loaded: true,
        columnNames: [],
        defaultParameters: {},
      };
      sut.model.columns = [blotterColumns[0]];
      sut.calculateColumnWidths();

      expect(sut.model.columnWidths.length).toBe(1);
      expect(sut.model.columnWidths[0]).toStrictEqual({
        name: blotterColumns[0].name,
        width: 60,
      });
    });

    it("loadExportData should invoke getBlotterData", async () => {
      let getblotterdatamock = jest.spyOn(sut, "getBlotterData");

      let queryState = { ...sut.model.state };

      sut.model.totalServerCountBeforeTransform = 3;

      await sut.loadExportData();

      expect(getblotterdatamock).toBeCalledWith(expect.objectContaining(queryState), 0, 3, []);

      expect(sut.model.exportItems.length).toBe(4);
    });

    it("loadExportData should invoke getBlotterData twice", async () => {
      let getblotterdatamock = jest.spyOn(sut, "getBlotterData");

      sut.model.totalServerCountBeforeTransform = 20001;

      await sut.loadExportData();

      expect(getblotterdatamock).toBeCalledTimes(2);
    });

    it("get editor types from column type", async () => {
      expect(sut.getEditorType(DataTypes.boolean)).toBe("boolean");
      expect(sut.getEditorType(DataTypes.complexObject)).toBe(undefined);
      expect(sut.getEditorType(DataTypes.date)).toBe("date");
      expect(sut.getEditorType(DataTypes.dateTime)).toBe("date");
      expect(sut.getEditorType(DataTypes.enum)).toBe("text");
      expect(sut.getEditorType(DataTypes.int)).toBe("numeric");
      expect(sut.getEditorType(DataTypes.list)).toBe(undefined);
      expect(sut.getEditorType(DataTypes.long)).toBe("numeric");
      expect(sut.getEditorType(DataTypes.number)).toBe("numeric");
      expect(sut.getEditorType(DataTypes.numeric)).toBe("numeric");
      expect(sut.getEditorType(DataTypes.string)).toBe("text");
    });

    it("use transformer to alter data", async () => {
      const transformer = {
        getBlotterData: jest.fn(),
        getDatasetDefinition: jest.fn(),
      };
      sut.transformer = transformer;
      await sut.initialize();
      expect(sut.transformer.getBlotterData).toBeCalled();
      expect(sut.transformer.getDatasetDefinition).toBeCalled();
    });

    it("onHeaderSelectionChanged should select data", async () => {
      await sut.initialize();
      let selectionChanged = false;
      sut.model.onSelectionUpdate().subscribe(()=>{selectionChanged = true})
      sut.onHeaderSelectionChanged(true);
      
      expect(selectionChanged).toBe(true);
      
    });

    it("getActiveDetailColumns", async () => {
      sut.detailDatasetDefinition = {
        id: "2",
        name: "dummy",
        collectionNameOverride: "override",
        description: "desc",
        columns: [blotterColumns[0]],
        hasPermission: true,
        hasFeature: true,
        loaded: true,
        columnNames: [],
        defaultParameters: {},
      };

      sut.model.configuration.detailColumnConfigs = [
        {
          name: "bookId",
          hidden: false,
        },
      ];

      const columns = sut.getActiveDetailColumns();

      expect(columns).not.toBeNull();
      expect(columns.length).toBe(1);
    });
  });
});
