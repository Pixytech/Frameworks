import "reflect-metadata";
import { UserSettingLaunchPayload } from "./UserSettingLaunchPayload";
import { FxRateDateType } from "../../FxRateDateType";
// Base Package
describe("Kinetix Monza Core", () => {
  let sut: UserSettingLaunchPayload;

  afterEach(() => {
    jest.clearAllMocks();
  });
  // Testing Component
  describe("UserSettingLaunchPayload", () => {
    it("parameterized constructor should initialize properties", () => {
      sut = new UserSettingLaunchPayload(
        {
          currencySettings: {
            reportingCCY: "USD",
            fxRateDateType: FxRateDateType.Current,
          },
        },
        "test"
      );
      expect(sut).not.toBeNull();
      expect(sut.type).toBe("test");
      expect(sut.preference.currencySettings.fxRateDateType).toBe(
        FxRateDateType.Current
      );
      expect(sut.preference.currencySettings.reportingCCY).toBe("USD");
    });
  });
});
