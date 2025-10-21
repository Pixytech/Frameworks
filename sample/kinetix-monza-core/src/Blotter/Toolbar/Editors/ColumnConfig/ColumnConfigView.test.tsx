// reflect-metadata is required for IOC
import "reflect-metadata";
import React from "react";
import { createMock } from "ts-auto-mock";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BlotterColumnConfigView } from "./ColumnConfigView";
import { BlotterColumnConfigModel, DataTypes, IBlotterColumnConfig } from "@kinetix/monza-core";
import { arrange, clearStubs, hostComponent } from "../../../../../../../testing";

// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped module

  let mockViewModel: IBlotterColumnConfig;

  beforeEach(() => {
    mockViewModel = createMock<IBlotterColumnConfig>({ model: new BlotterColumnConfigModel() });
  });

  // Note: running cleanup afterEach is done automatically for you in @testing-library/react@9.0.0 or higher
  // unmount and cleanup DOM after the test is finished.
  afterEach(() => {
    cleanup();
    jest.resetAllMocks();
    clearStubs();
  });

  // Testing Component
  describe("ColumnConfigView.test", () => {
    // TEST:  IDP > RepositoryView > component should be created without style attribute
    it("component render component", async () => {
      arrange(mockViewModel).stubMethod("getFilteredColumns", () => [
        {
          name: "field",
          displayName: "fieldName",
          selected: true,
          order: 0,
          type: DataTypes.string,
        },
      ]);
      let sut = hostComponent(<BlotterColumnConfigView dataContext={mockViewModel} />);

      const view = render(sut);

      const option = screen.getAllByRole("option")[0];

      fireEvent.click(option);
      expect(screen.getAllByRole("option")[0]).toBeInTheDocument();
    });
  });
});
