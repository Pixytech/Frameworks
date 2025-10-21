// reflect-metadata is required for IOC
import "reflect-metadata";
import { UserPreferenceDataProvider } from "./UserPreferenceDataProvider";
import { FxRateDateType } from "../FxRateDateType";

// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped module
  let sut: UserPreferenceDataProvider;

  // Execute once before each tests
  // To create single module for each tests
  beforeEach(() => {
    sut = new UserPreferenceDataProvider();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // Testing Component
  describe("UserPreferenceDataProvider", () => {
    // TEST:  Kinetix Monza Core > UserSettins > getDefaultConfigurations should return valid response
    it("getDefaultConfigurations should return valid response", async () => {
      let defaultConfig = await sut.getDefaultConfigurations();

      expect(defaultConfig).not.toBeNull();
      expect(defaultConfig.length).toBe(1);
      expect(defaultConfig[0].application).toBe("Monza");
      expect(defaultConfig[0].category).toBe("Workspace");
      expect(defaultConfig[0].section).toBe("Dashboard");
      expect(defaultConfig[0].item).toBe("Preference");
      expect(defaultConfig[0].value.currencySettings.fxRateDateType).toBe(
        FxRateDateType.Current
      );
      expect(defaultConfig[0].value.currencySettings.reportingCCY).toBe("CAD");
    });
  });
});
