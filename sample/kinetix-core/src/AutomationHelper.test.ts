// reflect-metadata is required for IOC
import "reflect-metadata";
import { AutomationHelper } from "./AutomationHelper";


// Base Package
describe("Kinetix Core", () => {
  // Testing Component
  describe("AutomationHelper", () => {
    // TEST:  Kinetix Core > AutomationHelper > GetId should return replace symbol and space with `-`
    it("GetId should return replace symbol and space with `-`", () => {
      let getId1 = AutomationHelper.GetId("test");
      let getId2 = AutomationHelper.GetId("test Another");
      let getId3 = AutomationHelper.GetId("Test Symbol ( 1 )");
      expect(getId1).not.toBeNull();
      expect(getId1).toBe("test");
      expect(getId2).not.toBeNull();
      expect(getId2).toBe("test-Another");
      expect(getId3).not.toBeNull();
      expect(getId3).toBe("Test-Symbol---1--");
    });

    // TEST:  Kinetix Core > AutomationHelper > GetIdForLabel should return object where key = `data-automationid` and value modified
    it("GetIdForLabel should return object where key = `data-automationid` and value modified", () => {
      let getId1 = AutomationHelper.GetIdForLabel("test");
      let getId2 = AutomationHelper.GetIdForLabel("test Another");
      let getId3 = AutomationHelper.GetIdForLabel("Test Symbol ( 1 )");
      expect(getId1).not.toBeNull();
      expect(getId1).toStrictEqual({ key: "data-automationid", value: "test" });
      expect(getId2).not.toBeNull();
      expect(getId2).toStrictEqual({
        key: "data-automationid",
        value: "test-Another",
      });
      expect(getId3).not.toBeNull();
      expect(getId3).toStrictEqual({
        key: "data-automationid",
        value: "Test-Symbol---1--",
      });
    });

    // TEST:  Kinetix Core > AutomationHelper > GetValidationIconIdForLabel should return object where key = `data-validationError` and value modified
    it("GetValidationIconIdForLabel should return object with key, value properties", () => {
      let getId1 = AutomationHelper.GetValidationIconIdForLabel("test");
      let getId2 = AutomationHelper.GetValidationIconIdForLabel("test Another");
      let getId3 =
        AutomationHelper.GetValidationIconIdForLabel("Test Symbol ( 1 )");
      expect(getId1).not.toBeNull();
      expect(getId1).toStrictEqual({
        key: "data-validationError",
        value: "test",
      });
      expect(getId2).not.toBeNull();
      expect(getId2).toStrictEqual({
        key: "data-validationError",
        value: "test-Another",
      });
      expect(getId3).not.toBeNull();
      expect(getId3).toStrictEqual({
        key: "data-validationError",
        value: "Test-Symbol---1--",
      });
    });

    // TEST:  Kinetix Core > AutomationHelper > GetValidationTootipIdForLabel should return object where key = `data-validationError` and value modified
    it("GetValidationTootipIdForLabel should return object with key, value properties", () => {
      let getId1 = AutomationHelper.GetValidationTootipIdForLabel("test");
      let getId2 =
        AutomationHelper.GetValidationTootipIdForLabel("test Another");
      let getId3 =
        AutomationHelper.GetValidationTootipIdForLabel("Test Symbol ( 1 )");
      expect(getId1).not.toBeNull();
      expect(getId1).toStrictEqual({ key: "data-validation", value: "test" });
      expect(getId2).not.toBeNull();
      expect(getId2).toStrictEqual({
        key: "data-validation",
        value: "test-Another",
      });
      expect(getId3).not.toBeNull();
      expect(getId3).toStrictEqual({
        key: "data-validation",
        value: "Test-Symbol---1--",
      });
    });
  });
});
