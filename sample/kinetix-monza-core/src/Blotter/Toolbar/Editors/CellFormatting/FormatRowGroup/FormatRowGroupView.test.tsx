// reflect-metadata is required for IOC
import "reflect-metadata";
import React from "react";
import { cleanup, render } from "@testing-library/react";
import { BlotterCellFormatOptionsPopupViewModel, BlotterCellFormatRowGroupView, DataTypes, IBlotterCellFormatOptionsPopupType, IBlotterCellFormatRowGroup } from "@kinetix/monza-core";

import "@testing-library/jest-dom";
import { createMock } from "ts-auto-mock";
import { CoreTypes, IContainer, IViewResolver } from "@kinetix/core";
import { arrange, hostComponent } from "../../../../../../../../testing";

// Base Package
describe("Kinetix Monza Core", () => {
  let container: IContainer;
  let sut: JSX.Element;
  let mockViewModel: IBlotterCellFormatRowGroup;

  beforeEach(() => {
    const enumColum = {
      name: "assetClass1",
      displayName: "Asset1",
      displayField: "assetClass1",
      order: 0,
      type: DataTypes.enum,
      field: "assetClass1",
      objectName: "assetClass1",
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

    const blotterColumnDef = {
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

    const dateCol = {
      name: "assetClass2",
      displayName: "Asset2",
      displayField: "assetClass2",
      order: 0,
      type: DataTypes.date,
      field: "assetClass2",
      objectName: "assetClass2",
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

    const intCol = {
      name: "assetClass3",
      displayName: "Asset3",
      displayField: "assetClass3",
      order: 0,
      type: DataTypes.int,
      field: "assetClass3",
      objectName: "assetClass3",
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

    container = createMock<IContainer>();
    arrange(container)
      .stubMethod("build", () => new BlotterCellFormatOptionsPopupViewModel(), [IBlotterCellFormatOptionsPopupType])
      .stubMethod(
        "build",
        () => {
          return createMock<IViewResolver>();
        },
        [CoreTypes.IViewResolver]
      );

    mockViewModel = createMock<IBlotterCellFormatRowGroup>();

    mockViewModel.columns = [blotterColumnDef, enumColum, dateCol, intCol];

    sut = hostComponent(
      <>
        <table>
          <tbody>
            <tr>
              <BlotterCellFormatRowGroupView dataContext={mockViewModel} />
            </tr>
          </tbody>
        </table>
      </>,
      container
    );
  });

  // Note: running cleanup afterEach is done automatically for you in @testing-library/react@9.0.0 or higher
  // unmount and cleanup DOM after the test is finished.
  afterEach(cleanup);

  // Testing Component
  describe("BlotterCellFormatRowGroupView", () => {
    it("Render", () => {
      mockViewModel.model.format = {
        column: mockViewModel.columns[0],
        conditions: [
          {
            opretaor: {
              text: "filter.eqOperator",
              operator: "eq",
            },
            value: "test",
            format: undefined,
            priority: 0,
          },
        ],
        priority: 0,
      };

      let view = render(sut);
      // uncomment to see the html code
      // screen.debug();

      expect(view).not.toBeNull();

      mockViewModel.model.format = {
        column: mockViewModel.columns[1],
        conditions: [
          {
            opretaor: {
              text: "filter.eqOperator",
              operator: "eq",
            },
            value: "test",
            format: undefined,
            priority: 0,
          },
        ],
        priority: 0,
      };

      view = render(sut);
      // uncomment to see the html code
      // screen.debug();

      expect(view).not.toBeNull();

      mockViewModel.model.format = {
        column: mockViewModel.columns[2],
        conditions: [
          {
            opretaor: {
              text: "filter.eqOperator",
              operator: "eq",
            },
            value: "test",
            format: undefined,
            priority: 0,
          },
        ],
        priority: 0,
      };

      view = render(sut);
      // uncomment to see the html code
      // screen.debug();

      expect(view).not.toBeNull();

      mockViewModel.model.format = {
        column: mockViewModel.columns[3],
        conditions: [
          {
            opretaor: {
              text: "filter.eqOperator",
              operator: "eq",
            },
            value: "test",
            format: undefined,
            priority: 0,
          },
        ],
        priority: 0,
      };

      view = render(sut);
      // uncomment to see the html code
      // screen.debug();

      expect(view).not.toBeNull();

      mockViewModel.model.format = {
        column: mockViewModel.columns[4],
        conditions: [
          {
            opretaor: {
              text: "filter.eqOperator",
              operator: "eq",
            },
            value: "test",
            format: undefined,
            priority: 0,
          },
        ],
        priority: 0,
      };

      view = render(sut);
      // uncomment to see the html code
      // screen.debug();

      expect(view).not.toBeNull();
    });
  });
});
