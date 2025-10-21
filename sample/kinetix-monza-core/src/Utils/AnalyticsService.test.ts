// reflect-metadata is required for IOC
import "reflect-metadata";
import { api } from "./api";
import { AggregationType, FxRateDateType, analyticsDataService } from "..";
import { limit } from "@progress/kendo-data-query/dist/npm/array.operators";

// Mock api calls
jest.mock("./api");

// Base Package
describe("Kinetix Monza Core", () => {
  const resp = { data: "test" };

  // Execute before each tests
  beforeEach(() => {
    (api as jest.Mock).mockReturnValue(resp);
  });

  // Testing Component
  describe("Analytics Service", () => {
    // TEST:  Kinetix Monza Core > Analytics Service > instance should be created
    it("instance should be created", async () => {
      var res = await analyticsDataService.getDateHistogramAggregation("1235", { logic: "and", filters: [] }, "", "", "", AggregationType.Minimum);
      expect(res).not.toBeUndefined();
      expect(res.data).toEqual("test");
    });

    it("instance should be created", async () => {
      (api as jest.Mock).mockReturnValue({ totalCount: 10, items: [] });
      var res = await analyticsDataService.getSingleValueAggregation("1235", { logic: "and", filters: [] }, "test", AggregationType.Minimum);
      expect(res).not.toBeUndefined();
      expect(res.totalCount).toBe(10);
    });

    it("instance should be created", async () => {
      (api as jest.Mock).mockReturnValue({ totalCount: 10, items: [] });
      var res = await analyticsDataService.getTermAggregation("1235", { logic: "and", filters: [] }, "test", "aggregateByField", AggregationType.Minimum, 10, "CCY", FxRateDateType.Current);
      expect(res).not.toBeUndefined();
      expect(res.totalCount).toBe(10);
    });
  });
});
