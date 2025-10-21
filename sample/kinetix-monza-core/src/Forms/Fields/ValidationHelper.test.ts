import "reflect-metadata";
import "@testing-library/jest-dom";
import { ValidationHelper } from "./ValidationHelper";
import { ValidationType } from "./ValidationType";
// Base Package
describe("Kinetix Monza Core", () => {
  // Testing Component
  describe("ValidationHelper", () => {
    it("getValidation", () => {
      let nullMessage = ValidationHelper.getValidation(null);
      expect(nullMessage.message).toBe("");
      expect(nullMessage.type).toBe(ValidationType.Default);

      let infoMessage = ValidationHelper.getValidation("Info: My Info Message");
      expect(infoMessage.type).toBe(ValidationType.Info);

      let warningMessage = ValidationHelper.getValidation(
        "Warning: My Warning Message"
      );
      expect(warningMessage.type).toBe(ValidationType.Warning);

      let errorMessage = ValidationHelper.getValidation(
        "Error: My Error Message"
      );
      expect(errorMessage.type).toBe(ValidationType.Error);
    });

    it("getValidationClass", () => {
      expect(
        ValidationHelper.getValidationClass(ValidationType.Warning)
      ).toContain("validation-warning");
      expect(
        ValidationHelper.getValidationClass(ValidationType.Error)
      ).toContain("validation-error");
      expect(
        ValidationHelper.getValidationClass(ValidationType.Info)
      ).toContain("validation-info");
    });
  });
});
