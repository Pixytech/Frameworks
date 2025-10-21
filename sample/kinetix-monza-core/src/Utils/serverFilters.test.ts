// reflect-metadata is required for IOC
import "reflect-metadata";
import { CompositeDataFilter, CustomFilterOperators, DataTypes, RxDataFilter } from "../Data";
import { convertOperators, getRxFilters } from "./serverFilters";

// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped module
  let compositeFilter: CompositeDataFilter = {
    filters: [
      {
        logic: "and",
        filters: [
          {
            field: "state",
            operator: "startswith",
            value: { displayName: "Done", value: "DONE" },
            type: DataTypes.enum,
          },
          {
            field: "trader",
            operator: "eq",
            value: "trader1",
            type: DataTypes.string,
          },
          {
            field: "direction",
            operator: "startswith",
            value: "Buy",
            type: DataTypes.enum,
          },
        ],
      },
    ],
    logic: "and",
  };

  // Testing Component
  describe("getRxFilters", () => {
    // TEST:  Kinetix Monza Core > getRxFilters > should return rx filters
    it("should return rx filters", () => {
      let rxFilters = getRxFilters(compositeFilter);

      let expectedRxFilters: RxDataFilter[] = [
        {
          name: "state",
          value: "Done",
          type: DataTypes.enum,
          operation: "startsWith",
        },
        {
          name: "trader",
          value: "trader1",
          type: DataTypes.string,
          operation: "equals",
        },
        {
          name: "direction",
          value: "Buy",
          type: DataTypes.enum,
          operation: "startsWith",
        },
      ];

      expect(rxFilters).toMatchObject(expectedRxFilters);
    });

    it("convertOperators", () => {
      expect(convertOperators("contains")).toBe("contains");
      expect(convertOperators("doesnotcontain")).toBe("notContains");
      expect(convertOperators("gt")).toBe("greaterThan");
      expect(convertOperators("lt")).toBe("lessThan");
      expect(convertOperators("gte")).toBe("greaterOrEqualThan");

      expect(convertOperators("lte")).toBe("lessOrEqualThan");
      expect(convertOperators("eq")).toBe("equals");
      expect(convertOperators("neq")).toBe("notEquals");
      expect(convertOperators("startswith")).toBe("startsWith");
      expect(convertOperators("isnull")).toBe("isNull");
      expect(convertOperators("isnotnull")).toBe("notNull");
      expect(convertOperators("ANY-UNKNOWN")).toBe("ANY-UNKNOWN");

      // returns name of function which is custom operator.
      expect(convertOperators(CustomFilterOperators.in)).toBe("in");
      expect(convertOperators(CustomFilterOperators.match)).toBe("match");
      expect(convertOperators(CustomFilterOperators.matchPhrase)).toBe("matchPhrase");

      const anyOther = (a: any, b: any) => {
        return true;
      };
      expect(convertOperators(anyOther)).toBe("anyOther");
    });
  });
});
