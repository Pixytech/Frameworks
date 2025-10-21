// reflect-metadata is required for IOC
import "reflect-metadata";

import { createMock } from "ts-auto-mock";
import { IFormViewModel } from "../../IFormViewModel";
import { FormModel } from "../../FormModel";
import { FormDateRangeField } from "./FormDateRangeField";
import { DateRangePickerHandle } from "@progress/kendo-react-dateinputs";
import { waitFor } from "@testing-library/react";

// Base Package
describe("Kinetix Monza core", () => {
  // Scoped module
  let sut: FormDateRangeField;
  let mockOwner: IFormViewModel<FormModel>;
  // Execute once before all tests
  // To create single module for all tests
  beforeEach(() => {
    mockOwner = createMock<IFormViewModel<FormModel>>({ model: new (class e extends FormModel {})() });
    sut = new FormDateRangeField(mockOwner);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("FormDateRangeField", () => {
    it("should have model", async () => {
      await sut.initialize();
      expect(sut.model).not.toBeNull();
    });

    it("should calculate date range", () => {
      // T
      expect(sut.calculateDateRange("T", new Date(2023, 1, 5)).start).toStrictEqual(new Date(2023, 1, 5));

      // TW
      expect(sut.calculateDateRange("TW", new Date(2023, 5, 6)).start).toStrictEqual(new Date(2023, 5, 5));
      expect(sut.calculateDateRange("TW", new Date(2023, 5, 4)).start).toStrictEqual(new Date(2023, 4, 29));

      // MTD
      expect(sut.calculateDateRange("MTD", new Date(2023, 1, 5)).start).toStrictEqual(new Date(2023, 1));
      expect(sut.calculateDateRange("MTD", new Date(2023, 2, 20)).start).toStrictEqual(new Date(2023, 2));

      // QTD
      expect(sut.calculateDateRange("QTD", new Date(2023, 0)).start).toStrictEqual(new Date(2023, 0));
      expect(sut.calculateDateRange("QTD", new Date(2023, 1)).start).toStrictEqual(new Date(2023, 0));
      expect(sut.calculateDateRange("QTD", new Date(2023, 2)).start).toStrictEqual(new Date(2023, 0));
      expect(sut.calculateDateRange("QTD", new Date(2023, 3)).start).toStrictEqual(new Date(2023, 3));
      expect(sut.calculateDateRange("QTD", new Date(2023, 4)).start).toStrictEqual(new Date(2023, 3));
      expect(sut.calculateDateRange("QTD", new Date(2023, 5)).start).toStrictEqual(new Date(2023, 3));
      expect(sut.calculateDateRange("QTD", new Date(2023, 6)).start).toStrictEqual(new Date(2023, 6));
      expect(sut.calculateDateRange("QTD", new Date(2023, 7)).start).toStrictEqual(new Date(2023, 6));
      expect(sut.calculateDateRange("QTD", new Date(2023, 8)).start).toStrictEqual(new Date(2023, 6));
      expect(sut.calculateDateRange("QTD", new Date(2023, 9)).start).toStrictEqual(new Date(2023, 9));
      expect(sut.calculateDateRange("QTD", new Date(2023, 10)).start).toStrictEqual(new Date(2023, 9));
      expect(sut.calculateDateRange("QTD", new Date(2023, 11)).start).toStrictEqual(new Date(2023, 9));

      // YTD
      expect(sut.calculateDateRange("YTD", new Date(2023, 5)).start).toStrictEqual(new Date(2023, 0));
    });

    it("handleAccelerator", () => {
      const mockHandle = createMock<DateRangePickerHandle>();
      sut.handleAccelerator(mockHandle, "T");
      const current = new Date(Date.now());
      expect(sut.value.start).toStrictEqual(new Date(current.getFullYear(), current.getMonth(), current.getDate()));
    });

    it("handleAcceleratorPopup", async () => {
      const mockHandle = createMock<DateRangePickerHandle>();
      sut.setValue = jest.fn();
      sut.handleAcceleratorPopup(false);
      await waitFor(() => {
        expect(sut.setValue).toBeCalled();
      });
    });
  });
});
