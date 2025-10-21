// reflect-metadata is required for IOC
import "reflect-metadata";
import React from "react";
import { createMock } from "ts-auto-mock";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { clearStubs, hostComponent } from "../../../../../../../../testing";

import { BlotterCellFormatOptionsPopupModel, IBlotterCellFormatOptionsPopup } from "@kinetix/monza-core";
import { BlotterFormatOptionsPopupView } from "./FormatOptionsPopupView";
// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped module

  let mockViewModel: IBlotterCellFormatOptionsPopup;

  beforeEach(() => {
    mockViewModel = createMock<IBlotterCellFormatOptionsPopup>({ model: new BlotterCellFormatOptionsPopupModel() });
  });

  // Note: running cleanup afterEach is done automatically for you in @testing-library/react@9.0.0 or higher
  // unmount and cleanup DOM after the test is finished.
  afterEach(() => {
    cleanup();
    jest.resetAllMocks();
    clearStubs();
  });

  // Testing Component
  describe("FormatOptionsPopupView", () => {
    // TEST:  IDP > RepositoryView > component should be created without style attribute
    it("component render component", async () => {
      mockViewModel.model.formats = {
        textStyles: {
          bold: true,
          italic: true,
          underline: true,
          strikethrough: true,
          textColor: "red",
        },
        applyToRow: true,
        backgroundColor: "blue",
      };
      let sut = hostComponent(<BlotterFormatOptionsPopupView dataContext={mockViewModel} />);

      const view = render(sut);
      expect(screen.getByTestId("Edit-format")).toBeInTheDocument();

      fireEvent.click(screen.getByTestId("Edit-format"));
      expect(mockViewModel.showPopup).toBeCalled();
    });

    it("component render popup", async () => {
      mockViewModel.model.isPopupVisible = true;
      mockViewModel.model.formats = {
        textStyles: {
          bold: true,
          italic: true,
          underline: true,
          strikethrough: true,
          textColor: "red",
        },
        applyToRow: true,
        backgroundColor: "blue",
      };
      let sut = hostComponent(<BlotterFormatOptionsPopupView dataContext={mockViewModel} />);

      const view = render(sut);
      expect(screen.getByTestId("Edit-format")).toBeInTheDocument();

      fireEvent.click(screen.getByTestId("Edit-format"));

      expect(mockViewModel.closePopup).toBeCalled();
      fireEvent.click(screen.getByText("Delete"));
      expect(mockViewModel.handleDelete).toBeCalled();
    });
  });
});
