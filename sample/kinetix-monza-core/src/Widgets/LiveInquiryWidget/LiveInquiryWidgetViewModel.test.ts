// reflect-metadata is required for IOC
import "reflect-metadata";
import { createMock } from "ts-auto-mock";
import { IEventAggregator } from "@kinetix/core";
import { LiveInquiryWidgetViewModel } from "./LiveInquiryWidgetViewModel";
import { CompositeDataFilter, IGlobalFilters, dataService } from "../..";
import { arrange } from "../../../../../testing";

// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped viewModel
  let mockdataService: typeof dataService = dataService;
  let sut: LiveInquiryWidgetViewModel;

  // Execute once before all tests
  // To create single module for all tests
  beforeAll(() => {
    let events = createMock<IEventAggregator>();
    let globalFilter = createMock<IGlobalFilters>();
    sut = new LiveInquiryWidgetViewModel(globalFilter, events);
  });

  afterEach(() => {
    // restore the spy created with spyOn
    jest.restoreAllMocks();
  });

  // Testing Component
  describe("Live Inquiry Widget ViewModel", () => {
    // TEST:  Kinetix Monza Core > Live Inquiry Widget ViewModel > instance should be created
    it("should configure initial widget config", () => {
      let filter: CompositeDataFilter = { logic: "and", filters: [] };
      sut.configure(
        {
          datasetId: "23",
        },
        filter
      );
      expect(sut).not.toBeNull();
      expect(sut).not.toBeUndefined();
      expect(sut.filters).toBe(filter);
      expect(sut.datasetId).toBe("23");
      expect(sut.drilldownDatasetId).toBe("23");
    });

    it("should load widget data", async () => {
      arrange(mockdataService).stubMethod("getDatasetDataByRequest", () =>
        Promise.resolve({
          totalCount: 1,
          items: [{ data: "something" }],
        })
      );

      await sut.loadData(true);
      expect(sut).not.toBeNull();
      expect(sut).not.toBeUndefined();
      expect(sut.model.totalCount).toBe(1);
      expect(sut.model.items.length).toBe(1);
      expect(sut.model.items[0].data).toBe("something");
    });

    it("should load widget data", async () => {
      let err = new Error("Custom Error");
      console.error = jest.fn();
      arrange(mockdataService).stubMethod("getDatasetDataByRequest", () => {
        throw err;
      });

      await sut.loadData(true);

      expect(console.error).toBeCalledWith("Error loading pie widget data", err);
    });
  });
});
