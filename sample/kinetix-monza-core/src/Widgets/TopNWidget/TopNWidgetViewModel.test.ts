import "reflect-metadata";
import { TopNWidgetViewModel } from "./TopNWidgetViewModel";
import { IEventAggregator } from "@kinetix/core";
import { createMock } from "ts-auto-mock";
import { IGlobalFilters } from "../IGlobalFilters";
import { IUserPreferenceContext, WidgetTypes } from "../models";
import { CompositeDataFilter } from "../../Data";
import { arrange } from "../../../../../testing";
import { analyticsDataService } from "../../Utils/analyticsService";
import { ITabOptions } from "../WidgetContainer";
import { ITopNWidgetDefinition } from "./ITopNWidget";

// Base Package
describe("Kinetix Monza Core", () => {
  let sut: TopNWidgetViewModel;
  // this is real analyticsDataService mocking
  let mockanalyticsDataService: typeof analyticsDataService =
    analyticsDataService;

  beforeEach(() => {
    let mockEvents = createMock<IEventAggregator>();
    let mockGlobalFilter = createMock<IGlobalFilters>();
    sut = new TopNWidgetViewModel(mockGlobalFilter, mockEvents);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  // Testing Component
  describe("TopNWidgetViewModel", () => {
    it("should initialize without error ", () => {
      arrange(mockanalyticsDataService).stubMethod("getTermAggregation", () =>
        Promise.resolve({ totalCount: 0, items: [] })
      );
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
      expect(console.error).toBeCalledWith(
        "Error loading pie widget data",
        err
      );
    });

    it("should configure initial widget config", () => {
      let mockWidgetDef = createMock<ITopNWidgetDefinition>();
      mockWidgetDef.datasetId = "55";
      mockWidgetDef.itemColumnDisplayName = "key";
      mockWidgetDef.valueColumnDisplayName = "Val";
      let mockPreference = createMock<IUserPreferenceContext>();
      let mockFilter: CompositeDataFilter = { logic: "and", filters: [] };
      arrange(mockanalyticsDataService).stubMethod("getTermAggregation", () =>
        Promise.resolve({
          totalCount: 76701,
          items: [
            { key: "sell", value: 2.2324240271935874e8 },
            { key: "buy", value: 2.961698329583224e8 },
          ],
        })
      );
      sut.initialize();
      sut.configure(mockWidgetDef, mockFilter, mockPreference);

      expect(sut).not.toBeNull();
      expect(sut.datasetId).toBe(mockWidgetDef.datasetId);
      expect(sut.datasetView).toBe(mockWidgetDef.datasetId);
      expect(sut.drilldownDatasetId).toBe(mockWidgetDef.datasetId);
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
  });
});
