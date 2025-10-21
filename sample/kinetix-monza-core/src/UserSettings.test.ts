// reflect-metadata is required for IOC
import "reflect-metadata";
import { UserSettings } from "./UserSettings";
import { createMock } from "ts-auto-mock";
import { arrange } from "../../../testing";
import { IConfigurationService } from "@kinetix/core";
import { FxRateDateType } from "./FxRateDateType";

// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped module
  let sut: UserSettings;
  let mockConfigService: IConfigurationService;

  afterEach(() => {
    jest.resetAllMocks();
  });

  // Testing Component
  describe("UserSettings", () => {
    // TEST:  Kinetix Monza Core > UserSettings > getConfiguration should return valid response
    it("getConfiguration should return valid response", async () => {
      mockConfigService = createMock<IConfigurationService>();
      arrange(mockConfigService).stubMethod("getConfiguration", () => {
        return {
          value: {
            currencySettings: {
              reportingCCY: "CAD",
              fxRateDateType: FxRateDateType.Current,
            },
          },
        };
      });
      sut = new UserSettings(mockConfigService);

      await sut.initialize();

      expect(sut).not.toBeNull();
      expect(mockConfigService.getConfiguration).toBeCalled();
      expect(sut.preference).not.toBeNull();
      expect(sut.preference.currencySettings.reportingCCY).toBe("CAD");
      expect(sut.preference.currencySettings.fxRateDateType).toBe(
        FxRateDateType.Current
      );
    });

    it("should save user setting", async () => {
      mockConfigService = createMock<IConfigurationService>();
      arrange(mockConfigService).stubMethod("saveConfiguration", () => {});
      sut = new UserSettings(mockConfigService);

      arrange(sut).stubProperty("preference", () => {
        return {
          currencySettings: {
            reportingCCY: "USD",
            fxRateDateType: FxRateDateType.Execution,
          },
        };
      });

      await sut.saveSetting({
        currencySettings: {
          reportingCCY: "USD",
          fxRateDateType: FxRateDateType.Execution,
        },
      });

      expect(sut).not.toBeNull();
      expect(mockConfigService.saveConfiguration).toBeCalled();
    });
  });
});
