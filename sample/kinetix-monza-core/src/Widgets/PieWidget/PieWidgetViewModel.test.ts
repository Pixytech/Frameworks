import "reflect-metadata";
import { PieWidgetViewModel } from "./PieWidgetViewModel";
import { IEventAggregator } from "@kinetix/core";
import { createMock } from "ts-auto-mock";
import { IGlobalFilters } from "../IGlobalFilters";
import { IUserPreferenceContext, WidgetTypes } from "../models";
import { CompositeDataFilter } from "../../Data";
import { IPieWidgetDefinition, IPieWidgetItem } from ".";
import { arrange } from "../../../../../testing";
import { analyticsDataService } from "../../Utils/analyticsService";
import { ITabOptions } from "../WidgetContainer";
import { WidgetDrillDownEvent, WidgetDrillDownEventPayload } from "../../Events";

// Base Package
describe("Kinetix Monza Core", () => {
  let mockEvents: IEventAggregator;
  let sut: PieWidgetViewModel;
  // this is real analyticsDataService mocking
  let mockanalyticsDataService: typeof analyticsDataService = analyticsDataService;

  beforeEach(() => {
    mockEvents = createMock<IEventAggregator>();
    let mockGlobalFilter = createMock<IGlobalFilters>();
    sut = new PieWidgetViewModel(mockGlobalFilter, mockEvents);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  // Testing Component
  describe("PieWidgetViewModel", () => {
    it("should initialize without error ", () => {
      arrange(mockanalyticsDataService).stubMethod("getTermAggregation", () => Promise.resolve({ totalCount: 0, items: [] }));
      sut.initialize();

      expect(sut).not.toBeNull();
    });

    it("should throw erro on initialize if api call fails ", () => {
      let err = new Error();
      arrange(mockanalyticsDataService).stubMethod("getTermAggregation", () => {
        throw err;
      });
      console.error = jest.fn();
      sut.initialize();
      expect(sut).not.toBeNull();
      expect(console.error).toBeCalledWith("Error loading pie widget data", err);
    });

    it("should configure initial widget config", async () => {
      let mockWidgetDef = createMock<IPieWidgetDefinition>();
      mockWidgetDef.datasetId = "55";
      mockWidgetDef.itemDefinitions = [{ key: "BuySell", displayName: "B/S", color: "red" }];
      let mockPreference = createMock<IUserPreferenceContext>();
      let mockFilter: CompositeDataFilter = { logic: "and", filters: [] };
      mockWidgetDef.filters = mockFilter;
      arrange(mockanalyticsDataService).stubMethod("getTermAggregation", () =>
        Promise.resolve({
          totalCount: 76701,
          items: [
            { key: "sell", value: 2.2324240271935874e8 },
            { key: "buy", value: 2.961698329583224e8 },
          ],
        })
      );
      sut.configure(mockWidgetDef, mockFilter, mockPreference);
      await sut.initialize();

      expect(sut).not.toBeNull();
      expect(sut.datasetId).toBe(mockWidgetDef.datasetId);
      expect(sut.datasetView).toBe(mockWidgetDef.datasetId);
      expect(sut.drilldownDatasetId).toBe(mockWidgetDef.datasetId);
    });

    it("should configure initial widget config without filter", async () => {
      let mockWidgetDef = createMock<IPieWidgetDefinition>();
      mockWidgetDef.drilldownDatasetId = "55";
      mockWidgetDef.itemDefinitions = [{ key: "BuySell", displayName: "B/S", color: "red" }];
      let mockPreference = createMock<IUserPreferenceContext>();
      let mockFilter: CompositeDataFilter = { logic: "and", filters: [] };
      arrange(mockanalyticsDataService).stubMethod("getTermAggregation", () =>
        Promise.resolve({
          totalCount: 0,
          items: [],
        })
      );
      sut.configure(mockWidgetDef, undefined as unknown as CompositeDataFilter, mockPreference);
      await sut.initialize();

      expect(sut).not.toBeNull();
      expect(sut.model.filters).toBeDefined();
      expect(sut.datasetView).toBe(mockWidgetDef.datasetId);
      expect(sut.drilldownDatasetId).toBe(mockWidgetDef.drilldownDatasetId);
    });

    it("should configure initial widget config for term widget with data", async () => {
      let mockWidgetDef = createMock<IPieWidgetDefinition>();
      mockWidgetDef.drilldownDatasetId = "55";
      mockWidgetDef.itemDefinitions = [{ key: "BuySell", displayName: "B/S", color: "red" }];
      let mockPreference = createMock<IUserPreferenceContext>();
      let mockFilter: CompositeDataFilter = { logic: "and", filters: [] };
      arrange(mockanalyticsDataService).stubMethod("getTermAggregation", () =>
        Promise.resolve({
          totalCount: 3,
          items: [
            { key: "sell", value: 4 },
            { key: "buy", value: 2 },
          ],
        })
      );
      sut.configure(mockWidgetDef, undefined as unknown as CompositeDataFilter, mockPreference);
      await sut.initialize();

      expect(sut).not.toBeNull();
      expect(sut.model.filters).toBeDefined();
      expect(sut.datasetView).toBe(mockWidgetDef.datasetId);
      expect(sut.drilldownDatasetId).toBe(mockWidgetDef.drilldownDatasetId);
    });

    it("should configure initial widget config for term widget with no data", async () => {
      let mockWidgetDef = createMock<IPieWidgetDefinition>();
      mockWidgetDef.drilldownDatasetId = "55";
      mockWidgetDef.itemDefinitions = [{ key: "BuySell", displayName: "B/S", color: "red" }];
      let mockPreference = createMock<IUserPreferenceContext>();
      let mockFilter: CompositeDataFilter = { logic: "and", filters: [] };
      arrange(mockanalyticsDataService).stubMethod("getTermAggregation", () =>
        Promise.resolve({
          totalCount: 3,
          items: [undefined, { key: "buy", value: 2 }],
        })
      );
      sut.configure(mockWidgetDef, undefined as unknown as CompositeDataFilter, mockPreference);
      await sut.initialize();

      expect(sut).not.toBeNull();
      expect(sut.model.filters).toBeDefined();
      expect(sut.datasetView).toBe(mockWidgetDef.datasetId);
      expect(sut.drilldownDatasetId).toBe(mockWidgetDef.drilldownDatasetId);
    });

    it("options should get initialized", async () => {
      let mockOptionsVm = createMock<ITabOptions>();
      let options = await sut.getTabOptions({
        key: "123",
        title: "test",
        widgetType: WidgetTypes.Pie,
        optionVM: mockOptionsVm,
      });
      expect(options).not.toBeNull();
      expect(options.length).toBe(0);
    });

    it("options should get initialized", async () => {
      let mockWidgetItem = createMock<IPieWidgetItem>();
      let subscriptionCallBack: (p: WidgetDrillDownEventPayload) => void = () => {};
      const eventsImp = {
        publish: jest.fn(),
        subscribe: jest.fn(),
      };
      arrange(mockEvents).stubMethod(
        "getEvent",
        () => {
          return eventsImp;
        },
        [WidgetDrillDownEvent, WidgetDrillDownEvent.Type]
      );

      sut.showDetails({ dataItem: mockWidgetItem });

      expect(eventsImp.publish).toBeCalled();
    });
  });

  it("options should get initialized when item is undefined", async () => {
    let mockWidgetItem = createMock<IPieWidgetItem>();
    sut.model.items = [
      { key: "key1", color: "red", displayName: "test1", value: 10 },
      { key: "key2", color: "blue", displayName: "test2", value: 20 },
    ];
    let subscriptionCallBack: (p: WidgetDrillDownEventPayload) => void = () => {};
    const eventsImp = {
      publish: jest.fn(),
      subscribe: jest.fn(),
    };
    arrange(mockEvents).stubMethod(
      "getEvent",
      () => {
        return eventsImp;
      },
      [WidgetDrillDownEvent, WidgetDrillDownEvent.Type]
    );

    sut.showDetails(undefined);

    expect(eventsImp.publish).toBeCalled();
  });

  it("get detaoled filter with undefined item", async () => {
    sut.model.items = [
      { key: "key1", color: "red", displayName: "test1", value: 10 },
      { key: "key2", color: "blue", displayName: "test2", value: 20 },
    ];

    const result = sut["getDetailsFilter"](undefined as unknown as IPieWidgetItem);
    expect(result).toBeDefined();
  });

  it("handle resize should switch flag", async () => {
    sut.handleWidgetResize({ height: 100, width: 100, offsetHeight: 100, offsetWidth: 100 });

    expect(sut.model.showFullView).toBe(false);

    sut.handleWidgetResize({ height: 500, width: 500, offsetHeight: 500, offsetWidth: 500 });

    expect(sut.model.showFullView).toBe(true);
  });

  describe("Multi-category behavior", () => {
    it("should identify widget as multi-category when itemDefinitions has more than 2 items", async () => {
      let mockWidgetDef = createMock<IPieWidgetDefinition>();
      mockWidgetDef.datasetId = "test-dataset";
      mockWidgetDef.itemDefinitions = [
        { key: "category1", displayName: "Category 1", color: "red" },
        { key: "category2", displayName: "Category 2", color: "blue" },
        { key: "category3", displayName: "Category 3", color: "green" },
        { key: "category4", displayName: "Category 4", color: "yellow" }
      ];
      let mockPreference = createMock<IUserPreferenceContext>();
      let mockFilter: CompositeDataFilter = { logic: "and", filters: [] };
      
      arrange(mockanalyticsDataService).stubMethod("getTermAggregation", () =>
        Promise.resolve({
          totalCount: 100,
          items: [
            { key: "category1", value: 40 },
            { key: "category2", value: 30 },
            { key: "category3", value: 20 },
            { key: "category4", value: 10 }
          ],
        })
      );
      
      sut.configure(mockWidgetDef, mockFilter, mockPreference);
      await sut.initialize();
      
      expect(sut.isMultiCategory).toBe(true);
      expect(sut.model.items).toHaveLength(4);
    });

    it("should identify widget as binary when itemDefinitions has 2 or fewer items", async () => {
      let mockWidgetDef = createMock<IPieWidgetDefinition>();
      mockWidgetDef.datasetId = "test-dataset";
      mockWidgetDef.itemDefinitions = [
        { key: "category1", displayName: "Category 1", color: "red" },
        { key: "category2", displayName: "Category 2", color: "blue" }
      ];
      let mockPreference = createMock<IUserPreferenceContext>();
      let mockFilter: CompositeDataFilter = { logic: "and", filters: [] };
      
      arrange(mockanalyticsDataService).stubMethod("getTermAggregation", () =>
        Promise.resolve({
          totalCount: 100,
          items: [
            { key: "category1", value: 60 },
            { key: "category2", value: 40 }
          ],
        })
      );
      
      sut.configure(mockWidgetDef, mockFilter, mockPreference);
      await sut.initialize();
      
      expect(sut.isMultiCategory).toBe(false);
    });

    it("should use customHoleSize when provided in widget definition", async () => {
      let mockWidgetDef = createMock<IPieWidgetDefinition>();
      mockWidgetDef.datasetId = "test-dataset";
      mockWidgetDef.customHoleSize = 60;
      mockWidgetDef.itemDefinitions = [
        { key: "category1", displayName: "Category 1", color: "red" }
      ];
      let mockPreference = createMock<IUserPreferenceContext>();
      
      sut.configure(mockWidgetDef, undefined as unknown as CompositeDataFilter, mockPreference);
      
      expect(sut.customHoleSize).toBe(60);
    });

    it("should format multi-category data correctly", async () => {
      let mockWidgetDef = createMock<IPieWidgetDefinition>();
      mockWidgetDef.datasetId = "test-dataset";
      mockWidgetDef.itemDefinitions = [
        { key: "gmsla", displayName: "GMSLA", color: "#FF6B6B" },
        { key: "fx give-up agreement", displayName: "FX Give-Up Agreement", color: "#4ECDC4" },
        { key: "collateral transfer agreement", displayName: "Collateral Transfer Agreement", color: "#95E1D3" }
      ];
      let mockPreference = createMock<IUserPreferenceContext>();
      let mockFilter: CompositeDataFilter = { logic: "and", filters: [] };
      
      arrange(mockanalyticsDataService).stubMethod("getTermAggregation", () =>
        Promise.resolve({
          totalCount: 4,
          items: [
            { key: "gmsla", value: 1 },
            { key: "fx give-up agreement", value: 2 },
            { key: "collateral transfer agreement", value: 1 }
          ],
        })
      );
      
      sut.configure(mockWidgetDef, mockFilter, mockPreference);
      await sut.initialize();
      
      // Check that all items are included with correct values
      expect(sut.model.items).toHaveLength(3);
      expect(sut.model.items[0]).toMatchObject({
        key: "gmsla",
        displayName: "GMSLA",
        value: 0.25 // 1/4
      });
      expect(sut.model.items[1]).toMatchObject({
        key: "fx give-up agreement",
        displayName: "FX Give-Up Agreement",
        value: 0.5 // 2/4
      });
      expect(sut.model.items[2]).toMatchObject({
        key: "collateral transfer agreement",
        displayName: "Collateral Transfer Agreement",
        value: 0.25 // 1/4
      });
    });
  });
});
