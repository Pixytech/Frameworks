// reflect-metadata is required for IOC
import "reflect-metadata";
import React from "react";
import { cleanup, render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { createMock } from "ts-auto-mock";
import { IContainer } from "@kinetix/core";

import { DataTypes } from "../../../../Data";
import { hostComponent } from "../../../../../../../testing";
import { BlotterCellFormattingView, GridOperationModes, IBlotterCellFormatting } from "../../../..";

// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped module
  let mockContainer: IContainer;
  let mockBlotterCellFormatting: IBlotterCellFormatting;

  let datasetDefCol1 = {
    name: "assetClass",
    displayName: "Asset",
    displayField: "assetClass",
    order: 0,
    type: DataTypes.string,
    field: "assetClass",
    objectName: "assetClass",
    groupable: true,
    aggregable: true,
    useAsParameter: true,
    isArray: true,
    sortable: true,
    allowMultipleValues: true,
    forceUTC: true,
    primaryDisplayName: true,
    defaultColumn: true,
    nested: true,
    possibleValues: [],
    enumType: "string",
    alternativeFields: [],
  };

  let datasetDefCol2 = {
    name: "name",
    displayName: "Name",
    displayField: "name",
    order: 0,
    type: DataTypes.string,
    field: "name",
    objectName: "name",
    groupable: true,
    aggregable: true,
    useAsParameter: true,
    isArray: true,
    sortable: true,
    allowMultipleValues: true,
    forceUTC: true,
    primaryDisplayName: true,
    defaultColumn: true,
    nested: true,
    possibleValues: [],
    enumType: "string",
    alternativeFields: [],
  };

  beforeEach(() => {
    mockContainer = createMock<IContainer>();
    mockBlotterCellFormatting = createMock<IBlotterCellFormatting>();
    mockBlotterCellFormatting.model.gridMode = GridOperationModes.Server;
    mockBlotterCellFormatting.columns = [datasetDefCol1, datasetDefCol2];
    // mockBlotterCustomFilter.model.filters
  });

  // Note: running cleanup afterEach is done automatically for you in @testing-library/react@9.0.0 or higher
  // unmount and cleanup DOM after the test is finished.

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  // Testing Component
  describe("BlotterCellFormattingView", () => {
    // TEST:  Kinetix Monza Core > BlotterView > component should be created without style attribute
    it("Render with no formatGroups", async () => {
      let sut = hostComponent(<BlotterCellFormattingView dataContext={mockBlotterCellFormatting} />, mockContainer);
      const view = render(sut);
      // uncomment to see the html code
      // screen.debug();

      expect(view).not.toBeNull();
    });
  });
});
