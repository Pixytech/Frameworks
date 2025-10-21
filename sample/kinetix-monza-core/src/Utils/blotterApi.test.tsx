// reflect-metadata is required for IOC
import "reflect-metadata";
import { dataService } from "./blotterApi";
import { arrange, mockFetch, stubComponent } from "../../../../testing";
import { api } from "./api";
import { AuthenticationService } from "@kinetix/core";
import { createMock } from "ts-auto-mock";
import { BlotterColumnDefinition, IDatasetDefinition } from "../Blotter";
import { DataTypes } from "../Data";

// Base Package
describe("Kinetix Monza Core", () => {
  beforeEach(() => {
    arrange(AuthenticationService.Instance)
      .stubMethod("IsLoggedIn", () => {
        return true;
      })
      .stubMethod("GetParsedToken", () => {
        return { jti: "eyJhbGciOiJIUzI1NiIsInR5cCI", UserRole: "DevSupport", ClientId: 9999 };
      });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // Testing Component
  describe("dataService", () => {
    it("getDatasetDataByRequest should get called", async () => {
      let testValue = { default: "test" };
      mockFetch(testValue);
      let res = await dataService.getDatasetDataByRequest("testID", 0, 100, [], {}, "", { sort: [{ field: "created", dir: "asc" }] });
      expect(res).not.toBeNull();
      expect(res).toStrictEqual(testValue);
    });

    it("getDatasetDataByRequest should get called with undefined state", async () => {
      let testValue = { default: "test" };
      mockFetch(testValue);

      const cols: BlotterColumnDefinition[] = [
        {
          name: "someField",
          displayName: "someField",
          displayField: "someField",
          order: 0,
          type: DataTypes.int,
          field: "someField",
          objectName: "someField",
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
        },
        {
          name: "listField",
          displayName: "listField",
          displayField: "listField",
          order: 0,
          type: DataTypes.list,
          field: "listField",
          objectName: "listField",
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
        },
      ];
      const mockDataSetDefinitation = createMock<IDatasetDefinition>({
        columns: cols,
      });
      let res = await dataService.getDatasetDataByRequest("testID", 0, 100, [], mockDataSetDefinitation, "", undefined);
      expect(res).not.toBeNull();
      expect(res).toStrictEqual(testValue);
    });

    it("getDatasetDataByRequest should get called with filters", async () => {
      let testValue = { default: "test" };
      mockFetch(testValue);

      const cols: BlotterColumnDefinition[] = [
        {
          name: "someField",
          displayName: "someField",
          displayField: "someField",
          order: 0,
          type: DataTypes.int,
          field: "someField",
          objectName: "someField",
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
        },
        {
          name: "listField",
          displayName: "listField",
          displayField: "listField",
          order: 0,
          type: DataTypes.list,
          field: "listField",
          objectName: "listField",
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
        },
      ];
      const mockDataSetDefinitation = createMock<IDatasetDefinition>({
        columns: cols,
      });
      let res = await dataService.getDatasetDataByRequest("testID", 0, 100, [], mockDataSetDefinitation, "", {
        sort: [{ field: "created", dir: "asc" }],
        filter: {
          logic: "and",
          filters: [
            { field: "someField", operator: "eq", value: "5" },
            { field: "listField", operator: "eq", value: "5" },
            { field: "missingField", operator: "eq", value: "5" },
          ],
        },
      });
      expect(res).not.toBeNull();
      expect(res).toStrictEqual(testValue);
    });

    it("getContextMenu should get called", async () => {
      let testValue = { default: "test" };
      mockFetch(testValue);
      let res = await dataService.getContextMenu("{}");
      expect(res).not.toBeNull();
      expect(res).toStrictEqual(testValue);
    });

    it("getDatasetViews should get called", async () => {
      let testValue = { default: "test" };
      mockFetch(testValue);
      let res = await dataService.getDatasetViews("user1");
      expect(res).not.toBeNull();
      expect(res).toStrictEqual(testValue);
    });

    it("removeDataset should get called", async () => {
      let testValue = { default: "test" };
      mockFetch(testValue);
      let res = await dataService.removeDataset("testId");
      expect(res).not.toBeNull();
      expect(res).toStrictEqual(testValue);
    });

    it("getDatasetData should get called", async () => {
      let testValue = { default: "test" };
      mockFetch(testValue);
      let res = await dataService.getDatasetData("title");

      expect(res).not.toBeNull();
      expect(res).toStrictEqual(testValue);
    });

    it("getDatasetDataByLookup should get called", async () => {
      let testValue = { default: "test" };
      mockFetch(testValue);
      let res = await dataService.getDatasetDataByLookup("testId", "testQuery");
      expect(res).not.toBeNull();
      expect(res).toStrictEqual(testValue);
    });

    it("getDatasetDataByLookup should get called with empty", async () => {
      let testValue = { default: "test" };
      mockFetch(testValue);
      let res = await dataService.getDatasetDataByLookup("testId", "");
      expect(res).not.toBeNull();
      expect(res).toStrictEqual(testValue);
    });

    it("getDatasetDataByLookup should get called with undefined", async () => {
      let testValue = { default: "test" };
      mockFetch(testValue);
      let res = await dataService.getDatasetDataByLookup("testId", undefined);
      expect(res).not.toBeNull();
      expect(res).toStrictEqual(testValue);
    });

    it("getDatasetDataByLookup should handle internal-legalentities with clientId", async () => {
      let testValue = { items: [] };
      mockFetch(testValue);
      let res = await dataService.getDatasetDataByLookup("internal-legalentities", undefined);
      expect(res).not.toBeNull();
      expect(res).toStrictEqual(testValue);
      // Should call with limit=100 and clientId=9999
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("limit=100"),
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("clientId=9999"),
        expect.any(Object)
      );
    });
    it("updateDatasets should get called", async () => {
      let testValue = { default: "test" };
      mockFetch(testValue);
      let res = await dataService.updateDatasets("testView");

      expect(res).not.toBeNull();
      expect(res).toStrictEqual(testValue);
    });

    it("getUsers should get called", async () => {
      let testValue = { default: "test" };
      mockFetch(testValue);
      let res = await dataService.getUsers();

      expect(res).not.toBeNull();
      expect(res).toStrictEqual(testValue);
    });

    it("getDatasetDefinition should get called", async () => {
      let testValue = { default: "test" };
      mockFetch(testValue);
      let res = await dataService.getDatasetDefinition("definition");

      expect(res).not.toBeNull();
      expect(res).toStrictEqual(testValue);
    });

    it("getDatasets should get called", async () => {
      let testValue = { default: "test" };
      mockFetch(testValue);
      let res = await dataService.getDatasets();
      expect(res).not.toBeNull();
      expect(res).toStrictEqual(testValue);
    });
  });
});
