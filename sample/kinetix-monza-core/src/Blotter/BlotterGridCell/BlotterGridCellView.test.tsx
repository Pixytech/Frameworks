// reflect-metadata is required for IOC
import "reflect-metadata";
import React from "react";
import { cleanup, screen, render } from "@testing-library/react";

import { BlotterGridCustomCellView } from "./BlotterGridCellView";

import "@testing-library/jest-dom";
import { GridCellProps, GridCustomCellProps } from "@progress/kendo-react-grid";
import { IBlotterConfiguration, IBlotterContext, BlotterModel, GridOperationModes } from "..";
import { DataTypes } from "../../Data";

// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped module
  let colDef = {
    name: "test",
    displayName: "test",
    displayField: "test",
    order: 0,
    type: DataTypes.string,
    field: "test",
    objectName: "test",
    groupable: false,
    aggregable: false,
    useAsParameter: false,
    isArray: false,
    sortable: false,
    allowMultipleValues: false,
    forceUTC: false,
    primaryDisplayName: false,
    defaultColumn: false,
    nested: false,
    possibleValues: [],
    enumType: "string",
    alternativeFields: [],
  };
  let colDefList = {
    name: "test1",
    displayName: "test1",
    displayField: "test1",
    order: 0,
    type: DataTypes.list,
    field: "test1",
    objectName: "test1",
    groupable: false,
    aggregable: false,
    useAsParameter: false,
    isArray: false,
    sortable: false,
    allowMultipleValues: false,
    forceUTC: false,
    primaryDisplayName: false,
    defaultColumn: false,
    nested: false,
    possibleValues: [],
    enumType: "string",
    alternativeFields: [],
  };
  let colConfig = {
    name: "test",
    hidden: false,
    order: 0,
    width: 70,
  };
  let colEnumDef = {
    ...colDef,
    name: "testEnum",
    type: DataTypes.enum,
    field: "testEnum",
  };
  let colEnumConfig = {
    name: "testEnum",
    hidden: false,
    order: 1,
    width: 70,
  };
  let configItem: IBlotterConfiguration;
  let blotterContext: IBlotterContext;

  beforeEach(() => {
    blotterContext = {
      model: new BlotterModel(),
      datasetDefinition: {
        id: "defid",
        name: "dataset",
        collectionNameOverride: "No",
        description: "desc",
        columns: [colDef, colEnumDef, colDefList],
        hasPermission: true,
        hasFeature: true,
        loaded: true,
        columnNames: [],
        defaultParameters: {},
      },
    };
    configItem = {
      settings: {
        gridMode: GridOperationModes.Client,
        pageSize: 100,
        allowGrouping: false,
        exportSize: 100,
      },
      clonedConfig: {
        settings: {
          gridMode: GridOperationModes.Client,
          pageSize: 100,
          allowGrouping: false,
          exportSize: 100,
        },
      },
      filters: {
        logic: "and",
        filters: [],
      },
      columnConfigs: [colConfig, colEnumConfig],
    };
  });

  // Note: running cleanup afterEach is done automatically for you in @testing-library/react@9.0.0 or higher
  // unmount and cleanup DOM after the test is finished.
  afterEach(cleanup);

  // Testing Component
  describe("BlotterGridCustomCellView", () => {
    // TEST:  Kinetix Monza Core > BlotterGridCustomCellView > component should be created without style attribute
    it("component should be created without style attribute", () => {
      let props = jest.createMockFromModule<GridCellProps>("@progress/kendo-react-grid");
      props.field = "test";
      props.dataItem = { test: "dummyValue" };
      props.id = "id";
      React.useContext = jest.fn().mockReturnValue(blotterContext);

      render(
        <>
          <table>
            <tbody>
              <tr>
                <BlotterGridCustomCellView {...props} />
              </tr>
            </tbody>
          </table>
        </>
      );

      // uncomment to see the html code
      // screen.debug();

      let ele = screen.getByRole("gridcell");

      expect(module).not.toBeNull();
      expect(ele).not.toBeNull();
      expect(ele.getAttribute("style")).toBeNull();
      expect(screen.getAllByText("dummyValue")).not.toBeNull();
    });

    // TEST:  Kinetix Monza Core > BlotterGridCustomCellView > cell formatting should apply bold effect on given condition match
    it("cell formatting should apply bold effect on given condition match on date type", () => {
      let props = jest.createMockFromModule<GridCellProps>("@progress/kendo-react-grid");
      let datetime = "2019-01-01T00:00:00.000+00:00";
      let dateObj = new Date("2019-01-01T00:00:00.000+00:00");
      let toLocalFormat = `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString()}`;
      props.field = "test";
      props.dataItem = { test: datetime };
      props.id = "id";

      blotterContext.datasetDefinition.columns = [{ ...colDef, type: DataTypes.date }];
      configItem.columnConfigs = [
        {
          ...colConfig,
          cellFormats: {
            column: { ...colDef, type: DataTypes.date },
            conditions: [
              {
                opretaor: { text: "filter.eqOperator", operator: "eq" },
                value: { value: datetime, displayName: "test" },
                format: {
                  textStyles: {
                    bold: true,
                  },
                },
                priority: 1,
              },
            ],
            priority: 1,
          },
        },
      ];

      blotterContext.model.configuration = configItem;
      React.useContext = jest.fn().mockReturnValue(blotterContext);

      render(
        <>
          <table>
            <tbody>
              <tr>
                <BlotterGridCustomCellView {...props} />
              </tr>
            </tbody>
          </table>
        </>
      );

      let ele = screen.getByRole("gridcell");

      expect(ele).not.toBeNull();
      expect(ele.getAttribute("style")).not.toBeNull();
      expect(ele.getAttribute("style")).toBe("font-weight: bold;");
      expect(screen.getAllByText((_, element) => element?.textContent === toLocalFormat)).not.toBeNull();
    });

    // TEST:  Kinetix Monza Core > BlotterGridCustomCellView > cell formatting should apply red color effect on given condition match
    it("cell formatting should apply red color effect on given condition match", () => {
      let props = jest.createMockFromModule<GridCellProps>("@progress/kendo-react-grid");
      props.field = "test";
      props.dataItem = { test: "dummyValue" };
      props.id = "id";
      blotterContext.datasetDefinition.columns = [colDef];
      configItem.columnConfigs = [
        {
          ...colConfig,
          cellFormats: {
            column: colDef,
            conditions: [
              {
                opretaor: { text: "filter.eqOperator", operator: "eq" },
                value: { value: "dummyValue", displayName: "test" },
                format: {
                  textStyles: {
                    textColor: "red",
                  },
                },
                priority: 1,
              },
            ],
            priority: 1,
          },
        },
      ];

      blotterContext.model.configuration = configItem;
      React.useContext = jest.fn().mockReturnValue(blotterContext);

      render(
        <>
          <table>
            <tbody>
              <tr>
                <BlotterGridCustomCellView {...props} />
              </tr>
            </tbody>
          </table>
        </>
      );

      let ele = screen.getByRole("gridcell");

      expect(ele).not.toBeNull();
      expect(ele.getAttribute("style")).not.toBeNull();
      expect(ele.getAttribute("style")).toBe("color: red;");
    });

    // TEST:  Kinetix Monza Core > BlotterGridCustomCellView > cell formatting should apply italic font effect on given condition match
    it("cell formatting should apply italic font effect on given condition match", () => {
      let props = jest.createMockFromModule<GridCellProps>("@progress/kendo-react-grid");
      props.field = "test";
      props.dataItem = { test: "dummyValue" };
      props.id = "id";

      configItem.columnConfigs = [
        {
          ...colConfig,
          cellFormats: {
            column: colDef,
            conditions: [
              {
                opretaor: { text: "filter.eqOperator", operator: "eq" },
                value: { value: "dummyValue", displayName: "test" },
                format: {
                  textStyles: {
                    italic: true,
                  },
                },
                priority: 1,
              },
            ],
            priority: 1,
          },
        },
      ];

      blotterContext.model.configuration = configItem;
      React.useContext = jest.fn().mockReturnValue(blotterContext);

      render(
        <>
          <table>
            <tbody>
              <tr>
                <BlotterGridCustomCellView {...props} />
              </tr>
            </tbody>
          </table>
        </>
      );

      let ele = screen.getByRole("gridcell");

      expect(ele).not.toBeNull();
      expect(ele.getAttribute("style")).not.toBeNull();
      expect(ele.getAttribute("style")).toBe("font-style: italic;");
    });

    // TEST:  Kinetix Monza Core > BlotterGridCustomCellView > cell formatting should apply underline effect on 'neq' operation for enum datatype
    it("cell formatting should apply underline effect on 'neq' operation for enum datatype", () => {
      let props = jest.createMockFromModule<GridCellProps>("@progress/kendo-react-grid");
      props.field = "testEnum";
      props.dataItem = { testEnum: "dummyValue" };
      props.id = "id";

      configItem.columnConfigs = [
        {
          ...colEnumConfig,
          cellFormats: {
            column: colEnumDef,
            conditions: [
              {
                opretaor: { text: "filter.eqOperator", operator: "neq" },
                value: { value: "somethingelse", displayName: "test" },
                format: {
                  textStyles: {
                    underline: true,
                  },
                },
                priority: 1,
              },
            ],
            priority: 1,
          },
        },
      ];

      blotterContext.model.configuration = configItem;
      React.useContext = jest.fn().mockReturnValue(blotterContext);

      render(
        <>
          <table>
            <tbody>
              <tr>
                <BlotterGridCustomCellView {...props} />
              </tr>
            </tbody>
          </table>
        </>
      );

      let ele = screen.getByRole("gridcell");

      expect(ele).not.toBeNull();
      expect(ele.getAttribute("style")).not.toBeNull();
      expect(ele.getAttribute("style")).toBe("text-decoration: underline;");
      expect(screen.getAllByText("dummyValue")).not.toBeNull();
    });

    // TEST:  Kinetix Monza Core > BlotterGridCustomCellView > cell formatting should apply background color effect on given condition match
    it("cell formatting should apply background color effect on given condition match to entire row", () => {
      let props = jest.createMockFromModule<GridCellProps>("@progress/kendo-react-grid");
      props.field = "test";
      props.dataItem = { test: "dummyValue" };
      props.id = "id";

      configItem.columnConfigs = [
        {
          ...colConfig,
          cellFormats: {
            column: colDef,
            conditions: [
              {
                opretaor: { text: "filter.eqOperator", operator: "eq" },
                value: { value: "dummyValue", displayName: "test" },
                format: {
                  applyToRow: true,
                  backgroundColor: "red",
                  textStyles: {},
                },
                priority: 1,
              },
            ],
            priority: 1,
          },
        },
      ];

      blotterContext.model.configuration = configItem;
      React.useContext = jest.fn().mockReturnValue(blotterContext);

      render(
        <>
          <table>
            <tbody>
              <tr>
                <BlotterGridCustomCellView {...props} />
              </tr>
            </tbody>
          </table>
        </>
      );

      let ele = screen.getByRole("gridcell");

      expect(ele).not.toBeNull();
      expect(ele.getAttribute("style")).not.toBeNull();
      expect(ele.getAttribute("style")).toBe("background-color: red;");
      expect(screen.getAllByText("dummyValue")).not.toBeNull();
    });

    // TEST:  Kinetix Monza Core > BlotterGridCustomCellView > cell formatting should apply strike through effect on 'eq' operation match on enum datatype
    it("cell formatting should apply strike through effect on 'eq' operation match on enum datatype", () => {
      let props = jest.createMockFromModule<GridCellProps>("@progress/kendo-react-grid");
      props.field = "testEnum";
      props.dataItem = { testEnum: "dummyValue" };
      props.id = "id";

      configItem.columnConfigs = [
        {
          ...colEnumConfig,
          cellFormats: {
            column: colEnumDef,
            conditions: [
              {
                opretaor: { text: "filter.eqOperator", operator: "eq" },
                value: "dummyValue",
                format: {
                  textStyles: {
                    strikethrough: true,
                  },
                },
                priority: 1,
              },
            ],
            priority: 1,
          },
        },
      ];

      blotterContext.model.configuration = configItem;
      React.useContext = jest.fn().mockReturnValue(blotterContext);

      render(
        <>
          <table>
            <tbody>
              <tr>
                <BlotterGridCustomCellView {...props} />
              </tr>
            </tbody>
          </table>
        </>
      );

      let ele = screen.getByRole("gridcell");

      expect(ele).not.toBeNull();
      expect(ele.getAttribute("style")).not.toBeNull();
      expect(ele.getAttribute("style")).toBe("text-decoration: line-through;");
      expect(screen.getAllByText("dummyValue")).not.toBeNull();
    });

    it("Render missing cell template", () => {
      const missingCellTemplate = (p: GridCustomCellProps) => {
        return <div>Missing CELL</div>;
      };
      let props = jest.createMockFromModule<GridCellProps>("@progress/kendo-react-grid");
      props.field = "testEnum";
      props.dataItem = { testEnum: undefined };
      props.id = "id";

      configItem.columnConfigs = [
        {
          ...colEnumConfig,
        },
      ];

      blotterContext.model.configuration = configItem;
      blotterContext.missingCellTemplate = missingCellTemplate;
      React.useContext = jest.fn().mockReturnValue(blotterContext);

      render(
        <>
          <table>
            <tbody>
              <tr>
                <BlotterGridCustomCellView {...props} />
              </tr>
            </tbody>
          </table>
        </>
      );

      expect(screen.getByText("Missing CELL")).not.toBeNull();
    });

    it("Render Grid List cell", () => {
      let props = jest.createMockFromModule<GridCellProps>("@progress/kendo-react-grid");
      props.field = "test1";
      props.dataItem = { test1: ["item-A"] };
      props.id = "id";

      configItem.columnConfigs = [
        {
          ...colEnumConfig,
        },
      ];

      blotterContext.model.configuration = configItem;

      React.useContext = jest.fn().mockReturnValue(blotterContext);

      render(
        <>
          <table>
            <tbody>
              <tr>
                <BlotterGridCustomCellView {...props} />
              </tr>
            </tbody>
          </table>
        </>
      );

      expect(screen.getByText("item-A")).not.toBeNull();
    });
  });
});
