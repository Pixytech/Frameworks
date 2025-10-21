// reflect-metadata is required for IOC
import "reflect-metadata";
import { executeOperator, getAllowedGridFilterOperators, getAllowedOperators, getFilterName, getOperatorsByType } from "./Operators";
import { DataTypes } from "../../Data";

// Base Package
describe("Kinetix Monza Core", () => {
  // Execute once before all tests
  // To create single module for all tests
  beforeEach(() => {});

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Operators", () => {
    it("executeOperator", () => {
      expect(executeOperator({ operator: "eq" }, "True", "true", DataTypes.boolean)).toBe(true);
      expect(executeOperator({ operator: "eq" }, "False", "false", DataTypes.boolean)).toBe(true);

      expect(executeOperator({ operator: "eq" }, "2023-04-01", "2023-04-01", DataTypes.date)).toBe(true);
      expect(executeOperator({ operator: "eq" }, "2023-04-01", "2023-04-01", DataTypes.dateTime)).toBe(true);

      expect(executeOperator({ operator: "contains" }, "some test data", "test", DataTypes.string)).toBe(true);
      expect(executeOperator({ operator: "doesnotcontain" }, "some test data", "exists", DataTypes.string)).toBe(true);
      expect(executeOperator({ operator: "startswith" }, "some test data", "some", DataTypes.string)).toBe(true);
      expect(executeOperator({ operator: "endswith" }, "some test data", "data", DataTypes.string)).toBe(true);
      expect(executeOperator({ operator: "isempty" }, undefined, undefined, DataTypes.string)).toBe(true);
      expect(executeOperator({ operator: "isnull" }, null, null, DataTypes.string)).toBe(true);
      expect(executeOperator({ operator: "isnotempty" }, " ", " ", DataTypes.string)).toBe(true);
      expect(executeOperator({ operator: "gte" }, 5, 5, DataTypes.int)).toBe(true);
      expect(executeOperator({ operator: "gt" }, 6, 5, DataTypes.int)).toBe(true);
      expect(executeOperator({ operator: "lte" }, 5, 5, DataTypes.int)).toBe(true);
      expect(executeOperator({ operator: "lt" }, 4, 5, DataTypes.int)).toBe(true);
    });

    it("getOperatorsByType", () => {
      expect(getOperatorsByType(DataTypes.string, true)).toBe((getAllowedGridFilterOperators() as any).text);
      expect(getOperatorsByType(DataTypes.string, false)).toBe((getAllowedOperators() as any).text);
    });

    it("getOperatorsByType", () => {
      expect(getFilterName(DataTypes.string)).toBe("text");
      expect(getFilterName(DataTypes.date)).toBe("date");
      expect(getFilterName(DataTypes.dateTime)).toBe("date");
      expect(getFilterName(DataTypes.int)).toBe("numeric");
      expect(getFilterName(DataTypes.long)).toBe("numeric");
      expect(getFilterName(DataTypes.numeric)).toBe("numeric");
      expect(getFilterName(DataTypes.number)).toBe("numeric");
      expect(getFilterName(DataTypes.boolean)).toBe("boolean");
    });
  });
});
