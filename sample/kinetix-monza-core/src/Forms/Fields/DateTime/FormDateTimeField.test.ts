// reflect-metadata is required for IOC
import "reflect-metadata";
import { FormDateTimeField } from "./FormDateTimeField";

// Base Package
describe("Kinetix Monza Core", () => {
  // Testing Component
  describe("FormDataTimeField", () => {
    let field: FormDateTimeField;

    beforeAll(() => {
      field = new FormDateTimeField();
    });

    it("Set DateTime", () => {
      field.setValue("2023-03-06 16:00:00.000 UTC");
      expect(field.value).toEqual(new Date("2023-03-06 16:00:00.000 UTC"));
    });

    it("Set Date", () => {
      field.setValue("2023-03-06");
      expect(field.value?.getHours()).toEqual(0);
      expect(field.metaPath).not.toBeDefined();
    });
  });
});
