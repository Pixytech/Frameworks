// reflect-metadata is required for IOC
import "reflect-metadata";
import { BlotterColumnConfigViewModel, DataTypes, IColumnListItemData, IDatasetView } from "../../../..";
import { TestScheduler } from "rxjs/testing";
import { lastValueFrom } from "rxjs";
import { waitFor } from "@testing-library/react";
import { createMock } from "ts-auto-mock";
import { ListBoxDragEvent, ListBoxItemClickEvent } from "@progress/kendo-react-listbox";

// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped viewModel
  let sut: BlotterColumnConfigViewModel;
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

  const testScheduler = new TestScheduler((actual, expected) => {
    // asserting the two objects are equal - required
    // for TestScheduler assertions to work via your test framework
    // e.g. using chai.
    //console.log("testScheduler", actual, expected);
    expect(actual).toEqual(expected);
  });

  // Execute once before all tests
  // To create single module for all tests
  beforeEach(() => {
    sut = new BlotterColumnConfigViewModel();
  });

  // Testing Component
  describe("BlotterColumnConfigViewModel", () => {
    // TEST:  Kinetix Monza Core > BlotterColumnConfigViewModel > instance should be created
    it("Initialize subscriptions should work", async () => {
      await testScheduler.run(async () => {
        await sut.initialize();
        sut.selectAllColumns.updateModel((m) => (m.value = true));

        await expect(lastValueFrom(sut.onConfigurationChanged)).resolves;
      });
    });

    it("on searchColumns update the model", async () => {
      await testScheduler.run(async () => {
        await sut.initialize();

        sut.searchColumns.updateModel((m) => (m.value = "TEST"));

        waitFor(() => {
          expect(sut.model.searchString).toBe("TEST");
        });
      });
    });

    it("filter columns based on search ", async () => {
      const item1 = createMock<IColumnListItemData>();
      const item2 = createMock<IColumnListItemData>();
      item1.name = "test1";
      item2.name = "test2";
      sut.model.searchString = "2";
      sut.model.columns = [item1, item2];
      const result = sut.getFilteredColumns();
      expect(result[0].name).toBe("test2");
      expect(result.length).toBe(1);
    });

    it("handleListItemClick ", async () => {
      const mockEvent = createMock<ListBoxItemClickEvent>();
      sut.handleListItemClick(mockEvent);
    });

    it("handleListItemDragStart ", async () => {
      const mockEvent = createMock<ListBoxDragEvent>();
      sut.handleListItemDragStart(mockEvent);
    });

    it("handleListItemDrop ", async () => {
      const mockEvent = createMock<ListBoxDragEvent>();
      sut.handleListItemDrop(mockEvent);
    });

    // TEST:  Kinetix Monza Core > BlotterColumnConfigViewModel > setConfiguration should update the columns with column def
    it("setConfiguration should update the columns with column def", () => {
      let mockDatasetView = jest.createMockFromModule<IDatasetView>("../../../..");
      mockDatasetView.columns = [
        {
          name: "assetClass",
          hidden: false,
          format: "number",
        },
      ];

      let mockDatasetDef = {
        id: "1",
        name: "dummy",
        collectionNameOverride: "override",
        description: "desc",
        columns: [datasetDefCol1],
        hasPermission: true,
        hasFeature: true,
        loaded: true,
        columnNames: [],
        defaultParameters: {},
      };

      sut.setConfiguration(mockDatasetView, mockDatasetDef, [{ name: "assetClass", order: 0 }]);
      expect(sut.model.columns).not.toBeNull();
      expect(sut.model.columns.length).toBe(1);
      expect(sut.model.columns[0].name).toBe("assetClass");
      expect(sut.model.columns[0].order).toBe(0);
      expect(sut.model.columns[0].selected).toBe(true);
      expect(sut.model.columns[0].displayName).toBe("Asset");
    });
  });
});
