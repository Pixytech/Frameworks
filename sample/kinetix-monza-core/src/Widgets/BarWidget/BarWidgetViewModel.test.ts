// reflect-metadata is required for IOC
import "reflect-metadata";
import { createMock } from "ts-auto-mock";
import { arrange, clearStubs, createMockEventAggregator } from "../../../../../testing";
import { BarWidgetViewModel } from "./BarWidgetViewModel";
import { AuthenticationService, IEventAggregator } from "@kinetix/core";
import { CompositeDataFilter } from "../../Data";
import { WidgetDrillDownEvent } from "../../Events";
import { analyticsDataService } from "../../Utils/analyticsService";
import { dataService } from "../../Utils/blotterApi";
import { IGlobalFilters } from "../IGlobalFilters";
import { IBarWidgetDefinition } from "./IBarWidget";

// Base Package
describe("Kinetix Monza core", () => {
  // Scoped module
  let mockFilter: IGlobalFilters;
  let mockEventAggregator: IEventAggregator;
  let sut: BarWidgetViewModel;
  let mockdataService: typeof dataService = dataService;

  let items = [
    { assetClass: "Bonds", recordType: "float", version: "1" },
    { assetClass: "Repo", recordType: "int", version: "2" },
    { assetClass: "FX", recordType: "string", version: "3" },
  ];

  let mockDef = {
    type: "RfqDataset",
    id: "request-for-quote",
    name: "RequestForQuoteModel",
    collectionNameOverride: "RequestForQuoteModel",
    description: "Request For Quote",
    columns: {
      assetClass: {
        name: "assetClass",
        displayName: "Asset Class",
        type: "string",
        field: "_fixedValue",
        objectName: "assetClass",
        useAsParameter: true,
        isArray: false,
        sortable: true,
        forceUTC: false,
        primaryDisplayName: false,
        defaultColumn: false,
        nested: false,
        defaultValue: "BOND",
      },
      recordType: {
        name: "recordType",
        displayName: "Record Type",
        type: "string",
        field: "_fixedValue",
        objectName: "recordType",
        useAsParameter: true,
        isArray: false,
        sortable: true,
        forceUTC: false,
        primaryDisplayName: false,
        defaultColumn: false,
        nested: false,
        defaultValue: "RequestForQuote",
      },
      version: {
        name: "version",
        displayName: "Version",
        type: "number",
        field: "identifier?.ids?.^[ domain.name =='KINETIX']?.version",
        objectName: "version",
        groupable: true,
        aggregable: true,
        useAsParameter: true,
        isArray: false,
        sortable: true,
        allowMultipleValues: false,
        forceUTC: false,
        primaryDisplayName: false,
        defaultColumn: false,
        placeholder: "0",
        nested: false,
      },
    },
    hasPermission: false,
    hasFeature: false,
    loaded: false,
  };

  // Execute once before all tests
  // To create single module for all tests
  beforeEach(() => {
    mockFilter = createMock<IGlobalFilters>();
    mockEventAggregator = createMockEventAggregator();

    arrange(AuthenticationService.Instance)
      .stubMethod("GetUserId", () => "tom")
      .stubMethod("IsLoggedIn", () => {
        return true;
      })
      .stubMethod("GetParsedToken", () => {
        return { jti: "eyJhbGciOiJIUzI1NiIsInR5cCI", UserRole: "DevSupport" };
      });

    arrange(analyticsDataService).stubMethod("getDateHistogramAggregation", () => Promise.resolve({ items }));

    arrange(mockdataService)
      .stubMethod("getDatasetDataByRequest", () => Promise.resolve({ items }))
      .stubMethod("getDatasetDefinition", () => Promise.resolve(mockDef));

    sut = new BarWidgetViewModel(mockFilter, mockEventAggregator);
  });

  afterEach(() => {
    jest.resetAllMocks();
    clearStubs();
  });

  // Testing Component
  describe("BarWidgetViewModel", () => {
    it("show Details should publish drilldown event for month widget", async () => {
      sut.showDetails({ series: { name: "TestName" }, category: "TestCatagory" });
      expect(mockEventAggregator.getEvent<WidgetDrillDownEvent>(WidgetDrillDownEvent, WidgetDrillDownEvent.Type).publish).toBeCalled();
    });

    it("show Details should publish drilldown event for quarter widget", async () => {
      sut.categoryField = "recordType";
      await sut.handleIntervalTabChange(1);
      sut.showDetails({ series: { name: "TestName" }, category: "TestCatagory" });
      expect(mockEventAggregator.getEvent<WidgetDrillDownEvent>(WidgetDrillDownEvent, WidgetDrillDownEvent.Type).publish).toBeCalled();
    });

    it("show Details should publish drilldown event for year widget", async () => {
      sut.categoryField = "recordType";
      await sut.handleIntervalTabChange(2);
      sut.showDetails({ series: { name: "TestName" }, category: "TestCatagory" });
      expect(mockEventAggregator.getEvent<WidgetDrillDownEvent>(WidgetDrillDownEvent, WidgetDrillDownEvent.Type).publish).toBeCalled();
    });

    it("should configure widget", async () => {
      let mockWidgetDefinition = createMock<IBarWidgetDefinition>();
      let mockFilter: CompositeDataFilter = { logic: "and", filters: [] };

      mockWidgetDefinition.datasetId = "testId";
      mockWidgetDefinition.categoryField = "recordType";
      sut.initialize();
      sut.configure(mockWidgetDefinition, mockFilter);

      expect(sut.datasetId).toBe("testId");
      expect(sut.categoryField).toBe("recordType");
    });
  });
});
