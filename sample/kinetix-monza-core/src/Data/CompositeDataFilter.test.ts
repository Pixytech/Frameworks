// reflect-metadata is required for IOC
import "reflect-metadata";
import { CompositeDataFilter, isValidFilter, toCompositeDataFilter, toCompositeFilterDescriptor } from "./CompositeDataFilter";
import { DataTypes } from "./DataTypes";
import { CompositeFilterDescriptor, FilterDescriptor } from "@progress/kendo-data-query";
import { Helpers } from "../Utils/Helpers";
import { CustomFilterOperators } from "./DataFilter";

// Base Package
describe("Kinetix Monza Core", () => {
  // Execute once before all tests
  // To create single module for all tests
  beforeEach(() => {});

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("CompositeDataFilter", () => {
    it("isValidFilter", () => {
      const validFilter: CompositeDataFilter = {
        logic: "and",
        filters: [
          {
            logic: "and",
            filters: [{ field: "field1", value: "some", operator: "eq", type: DataTypes.string }],
          },
        ],
      };

      expect(isValidFilter(validFilter)).toBe(true);

      const invalidFilter: CompositeDataFilter = {
        logic: "and",
        filters: [
          {
            logic: "and",
            filters: [{ field: "field1", operator: "eq", type: DataTypes.string }],
          },
        ],
      };

      expect(isValidFilter(invalidFilter)).toBe(false);
    });

    it("Convert to Kendo CompositeFilterDescriptor filter", () => {
      const dataFilter: CompositeDataFilter = {
        logic: "and",
        filters: [
          {
            logic: "and",
            filters: [
              {
                logic: "and",
                filters: [
                  { field: "field1", value: Helpers.formatDate(new Date(2022, 5, 13)), operator: "eq", type: DataTypes.date },
                  { field: "field2", value: "some", operator: "eq", type: DataTypes.string },
                ],
              },
            ],
          },
        ],
      };

      const result = toCompositeFilterDescriptor(dataFilter);

      expect(result).toMatchObject({
        logic: "and",
        filters: [
          {
            logic: "and",
            filters: [
              {
                logic: "and",
                filters: [
                  {logic: "and",filters: [{ field: "field1", value: new Date(2022, 5, 13), operator: "eq" }]} ,
                  {logic: "and",filters: [{ field: "field2", value: "some", operator: "eq" }]}
                  ,
                ],
              },
            ],
          },
        ],
      });
    });

    it("convert null dates Kendo CompositeFilterDescriptor filter", () => {
      expect(
        toCompositeFilterDescriptor({
          logic: "and",
          filters: [
            {
              logic: "and",
              filters: [
                {
                  logic: "and",
                  filters: [{ field: "field1", value: null, operator: "eq", type: DataTypes.date }],
                },
              ],
            },
          ],
        })
      ).toMatchObject({
        logic: "and",
        filters: [
          {
            logic: "and",
            filters: [
              {
                logic: "and",
                filters: [{logic: "and",filters: [{ field: "field1", value: null, operator: "eq" }]}] ,
              },
            ],
          },
        ],
      });
    });

    it("convert empty dates Kendo CompositeFilterDescriptor filter", () => {
      expect(
        toCompositeFilterDescriptor({
          logic: "and",
          filters: [
            {
              logic: "and",
              filters: [
                {
                  logic: "and",
                  filters: [{ field: "field1", value: "", operator: "eq", type: DataTypes.date }],
                },
              ],
            },
          ],
        })
      ).toMatchObject({
        logic: "and",
        filters: [
          {
            logic: "and",
            filters: [
              {
                logic: "and",
                 filters: [{logic: "and",filters: [{ field: "field1", value: null, operator: "eq" }]}] ,
              },
            ],
          },
        ],
      });
    });
    it("Convert dateTime Kendo CompositeFilterDescriptor filter", () => {
      const stringDateTime = "2023-12-20T18:18:16.180Z";
      const dateTime = Helpers.parseDateTime(stringDateTime);
      const dataFilter: CompositeDataFilter = {
        logic: "and",
        filters: [
          {
            logic: "and",
            filters: [
              {
                logic: "and",
                
                filters: [{ field: "field1", value: stringDateTime, operator: "eq", type: DataTypes.dateTime }],
              },
            ],
          },
        ],
      };

      const result = toCompositeFilterDescriptor(dataFilter);

      expect(result).toMatchObject({
        logic: "and",
        filters: [
          {
            logic: "and",
            filters: [
              {
                logic: "and",
                filters: [{logic: "and",filters: [{ field: "field1", value: dateTime, operator: "eq" }]}] ,
              },
            ],
          },
        ],
      });
    });

    it("convert empty date time Kendo CompositeFilterDescriptor filter", () => {
      expect(
        toCompositeFilterDescriptor({
          logic: "and",
          filters: [
            {
              logic: "and",
              filters: [
                {
                  logic: "and",
                  filters: [{ field: "field1", value: "", operator: "eq", type: DataTypes.dateTime }],
                },
              ],
            },
          ],
        })
      ).toMatchObject({
        logic: "and",
        filters: [
          {
            logic: "and",
            filters: [
              {
                logic: "and",
                filters: [{logic: "and",filters: [{ field: "field1", value: null, operator: "eq" }]}] ,
              },
            ],
          },
        ],
      });
    });

    it("Convert to CompositeDataFilter filter", () => {
      const date = Helpers.parseDate(Helpers.formatDate(new Date()));
      const dataFilter: CompositeFilterDescriptor = {
        logic: "and",
        filters: [
          {
            logic: "and",
            filters: [
              {
                logic: "and",
                filters: [
                  { field: "field1", value: date, operator: "eq" },
                  { field: "field2", value: "some", operator: "eq" },
                ],
              },
            ],
          },
        ],
      };

      const result = toCompositeDataFilter(dataFilter, (f, v) => {
        if (f == "field1") return DataTypes.date;
        return DataTypes.string;
      });

      expect(result).toMatchObject({
        logic: "and",
        filters: [
          {
            logic: "and",
            filters: [
              {
                logic: "and",
                filters: [
                  { field: "field1", value: Helpers.formatDate(date), operator: "eq", type: "date" },
                  { field: "field2", value: "some", operator: "eq", type: "string" },
                ],
              },
            ],
          },
        ],
      });
    });

    it("Convert dateTime to CompositeDataFilter filter", () => {
      const date = Helpers.parseDateTime(Helpers.formatDateTime(new Date()));
      const dataFilter: CompositeFilterDescriptor = {
        logic: "and",
        filters: [
          {
            logic: "and",
            filters: [
              {
                logic: "and",
                filters: [{ field: "field1", value: date, operator: "eq" }],
              },
            ],
          },
        ],
      };

      const result = toCompositeDataFilter(dataFilter, (f, v) => {
        return DataTypes.dateTime;
      });

      expect(result).toMatchObject({
        logic: "and",
        filters: [
          {
            logic: "and",
            filters: [
              {
                logic: "and",
                filters: [{ field: "field1", value: Helpers.formatDateTime(date), operator: "eq", type: "dateTime" }],
              },
            ],
          },
        ],
      });
    });

    it("Convert null date to CompositeDataFilter filter", () => {
      const date = Helpers.parseDate(Helpers.formatDate(new Date()));
      const dataFilter: CompositeFilterDescriptor = {
        logic: "and",
        filters: [
          {
            logic: "and",
            filters: [
              {
                logic: "and",
                filters: [{ field: "field1", value: null, operator: "eq" }],
              },
            ],
          },
        ],
      };

      const result = toCompositeDataFilter(dataFilter, (f, v) => {
        return DataTypes.date;
      });

      expect(result).toMatchObject({
        logic: "and",
        filters: [
          {
            logic: "and",
            filters: [
              {
                logic: "and",
                filters: [{ field: "field1", value: null, operator: "eq", type: "date" }],
              },
            ],
          },
        ],
      });
    });

    it("Convert null dateTime to CompositeDataFilter filter", () => {
      const date = Helpers.parseDateTime(Helpers.formatDateTime(new Date()));
      const dataFilter: CompositeFilterDescriptor = {
        logic: "and",
        filters: [
          {
            logic: "and",
            filters: [
              {
                logic: "and",
                filters: [{ field: "field1", value: null, operator: "eq" }],
              },
            ],
          },
        ],
      };

      const result = toCompositeDataFilter(dataFilter, (f, v) => {
        return DataTypes.dateTime;
      });

      expect(result).toMatchObject({
        logic: "and",
        filters: [
          {
            logic: "and",
            filters: [
              {
                logic: "and",
                filters: [{ field: "field1", value: null, operator: "eq", type: "dateTime" }],
              },
            ],
          },
        ],
      });
    });

    it("Custom filter tests", () => {
      expect(CustomFilterOperators.match("The rain in SPAIN stays mainly in the plain", "ain")).toBe(true);
      expect(CustomFilterOperators.match("The rain in SPAIN stays mainly in the plain", "NOMATCH")).toBe(false);

      expect(CustomFilterOperators.matchPhrase("quick brown fox", "quick fox")).toBe(true);
      expect(CustomFilterOperators.matchPhrase("quick brown fox", "NO MATCH")).toBe(false);
    });
  });
});
