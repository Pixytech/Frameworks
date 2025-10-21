// reflect-metadata is required for IOC
import "reflect-metadata";
import { FormNumericField } from "..";
import { createMock } from "ts-auto-mock";
import { NumericTextBoxHandle } from "@progress/kendo-react-inputs";
import { waitFor } from "@testing-library/react";
import { DataTypes } from "../../../Data";

// Base Package
describe("Kinetix Monza Core", () => {
  // Testing Component
  describe("FormNumericField", () => {
    let sut: FormNumericField;

    beforeAll(() => {
      sut = new FormNumericField();
      sut.fieldType = DataTypes.number;
    });

    it("Set metadata", () => {
      sut.setMetaData({
        fieldType: "number",
        mandatory: true,
        precision: 10,
        constraints: [
          { type: "minValue", min: 5 },
          { type: "maxValue", max: 15 },
          { type: "mandatory", allowEmpty: true },
        ],
      });
      expect(sut.min).toBe(5);
      expect(sut.max).toBe(15);
      expect(sut.precision).toBe(10);
      expect(sut.model.allowEmpty).toBe(true);
      expect(sut.model.required).toBe(true);
    });

    it("Set value", () => {
      sut.setValue(1);
      expect(sut.value).toEqual(1);
      sut.value = 2;
      expect(sut.value).toEqual(2);

      sut.value = null;
      expect(sut.getValueOrDefault()).toEqual(0);
    });

    it("Set value with  scale", () => {
      sut.scale = 10;
      sut.setValue(1);
      expect(sut.value).toEqual(10);
    });

    it("handleAccelerator", () => {
      const mockHandle = createMock<NumericTextBoxHandle>();
      sut.handleAccelerator(mockHandle, 100);
      expect(sut.value).toEqual(1000000000);
    });

    it("onKeyDown arrow + ctrl", () => {
      const keyDown = createMock<React.KeyboardEvent<HTMLElement>>();
      keyDown.key = "ArrowDown";
      keyDown.ctrlKey = true;
      sut.EnableAcelerator = true;
      sut.onKeyDown(keyDown);
      expect(sut.show).toBe(true);
    });

    it("onKeyDown shortcut for million", () => {
      const keyDown = createMock<React.KeyboardEvent<HTMLElement>>();
      sut.setValue(10);
      keyDown.key = "m";
      sut.onKeyDown(keyDown);
      expect(sut.value).toBe(100);
    });

    it("handleAcceleratorPopup", async () => {
      const mockHandle = createMock<NumericTextBoxHandle>();
      sut.setValue = jest.fn();
      sut.handleAcceleratorPopup(false);
      await waitFor(() => {
        expect(sut.setValue).toBeCalled();
      });
    });

    it("getSubmitValue should return right data", async () => {
      sut.model.value = null;
      sut.fieldType = DataTypes.numeric;
      sut.model.allowEmpty = true;
      expect(sut.getSubmitValue()).toBe(null);

      sut.model.allowEmpty = false;
      sut.precision = 5;
      expect(sut.getSubmitValue()).toMatchObject({ scale: 5, value: 0 });

      sut.model.value = 100;
      sut.precision = 5;
      sut.scale = 2;
      expect(sut.getSubmitValue()).toMatchObject({ scale: 5, value: 50 });

      sut.model.value = 100;
      sut.precision = 0;
      sut.scale = 2;
      expect(sut.getSubmitValue()).toMatchObject({ scale: 0, value: 50 });
    });
  });
});
