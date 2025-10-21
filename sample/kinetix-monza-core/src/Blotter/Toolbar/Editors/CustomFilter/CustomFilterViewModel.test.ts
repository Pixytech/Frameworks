// reflect-metadata is required for IOC
import "reflect-metadata";
import type { IContainer } from "@kinetix/core";
import { createMock } from "ts-auto-mock";
import { BlotterCustomFilterViewModel, DataFilter, DataTypes, GridOperationModes } from "../../../..";
import type { IConfigurationEditor } from "../IConfigurationEditor";
import { CompositeFilterDescriptor } from "@progress/kendo-data-query";
import { FILTER_OPERATORS } from "../../../Utils/Operators";

// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped viewModel
  let sut: BlotterCustomFilterViewModel;
  let mockContainer: IContainer;
  let mockConfigurationEditor: IConfigurationEditor;

  let datasetDefCol1 = {
    name: "assetClass",
    displayName: "Asset",
    displayField: "assetClass",
    order: 0,
    type: DataTypes.string,
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
    possibleValues: [],
    enumType: "string",
    alternativeFields: [],
  };

  let datasetDefCol2 = {
    name: "name",
    displayName: "Name",
    displayField: "name",
    order: 0,
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
  };

  // Execute once before all tests
  // To create single module for all tests
  beforeEach(() => {
    mockContainer = createMock<IContainer>();
    mockConfigurationEditor = createMock<IConfigurationEditor>();

    sut = new BlotterCustomFilterViewModel();
    sut.Owner = mockConfigurationEditor;
    sut.columns = [datasetDefCol1, datasetDefCol2];
    sut.setConfiguration({ logic: "and", filters: [] }, GridOperationModes.Server);
  });

  // Testing Component
  describe("BlotterCellFormattingViewModel", () => {
    it("model is not null", async () => {
      await sut.initialize();

      expect(sut.model).not.toBeNull();
      expect(sut.onConfigurationChanged).not.toBeNull();
    });

    it("searchColumn must add formatGroup", async () => {
      await sut.initialize();

      sut.searchColumn.setValue("Name");

      const filter = sut.model.filters.filters[0] as DataFilter;
      expect(filter.field).toBe("name");
    });

    it("test handleClientFilterChange", async () => {
      let filterDescriptor: CompositeFilterDescriptor = {
        logic: "or",
        filters: [
          {
            field: "name",
            operator: "eq",
          },
        ],
      };

      sut.handleClientFilterChange(filterDescriptor);

      let filter = sut.model.filters.filters[0] as DataFilter;
      expect(filter.field).toBe("name");
    });

    it("on handleFilterChange should notify configuration change", async () => {
      let filterDescriptor: CompositeFilterDescriptor = {
        logic: "or",
        filters: [
          {
            field: "name",
            operator: "eq",
          },
        ],
      };

      let isConConfigurationChanged = false;
      sut.onConfigurationChanged.subscribe((x) => {
        isConConfigurationChanged = true;
      });
      sut.handleFilterChange("name", DataTypes.string, { text: "NAME", operator: "eq" }, "value", undefined);

      expect(isConConfigurationChanged).toBe(true);
    });

    it("on handleFilterChange with existing filter should notify configuration change", async () => {
      let filterDescriptor: CompositeFilterDescriptor = {
        logic: "or",
        filters: [
          {
            field: "name",
            operator: "eq",
          },
        ],
      };

      sut.handleClientFilterChange(filterDescriptor);
      let isConConfigurationChanged = false;
      sut.onConfigurationChanged.subscribe((x) => {
        isConConfigurationChanged = true;
      });
      sut.handleFilterChange("name1", DataTypes.string, { text: "NAME1", operator: "eq" }, "value", "name");

      expect(isConConfigurationChanged).toBe(true);
    });

    it("test handleClientFilterChange missing column", async () => {
      let filterDescriptor: CompositeFilterDescriptor = {
        logic: "or",
        filters: [
          {
            field: "badColumn",
            operator: "eq",
          },
        ],
      };

      sut.handleClientFilterChange(filterDescriptor);

      let filter = sut.model.filters.filters[0] as DataFilter;
      expect(filter.type).toBe(DataTypes.string);
      expect(filter.field).toBe("badColumn");
    });

    it("test getFilteredColumns", async () => {
      let columns = sut.getFilteredColumns();

      expect(columns).not.toBeNull();
      expect(columns.length).toBe(0);

      sut.searchColumn.value = "asset";
      columns = sut.getFilteredColumns();

      expect(columns.length).toBe(1);

      sut.model.filters.filters = [
        {
          field: "assetClass",
          operator: "eq",
          type: DataTypes.string,
          value: "test",
        },
      ];

      columns = sut.getFilteredColumns();
      expect(columns.length).toBe(0);
    });
  });
});
