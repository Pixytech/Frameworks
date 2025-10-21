// reflect-metadata is required for IOC
import "reflect-metadata";
import React, { LegacyRef, useRef } from "react";
import { cleanup, screen, fireEvent, render, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { createMock } from "ts-auto-mock";
import { BlotterView, IBlotter, BlotterModel, IBlotterToolbar, BlotterToolbarModel, SelectionSettings, DataTypes, IDatasetDefinition, SelectionMode, GridOperationModes, Helpers, BlotterColumnDefinition, ListFilterDataProvider, BlotterToolbar, IDatasetView } from "..";

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

    // //assetClass - enum,name -string,id -int,date - date,valid - boolean
    mockBlotter.model.items = [
      { assetClass: "assetClassValue1", id: "1", name: "name1", date: "26/10/2023", valid: true },
      { assetClass: "assetClassValue2", id: "2", name: "name2", date: "26/10/2023", valid: false },
    ];
    mockBlotter.model.detailItems[0] = [
      { assetClass: "assetClassValue1", id: "1", name: "name1", [DATA_ITEM_KEY]: "1", date: "26/10/2023", valid: true },
      { assetClass: "assetClassValue2", id: "2", name: "name2", [DATA_ITEM_KEY]: "2", date: "26/10/2023", valid: false },
    ];
    mockBlotter.model.state = {
      filter: { logic: "and", filters: [] },
      skip: 0,
      take: 20,
      group: [],
    };

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

      let sut = hostComponent(<BlotterView dataContext={mockBlotter} />, mockContainer);
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
      let sut = hostComponent(<BlotterView dataContext={mockBlotter} />, mockContainer);
      const view = render(sut);
      // uncomment to see the html code
      //screen.debug();
      const rows = screen.getAllByRole("row");

      // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container

      //fireEvent.click(button);

      await waitFor(() => {
        let reorderIcon = view.container.getElementsByClassName("k-i-reorder");
        expect(view).not.toBeNull();
        expect(reorderIcon).not.toBeNull();
        expect(rows.length).toBe(3); // header + 2 rows
      });
    });

    it("Render server mode blotter", async () => {
      mockBlotter.model.configuration.settings.gridMode = GridOperationModes.Server;

      let sut = hostComponent(<BlotterView dataContext={mockBlotter} />, mockContainer);

      const view = render(sut);

      const rows = screen.getAllByRole("row");
      // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container

      expect(view).not.toBeNull();
      expect(rows.length).toBe(3); // header + 2 rows
      expect(mockBlotter.model.totalServerCount).toBe(20);
    });

    // we have currently disabled hiding of page numbers
    it.skip("Hide page numbers", async () => {
      mockBlotter.model.configuration.settings.gridMode = GridOperationModes.Server;

      mockBlotter.model.state.skip = 2000;
      mockBlotter.model.state.take = 20;

      let sut = hostComponent(<BlotterView dataContext={mockBlotter} />, mockContainer);

      const view = render(sut);

      const gridClassName = view.container.getElementsByClassName("blotter-grid-hide-pager-numbers");
      expect(gridClassName.length).toBe(1);
    });

    it("Show page numbers", async () => {
      mockBlotter.model.configuration.settings.gridMode = GridOperationModes.Server;

      mockBlotter.model.state.skip = 20;
      mockBlotter.model.state.take = 20;

      let sut = hostComponent(<BlotterView dataContext={mockBlotter} />, mockContainer);

      const view = render(sut);

      const gridClassName = view.container.getElementsByClassName("blotter-grid-hide-pager-numbers");
      expect(gridClassName.length).toBe(0);
    });

    it("Blotter context menu should call context menu service", async () => {
      let sut = hostComponent(<BlotterView dataContext={mockBlotter} />, mockContainer);
      const view = render(sut);
      // uncomment to see the html code

      const rows = screen.getAllByRole("row");

      //right click second row with shift
      fireEvent.contextMenu(rows[1]);

      //screen.debug();

      //fireEvent.click(button);
      expect(view).not.toBeNull();
      expect(rows.length).toBe(3); // header + 2 rows
      await waitFor(() => {
        expect(mockContextMenu.onContextMenu).toBeCalled();
      });
    });

    it("Context menu shift select should select records", async () => {
      let sut = hostComponent(<BlotterView dataContext={mockBlotter} />, mockContainer);
      const view = render(sut);
      // uncomment to see the html code

      const rows = screen.getAllByRole("row");

      //fireEvent.click(rows[1])
      fireEvent.contextMenu(rows[1]);

      fireEvent.contextMenu(rows[2], { shiftKey: true });

      //screen.debug();

      //fireEvent.click(button);
      await waitFor(() => {
        expect(view).not.toBeNull();
        expect(rows.length).toBe(3); // header + 2 rows
        expect(mockBlotter.updateModel).toBeCalled();
        expect(mockContextMenu.onContextMenu).toBeCalled();
        expect(mockBlotter.model.selectedState["1"]).toBe(true);
        expect(mockBlotter.model.selectedState["2"]).toBe(true);
      });
    });

    it("Selection change on row click - Stubbed", async () => {
      // although we should not use this approach but its better then nothing and should be refactored when skiped tests worked
      const mockGrid = stubComponent<typeof Grid>("Grid", "@progress/kendo-react-grid");

      const mockGetSelectedState = stubComponent<typeof getSelectedState>("getSelectedState", "@progress/kendo-react-data-tools", () => {
        return { "1": true };
      });

      let sut = hostComponent(<BlotterView dataContext={mockBlotter} />, mockContainer);
      const view = render(sut);
      const gridProps = mockGrid.mock.calls[0][0];

      if (gridProps.onSelectionChange) {
        gridProps.onSelectionChange({} as GridSelectionChangeEvent);
      }

      expect(mockBlotter.model.selectedState["1"]).toBe(true);
      expect(mockBlotter.updateModel).toBeCalled();
    });

    it.skip("DISABLED Detail selection change on row click - Stubbed", async () => {
      mockBlotter.model.items = mockBlotter.model.items.map((item) => ({
        ...item,
        [EXPANDED_ROW]: true,
      }));

      const gridRef: LegacyRef<GridHandle> = React.createRef<GridHandle>();
      let sut = hostComponent(<BlotterView ref={gridRef} dataContext={mockBlotter} />, mockContainer);
      const view = render(sut);
      //const gridProps = mockGrid.mock.calls[2][0];
      if (gridRef && gridRef.current) {
        const gridProps = gridRef.current.props;
        if (gridProps.onSelectionChange) {
          gridProps.onSelectionChange({} as GridSelectionChangeEvent);
        }

        await waitFor(() => {
          expect(mockBlotter.model.detailSelectedState[0]["1"]).toBe(true);
          expect(mockBlotter.updateModel).toBeCalled();
        });
      }
    });

    it.skip("DISABLED Selection change on row click", async () => {
      let sut = hostComponent(<BlotterView dataContext={mockBlotter} />, mockContainer);
      const view = render(sut);
      // uncomment to see the html code

      const cells = screen.getAllByRole("gridcell");

      const row1 = cells[0];
      //const row2 = cells[3];

      //TODO : validate selection change
      //fireEvent.click(rows[1])
      fireEvent.click(row1);
      //screen.debug();
      //console.debug(mockBlotter.instance.model);
      //expect(mockBlotter.instance.model.selectedState["1"]).toBe(true);
      //expect(mockBlotter.instance.model.selectedState["2"]).toBe(false);

      //fireEvent.click(row2);
      // console.log(mockBlotter.instance.model);
      //expect(mockBlotter.instance.model.selectedState["1"]).toBe(false);
      //expect(mockBlotter.instance.model.selectedState["2"]).toBe(true);
    });

    it.skip("DISABLED Selection change on keyDown", async () => {
      let sut = hostComponent(<BlotterView dataContext={mockBlotter} />, mockContainer);
      const view = render(sut);
      //TODO : this is broken feature possibliy becuase of custom cell rendering
      // uncomment to see the html code

      const cells = screen.getAllByRole("gridcell");

      const row1 = cells[0];
      const row2 = cells[3];
      fireEvent.click(row2);
      fireEvent.keyPress(row2, { key: "ArrowUp", which: 38, keyCode: 38 });
      //screen.debug();
      //console.debug(mockBlotter.instance.model);
      //expect(mockBlotter.instance.model.selectedState["1"]).toBe(true);
      //expect(mockBlotter.instance.model.selectedState["2"]).toBe(false);

      //fireEvent.click(row2);
      // console.log(mockBlotter.instance.model);
      //expect(mockBlotter.instance.model.selectedState["1"]).toBe(false);
      //expect(mockBlotter.instance.model.selectedState["2"]).toBe(true);
    });

    it("Selection change on keyDown - stubbed", async () => {
      // although we should not use this approach but its better than nothing and should be refactored when skiped tests worked
      const mockGrid = stubComponent<typeof Grid>("Grid", "@progress/kendo-react-grid");
      Helpers.jsonToFlatternText = jest.fn();
      const mockGetSelectedStateFromKeyDown = stubComponent<typeof getSelectedStateFromKeyDown>("getSelectedStateFromKeyDown", "@progress/kendo-react-data-tools", () => {
        return { "1": true };
      });

      let sut = hostComponent(<BlotterView dataContext={mockBlotter} />, mockContainer);
      const view = render(sut);
      const gridProps = mockGrid.mock.calls[0][0];

      if (gridProps.onKeyDown) {
        gridProps.onKeyDown({
          nativeEvent: { ctrlKey: true, metaKey: false, keyCode: 67 },
        } as any as GridKeyDownEvent);
      }

      await waitFor(() => {
        expect(mockBlotter.model.selectedState["1"]).toBe(true);
        expect(mockBlotter.updateModel).toBeCalled();
        expect(Helpers.jsonToFlatternText).toBeCalled();
      });
    });

    it("Show hidden toolbar on shortcut", async () => {
      // although we should not use this approach but its better than nothing and should be refactored when skiped tests worked
      arrange(mockBlotter).stubProperty("datasetView", () => createMock<IDatasetView>({ name: "-testName" }));
      mockBlotter.model.showToolbar = false;
      let sut = hostComponent(<BlotterView dataContext={mockBlotter} />, mockContainer);

      const view = render(sut);

      const blotterRoot = screen.getByTestId(`blotter-${mockBlotter.datasetView.name}`);
      fireEvent.keyDown(blotterRoot, { key: "Enter", code: 13 });

      expect(mockBlotter.showOptions).toBeCalled();
    });

    it("Header selection should select all records", async () => {
      mockBlotter.selectionSettings.headerSelection = true;

      let sut = hostComponent(<BlotterView dataContext={mockBlotter} />, mockContainer);
      const view = render(sut);
      // uncomment to see the html code

      const headers = screen.getAllByRole("columnheader");
      fireEvent.click(headers[1].childNodes[0]);

      //screen.debug();

      //fireEvent.click(button);
      expect(view).not.toBeNull();

      expect(mockBlotter.onHeaderSelectionChanged).toBeCalledWith(true);
    });

    it("Open detail blotter", async () => {
      mockBlotter.model.items = mockBlotter.model.items.map((item) => ({
        ...item,
        [EXPANDED_ROW]: true,
      }));

      let sut = hostComponent(<BlotterView dataContext={mockBlotter} />, mockContainer);
      const view = render(sut);

      const grids = screen.getAllByRole("grid");

      expect(grids[1].classList).toContain("k-grid-aria-root");
    });

    it("Detail blotter context menu should call context menu service", async () => {
      mockBlotter.model.items = mockBlotter.model.items.map((item) => ({
        ...item,
        [EXPANDED_ROW]: true,
      }));

      let sut = hostComponent(<BlotterView dataContext={mockBlotter} />, mockContainer);
      const view = render(sut);
      // uncomment to see the html code

      const rows = screen.getAllByRole("row");

      //right click detail row
      fireEvent.contextMenu(rows[4]);

      //screen.debug();

      expect(view).not.toBeNull();
      expect(rows.length).toBe(8);
      await waitFor(() => {
        expect(mockContextMenu.onContextMenu).toBeCalled();
      });
    });

    it("On sort update the state change", async () => {
      let sut = hostComponent(<BlotterView dataContext={mockBlotter} />, mockContainer);
      const view = render(sut);
      // uncomment to see the html code

      const columnHeader = screen.queryByText("Asset");

      expect(columnHeader).not.toBeNull();
      fireEvent.click(columnHeader as HTMLElement);

      expect(mockBlotter.sortChange).toBeCalledTimes(1);
    });

    it.skip("DISABLED On column reorder state change", async () => {
      //https://www.telerik.com/forums/pragmatically-reorder-columns-react-testing-library
      let sut = hostComponent(<BlotterView dataContext={mockBlotter} />, mockContainer);
      const view = render(sut);
      //screen.debug();
      const user = userEvent.setup();
      const columnAsset = screen.getByText("Asset") as HTMLElement;
      const columnName = screen.getByText("Name") as HTMLElement;
      const getTableRows = () => screen.getAllByRole("row");
      const getColumnHeaders = () => getTableRows()[0].children;

      expect(columnAsset).not.toBeNull(); // it exist
      expect(columnName).not.toBeNull(); // it exist

      let headerCols = getColumnHeaders();

      // double check that original order is in place before we drag and drop
      expect(headerCols[0].textContent).toEqual("Asset");
      expect(headerCols[1].textContent).toEqual("Name");

      let counter = 0;
      // mock this function that Kendo React Grid uses to determine focused column
      document.elementFromPoint = jest.fn((x, y) => {
        const el = counter >= 1 ? columnName : columnAsset;
        counter++;

        return el;
      });

      // Move name column before Asset column
      fireEvent.mouseEnter(columnName);
      fireEvent.mouseOver(columnName);
      fireEvent.mouseMove(columnName);
      fireEvent.mouseDown(columnName);
      //await waitFor(() => expect(el).toHaveStyle(``))
      fireEvent.mouseMove(columnAsset);

      fireEvent.mouseUp(columnAsset);

      /*      await user.pointer([
        // Press the primary mouse button at offset 1
        {
          keys: "[MouseLeft>]",
          target:columnName
        },
        // Select the second digit by moving the mouse to offset 2
        { target:columnAsset },
        // Optional: release the primary mouse button
        "[/MouseLeft]",
      ]); */

      //screen.debug();
      //todo: handle column reorder
      //expect(mockBlotter.handleGridColumnReorder).toBeCalledTimes(1);
    });

    it("On column reorder state change - stubbed", async () => {
      // although we should not use this approach but its better than nothing and should be refactored when skiped tests worked
      const mockGrid = stubComponent<typeof Grid>("Grid", "@progress/kendo-react-grid");

      const mockGetSelectedState = stubComponent<typeof getSelectedState>("getSelectedState", "@progress/kendo-react-data-tools", () => {
        return { "1": true };
      });

      let sut = hostComponent(<BlotterView dataContext={mockBlotter} />, mockContainer);
      const view = render(sut);
      const gridProps = mockGrid.mock.calls[0][0];

      if (gridProps.onColumnReorder) {
        gridProps.onColumnReorder({
          columns: [
            { name: "assetClass", orderIndex: 1 },
            { name: "name", orderIndex: 1 },
          ],
        } as unknown as GridColumnReorderEvent);
      }

      expect(mockBlotter.handleGridColumnReorder).toBeCalled();
    });

    it.skip("DISABLED On column resize state change", async () => {
      let sut = hostComponent(<BlotterView dataContext={mockBlotter} />, mockContainer);
      const view = render(sut);
      // uncomment to see the html code
      // uncomment to see the html code

      const user = userEvent.setup();
      const resizers =
        // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
        view.container.getElementsByClassName("k-column-resizer");

      const colResizer = resizers[0];
      expect(colResizer).not.toBeNull(); // it exist

      const columnAsset = screen.getByText("Asset") as HTMLElement;
      const columnName = screen.getByText("Name") as HTMLElement;
      let counter = 0;
      // mock this function that Kendo React Grid uses to determine focused column
      document.elementFromPoint = jest.fn((x, y) => {
        const el = counter >= 1 ? columnName : columnAsset;
        counter++;

        return el;
      });

      await user.pointer([
        // Press the primary mouse button at offset 1
        {
          keys: "[MouseLeft>]",
          target: colResizer,
        },
        // Select the second digit by moving the mouse to offset 2
        { coords: { clientX: 150, clientY: 10 } },
        // Optional: release the primary mouse button
        "[/MouseLeft]",
      ]);

      //screen.debug();
      //todo: handle column resize
      expect(mockBlotter.handleGridColumnResize).toBeCalledTimes(0);
    });

    it("on column resize state change - stubbed", async () => {
      // although we should not use this approach but its better than nothing and should be refactored when skiped tests worked
      const mockGrid = stubComponent<typeof Grid>("Grid", "@progress/kendo-react-grid");

      const mockGetSelectedState = stubComponent<typeof getSelectedState>("getSelectedState", "@progress/kendo-react-data-tools", () => {
        return { "1": true };
      });

      let sut = hostComponent(<BlotterView dataContext={mockBlotter} />, mockContainer);
      const view = render(sut);
      const gridProps = mockGrid.mock.calls[0][0];

      if (gridProps.onColumnResize) {
        gridProps.onColumnResize({
          end: true,
          newWidth: 100,
          index: 1,
          columns: [
            { name: "assetClass", orderIndex: 1 },
            { name: "name", orderIndex: 1 },
          ],
        } as unknown as GridColumnResizeEvent);
      }

      expect(mockBlotter.handleGridColumnResize).toBeCalled();
    });

    it("Column context menu filters", async () => {
      mockBlotter.model.columnFilters = true;
      mockBlotter.model.sortable = true;
      let sut = hostComponent(<BlotterView dataContext={mockBlotter} />, mockContainer);
      const view = render(sut);
      // uncomment to see the html code
      // uncomment to see the html code

      // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
      const columnMenus = Array.from(view.container.getElementsByClassName("k-icon k-svg-icon k-svg-i-more-vertical"));

      columnMenus.forEach((columnMenu) => {
        act(() => {
          fireEvent.click(columnMenu);
        });

        const shortingOptions = screen.getAllByText("Sort Ascending");
        const filterOptions = screen.getAllByText("Filter");

        shortingOptions.forEach((element) => {
          expect(element).toBeInTheDocument();
        });

        filterOptions.forEach((element) => {
          expect(element).toBeInTheDocument();
        });
      });
    });

    it("Render Row filters  filters", async () => {
      mockBlotter.model.quickFilters = true;
      mockBlotter.model.columnFilters = false;
      mockBlotter.model.sortable = false;

      let sut = hostComponent(<BlotterView dataContext={mockBlotter} />, mockContainer);
      const view = render(sut);
      // uncomment to see the html code
      // uncomment to see the html code

      // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
      //screen.debug();
    });

    it("Client mode when grouped show group count", async () => {
      mockBlotter.model.configuration.settings.gridMode = GridOperationModes.Client;
      mockBlotter.model.state = {
        filter: { logic: "and", filters: [] },
        skip: 0,
        take: 20,
        group: [
          {
            field: "name",
            aggregates: [],
          },
        ],
      };

      let sut = hostComponent(<BlotterView dataContext={mockBlotter} />, mockContainer);
      const view = render(sut);
      // uncomment to see the html code

      // screen.debug(screen.getAllByRole("grid"), 10000);
      // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
      // const headers = screen.getAllByRole("groupHeader");

      const groupedHeader = screen.getAllByTestId("group-header");

      expect(groupedHeader.length).toBe(2);
      // todo validate group count

      //fireEvent.click(button);
      expect(view).not.toBeNull();
      //TODO : Validate group count
      // expect(mockBlotter.instance.model.selectedState["1"]).toBe(true);
      // expect(mockBlotter.instance.model.selectedState["2"]).toBe(true);
    });

    it("Client mode expand Grouped Data", async () => {
      mockBlotter.model.configuration.settings.gridMode = GridOperationModes.Client;
      mockBlotter.model.state = {
        filter: { logic: "and", filters: [] },
        skip: 0,
        take: 20,
        group: [
          {
            field: "name",
            aggregates: [],
          },
        ],
      };

      let sut = hostComponent(<BlotterView dataContext={mockBlotter} />, mockContainer);
      const view = render(sut);
      // uncomment to see the html code

      //screen.debug();
      // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
      // const headers = screen.getAllByRole("groupHeader");

      // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
      const groupedHeader = view.container.querySelector(`a[aria-label="Collapse Group"]`);
      if (groupedHeader != null) {
        fireEvent.click(groupedHeader);
      }

      expect(mockBlotter.handleGridExpandChange).toBeCalledTimes(1);
    });

    it("Client mode  Grouped cell custom template", async () => {
      mockBlotter.model.configuration.settings.gridMode = GridOperationModes.Client;
      mockBlotter.model.state = {
        filter: { logic: "and", filters: [] },
        skip: 0,
        take: 20,
        group: [
          {
            field: "name",
            aggregates: [],
          },
        ],
      };

      mockBlotter.model.items = [
        { assetClass: "assetClassValue1", id: "1", date: "26/10/2023", valid: true },
        { assetClass: "assetClassValue2", id: "2", date: "26/10/2023", valid: false },
      ];

      let sut = hostComponent(<BlotterView dataContext={mockBlotter} missingCellTemplate={(e) => <span>SOME-DATA-Is-Missing</span>} />, mockContainer);
      const view = render(sut);
      expect(screen.getAllByText("SOME-DATA-Is-Missing").length).toBeGreaterThan(0);
    });

    it("Filtered Column", async () => {
      mockBlotter.model.state = {
        filter: {
          logic: "and",
          filters: [{ field: "name", operator: "startswith", value: "name1" }],
        },
        skip: 0,
        take: 20,
      };

      let sut = hostComponent(<BlotterView dataContext={mockBlotter} />, mockContainer);
      const view = render(sut);
      // uncomment to see the html code

      //    screen.debug();
      // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
      // const headers = screen.getAllByRole("groupHeader");

      // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
      const groupedHeader = view.container.getElementsByClassName("column-header filtered");

      expect(groupedHeader).not.toBeNull();
    });

    it("Row double click", async () => {
      let sut = hostComponent(<BlotterView dataContext={mockBlotter} />, mockContainer);
      const view = render(sut);
      const rowCell = screen.queryByText("name1") as HTMLElement;

      // uncomment to see the html code

      fireEvent.doubleClick(rowCell);

      expect(mockContextMenu.onDoubleClick).toBeCalled();
    });

    it("Export to excel", async () => {
      let sut = hostComponent(<BlotterView dataContext={mockBlotter} />, mockContainer);
      render(sut);
      const exportButton = screen.getByRole("button", { name: "EXPORT-EXCEL" });

      fireEvent.click(exportButton);

      expect(mockBlotter.updateModel).toBeCalled();
    });

    it("Export to Pdf", async () => {
      GridPDFExport.prototype.save = jest.fn((data, callback) => {
        if (callback) callback();
      });

      let sut = hostComponent(<BlotterView dataContext={mockBlotter} />, mockContainer);
      render(sut);
      const exportButton = screen.getByRole("button", { name: "EXPORT-PDF" });

      fireEvent.click(exportButton);
      expect(GridPDFExport.prototype.save).toBeCalled();
    });

    it("Export to Pdf when error", async () => {
      GridPDFExport.prototype.save = jest.fn((data, callback) => {
        throw new Error("Error exporting ");
      });

      let sut = hostComponent(<BlotterView dataContext={mockBlotter} />, mockContainer);
      render(sut);
      const exportButton = screen.getByRole("button", { name: "EXPORT-PDF" });

      fireEvent.click(exportButton);
      expect(GridPDFExport.prototype.save).toBeCalled();
    });

    it("Editable blotter", async () => {
      mockBlotter.model.editable = true;
      mockBlotter.model.columns = mockBlotter.model.columns.map((i, index) => {
        return { ...i, editable: index == 0 };
      });
      mockBlotter.model.items = mockBlotter.model.items.map((i) => {
        return { ...i, inEdit: true };
      });
      let sut = hostComponent(
        <BlotterView
          dataContext={mockBlotter}
          columns={[
            {
              field: "assetClass",
            },
            {
              field: "newColumnFromProps",
            },
          ]}
        />,
        mockContainer
      );
      render(sut);
      // uncomment to see the html code
      const cell1 = screen.getByDisplayValue("assetClassValue1");
      fireEvent.change(cell1, { target: { value: "new value" } });

      await waitFor(() => {
        expect(mockBlotter.handleOnItemChange).toBeCalled();
      });
    });
  });
});
