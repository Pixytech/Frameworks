import { IDocument } from "@kinetix/idp-core";
import { Helpers } from "@kinetix/monza-core";
import { createMock } from "ts-auto-mock";

const dummyDate = "2024-12-01 12:00:00 GMT";
describe("Kinetix Monza", () => {
  describe("Helpers class", () => {
    it("should convert timestamp string to locale date and time", () => {
      expect(Helpers.localeDateAndTime(dummyDate)).toBe("Dec / 01 / 2024 12:00:00 PM");
    });

    it("should convert timestamp string to humanaly readable value", () => {
      expect(Helpers.timeFrom(dummyDate)).toContain("ago");
    });

    it("should serializeObject the the given object", () => {
      expect(Helpers.serializeObject({ id: "123", filename: "test" })).toBe('{"id":"123","filename":"test"}');
    });

    it("should deserializeObject the the given string", () => {
      expect(Helpers.deserializeObject('{"id":"123","filename":"test"}')).toStrictEqual({ id: "123", filename: "test" });
    });

    it("should check if both days are equal or not", () => {
      expect(Helpers.areDatesEqual(new Date(), new Date())).toBe(true);
      expect(Helpers.areDatesEqual(new Date(), new Date(1738551384))).toBe(false);
    });
  });
});
