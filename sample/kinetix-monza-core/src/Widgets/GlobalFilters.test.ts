// reflect-metadata is required for IOC
import "reflect-metadata";
import { GlobalFilters } from "./GlobalFilters";
import { FxRateDateType } from "../FxRateDateType";
import { CompositeDataFilter } from "../Data";

// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped module
  let sut: GlobalFilters;

  // Execute once before all tests
  // To create single module for all tests
  beforeEach(() => {
    sut = new GlobalFilters();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // Testing Component
  describe("GlobalFilters", () => {
    it("changePreference should raise event for preferences", () => {
      let mockCallback = jest.fn();
      sut.onSettingChanged.subscribe((args) => {
        mockCallback(args);
      });

      sut.changePreference({
        currencySettings: {
          reportingCCY: "JPY",
          fxRateDateType: FxRateDateType.Current,
        },
      });

      let item = sut.preference;
      expect(item.currencySettings.fxRateDateType).toStrictEqual(
        FxRateDateType.Current
      );
      expect(item.currencySettings.reportingCCY).toStrictEqual("JPY");

      setTimeout(() => {
        expect(mockCallback).toBeCalledWith("Preference");
      }, 600);
    });

    it("changeFilters should raise event for Filter", () => {
      let mockCallback = jest.fn();
      sut.onSettingChanged.subscribe((args) => {
        mockCallback(args);
      });

      let filter: CompositeDataFilter = { logic: "and", filters: [] };
      sut.changeFilters(filter);
      let item = sut.filters;
      expect(item).toStrictEqual(filter);

      setTimeout(() => {
        expect(mockCallback).toBeCalledWith("Filter");
      }, 600);
    });
  });
});
