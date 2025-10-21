// reflect-metadata is required for IOC
import "reflect-metadata";
import React, { LegacyRef, useRef } from "react";
import { cleanup, screen, fireEvent, render, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { createMock } from "ts-auto-mock";
import { BlotterView, IBlotter, BlotterModel, IBlotterToolbar, BlotterToolbarModel, SelectionSettings, DataTypes, IDatasetDefinition, SelectionMode, GridOperationModes, Helpers, BlotterColumnDefinition, ListFilterDataProvider, BlotterToolbar, IDatasetView, BlotterTreeView } from "..";

import { hostComponent, arrange, arrangeViewModel, stubComponent, clearStubs } from "../../../../testing";
import { CoreTypes, IContainer, IViewResolver } from "@kinetix/core";
import { ContextMenuModel, IBlotterContextMenu } from "./ContextMenu/BlotterContextMenuViewModel";
import userEvent from "@testing-library/user-event";
import { Button } from "@progress/kendo-react-buttons";
import { GridPDFExport } from "@progress/kendo-react-pdf";
import { Grid, GridColumnReorderEvent, GridColumnResizeEvent, GridHandle, GridKeyDownEvent, GridSelectionChangeEvent } from "@progress/kendo-react-grid";
import { getSelectedState, getSelectedStateFromKeyDown } from "@progress/kendo-react-data-tools";
import { DATA_ITEM_KEY, EXPANDED_ROW } from "./Utils/constants";

// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped module
  let mockBlotter: IBlotter;
  let mockToolbar: IBlotterToolbar;
  let mockViewResolver: IViewResolver;
  let mockContextMenu: IBlotterContextMenu;
  let mockContainer: IContainer;
  let blotterColumns: BlotterColumnDefinition[];

  beforeEach(() => {
    //assetClass - enum,name -string,id -int,date - date,valid - boolean
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
        possibleValues: [
          { displayName: "assetClassValue1", value: "assetClassValue1" },
          { displayName: "assetClassValue2", value: "assetClassValue2" },
        ],
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
        name: "id",
        displayName: "id",
        displayField: "id",
        order: 3,
        type: DataTypes.int,
        field: "id",
        objectName: "id",
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

    mockContainer = createMock<IContainer>();

    Object.assign(window.navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      },
    });

    mockBlotter = createMock<IBlotter>({ model: new BlotterModel() });

    blotterColumns.forEach((x) => {
      x.filterProvider = new ListFilterDataProvider(mockBlotter, x);
      x.filterProvider.initialize();
    });

    mockToolbar = createMock<IBlotterToolbar>({
      model: new BlotterToolbarModel(),
    });

    mockContextMenu = createMock<IBlotterContextMenu>({
      model: new ContextMenuModel(),
    });

    //mockContextMenu.mockProperty("Menus", () => []);
    //mockContextMenu.instance.onDoubleClick = jest.fn();
    //mockContextMenu.instance.onContextMenu = jest.fn();

    arrange(mockToolbar).stubMethod("isActive", () => false);

    const selectionSettings = new SelectionSettings();

    selectionSettings.enabled = true;
    selectionSettings.cell = false;
    selectionSettings.headerSelection = false;
    selectionSettings.mode = SelectionMode.Multiple;
    mockBlotter.model.columns = blotterColumns;
    mockBlotter.model.detailColumns = blotterColumns;
    
    arrangeViewModel(mockBlotter)
      .stubProperty("toolbar", () => mockToolbar)
      .acceptModelChanges()
      .acceptViewChanges()
      .stubProperty("contextMenu", () => mockContextMenu)
      .stubProperty("selectionSettings", () => selectionSettings)
      .stubProperty("datasetView", () => {
        return {
          parentDatasetView: "",
          datasetID: "testdatasetID",
          datasetViewType: "string",
          name: "testName",
          columns: blotterColumns.map((x) => {
            return {
              name: x.name,
              format: "",
              hidden: false,
              type: x.type,
            };
          }),
          userId: "testUser",
          id: "testId",
        };
      })
      .stubProperty("draggable", () => {
        return { enable: true, reorder: jest.fn(), activeDragItem: undefined, dragEnd: jest.fn() };
      })
      .stubProperty("datasetDefinition", () => {
        return {
          id: "1",
          name: "dummy",
          collectionNameOverride: "override",
          description: "desc",
          columns: blotterColumns,
          hasPermission: true,
          hasFeature: true,
          loaded: true,
          columnNames: blotterColumns.map((x) => x.name),
          defaultParameters: {},
        };
      })

      .stubMethod("loadExportData", () => {})
      .stubProperty("detailDatasetView", () => {
        return {
          parentDatasetView: "",
          datasetID: "testdetaildatasetID",
          datasetViewType: "string",
          name: "testName",
          columns: blotterColumns.map((x) => {
            return {
              name: x.name,
              format: "",
              hidden: false,
              type: x.type,
            };
          }),
          userId: "testUser",
          id: "testId",
        };
      })
      .stubProperty("detailDatasetDefinition", () => {
        return {
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
        };
      });

    mockViewResolver = createMock<IViewResolver>();

    arrange(mockContainer).stubMethod("build", () => mockViewResolver, [CoreTypes.IViewResolver]);

    arrange(mockViewResolver).stubMethod("renderInstance", (vm, child, props) => {
      return (
        <div>
          <Button onClick={props.exportExcelHandler}>EXPORT-EXCEL</Button>
          <Button onClick={props.exportPdfHandler}>EXPORT-PDF</Button>
          {/* <BlotterToolbar dataContext={vm as IBlotterToolbar} {...props}/> */}
        </div>
      );
    });

    mockBlotter.model.showToolbar = true;
    mockBlotter.model.configuration.disableGrouping = false;
    mockBlotter.model.primaryKeys = ["id"];
    mockBlotter.model.state = {
      filter: { logic: "and", filters: [] },
      skip: 0,
      take: 20,
      group: [{field:'date'}],
    };

    // //assetClass - enum,name -string,id -int,date - date,valid - boolean
    mockBlotter.model.items = [
      { assetClass: "assetClassValue1", id: "1", name: "name1", date: "26/10/2023", valid: true },
      { assetClass: "assetClassValue2", id: "2", name: "name2", date: "26/10/2023", valid: false },
    ];
    mockBlotter.model.detailItems[0] = [
      { assetClass: "assetClassValue1", id: "1", name: "name1", [DATA_ITEM_KEY]: "1", date: "26/10/2023", valid: true },
      { assetClass: "assetClassValue2", id: "2", name: "name2", [DATA_ITEM_KEY]: "2", date: "26/10/2023", valid: false },
    ];
    
    mockBlotter.model.columnWidths = blotterColumns.map((x) => {
      return { name: x.name, width: 120 };
    });

    mockBlotter.model.totalServerCount = 20;

    // JSDom does not implement this and an error was being
    // thrown from tests because of it.
  });

  // Note: running cleanup afterEach is done automatically for you in @testing-library/react@9.0.0 or higher
  // unmount and cleanup DOM after the test is finished.

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
    clearStubs();
  });

  // Testing Component
  describe("Blotter View", () => {
    // TEST:  Kinetix Monza Core > BlotterView > component should be created without style attribute
    it("Render blotter loading panel", async () => {
      arrange(mockBlotter).stubProperty("datasetDefinition", () => createMock<IDatasetDefinition>());

      let sut = hostComponent(<BlotterTreeView dataContext={mockBlotter} />, mockContainer);
      const view = render(sut);
      // uncomment to see the html code
      //screen.debug();

      // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
      let loadingPanel = view.container.getElementsByClassName("loading-panel");

      //fireEvent.click(button);
      expect(view).not.toBeNull();
      expect(loadingPanel).not.toBeNull();
    });

    it("Render blotter when data def is available", async () => {
      mockBlotter.model.configuration.settings.gridMode = GridOperationModes.Client;

      let sut = hostComponent(<BlotterTreeView expandIcons={true} checkboxes={true} dataContext={mockBlotter} />, mockContainer);
      const view = render(sut);

      mockBlotter.model.checkedState = [];
      console.debug(mockBlotter.model.checkedState);
      // uncomment to see the html code
      //screen.debug();
      const rows = screen.getAllByRole("tree");

      // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container

      //fireEvent.click(button);

      await waitFor(() => {
        let nodeText = view.container.getElementsByClassName("k-treeview-leaf-text");
        expect(view).not.toBeNull();
        
        expect(nodeText).not.toBeNull();
        expect(rows.length).toBe(1);
        // select
        const parentNode =  screen.getByText("26/10/2023");
        fireEvent.click(parentNode);

        //context menu 
        fireEvent.contextMenu(parentNode);
         //expand
        let expandIcon = view.container.getElementsByClassName("k-treeview-toggle");
        fireEvent.click(expandIcon[0]);

        //checkbox

        let checkbox = view.container.getElementsByClassName("k-checkbox");
        fireEvent.click(checkbox[0]);
        
        //k-treeview-toggle
       
        
      });
    });

    it("Render server mode blotter", async () => {
      mockBlotter.model.configuration.settings.gridMode = GridOperationModes.Server;

      let sut = hostComponent(<BlotterTreeView dataContext={mockBlotter} />, mockContainer);

      const view = render(sut);

      const rows = screen.getAllByRole("tree");
      // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container

      expect(view).not.toBeNull();
      expect(rows.length).toBe(1); // header + 2 rows
      expect(mockBlotter.model.totalServerCount).toBe(20);
    });

    

    it.skip("Blotter context menu should call context menu service", async () => {
      let sut = hostComponent(<BlotterTreeView dataContext={mockBlotter} />, mockContainer);
      const view = render(sut);
      // uncomment to see the html code

      const rows = screen.getAllByRole("k-treeview-group");

      //right click second row with shift
      fireEvent.contextMenu(rows[0]);

      //screen.debug();

      //fireEvent.click(button);
      expect(view).not.toBeNull();
      expect(rows.length).toBe(1); // header + 2 rows
      await waitFor(() => {
        expect(mockContextMenu.onContextMenu).toBeCalled();
      });
    });

  
  });
});
