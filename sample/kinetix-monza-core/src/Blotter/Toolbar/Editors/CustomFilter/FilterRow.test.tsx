// reflect-metadata is required for IOC
import "reflect-metadata";
import React from "react";
import { cleanup, fireEvent, screen, render } from "@testing-library/react";

import "@testing-library/jest-dom";
import { getOperatorsByType } from "../../../Utils/Operators";
import { DataTypes } from "../../../../Data";
import { IBlotterFilterRowProps, BlotterFilterRow } from "./FilterRow";
import { createMock } from "ts-auto-mock";
import { hostComponent } from "../../../../../../../testing";

// Base Package
describe("Kinetix Monza Core", () => {
  let props: IBlotterFilterRowProps;

  beforeEach(() => {
    props = createMock<IBlotterFilterRowProps>();
    props.columns = [
      {
        name: "id",
        displayName: "My Id",
        displayField: "displayName",
        order: 0,
        type: DataTypes.string,
        field: "id",
        objectName: "test",
        groupable: false,
        aggregable: false,
        useAsParameter: false,
        isArray: false,
        sortable: false,
        allowMultipleValues: false,
        forceUTC: false,
        primaryDisplayName: false,
        defaultColumn: false,
        nested: false,
        possibleValues: [],
        enumType: "",
        alternativeFields: [],
      },
      {
        name: "counterparty",
        displayName: "My Counterparty",
        displayField: "displayName",
        order: 0,
        type: DataTypes.string,
        field: "counterparty",
        objectName: "test",
        groupable: false,
        aggregable: false,
        useAsParameter: false,
        isArray: false,
        sortable: false,
        allowMultipleValues: false,
        forceUTC: false,
        primaryDisplayName: false,
        defaultColumn: false,
        nested: false,
        possibleValues: [],
        enumType: "",
        alternativeFields: [],
      },
      {
        name: "date",
        displayName: "My Date",
        displayField: "displayName",
        order: 0,
        type: DataTypes.date,
        field: "date",
        objectName: "test",
        groupable: false,
        aggregable: false,
        useAsParameter: false,
        isArray: false,
        sortable: false,
        allowMultipleValues: false,
        forceUTC: false,
        primaryDisplayName: false,
        defaultColumn: false,
        nested: false,
        possibleValues: [],
        enumType: "",
        alternativeFields: [],
      },
    ];
  });

  // Note: running cleanup afterEach is done automatically for you in @testing-library/react@9.0.0 or higher
  // unmount and cleanup DOM after the test is finished.
  afterEach(cleanup);

  let initializeComponent = (
    field: string,
    operator: any,
    value: any
  ): JSX.Element => {
    // props.field = field;
    // props.operator  =operator;
    // props.value = value;
    return hostComponent(
      <>
        <table>
          <tbody>
            <tr>
              <BlotterFilterRow
                {...props}
                field={field}
                operator={operator}
                value={value}
              />
            </tr>
          </tbody>
        </table>
      </>
    );
  };

  // Testing Component
  describe("FilterRow", () => {
    it("Test Change Field", () => {
      let sut = initializeComponent(
        "id",
        getOperatorsByType(DataTypes.string)[0],
        "initialValue"
      );

      const view = render(sut);
      // uncomment to see the html code
      // screen.debug();

      const fieldsSelector = view.container.querySelector(
        ".fields"
      ) as HTMLElement;

      expect(fieldsSelector).not.toBeNull();
      expect(screen.getByText("My Id"));

      fireEvent.click(fieldsSelector!);

      let fieldOptions = screen.getAllByRole("option");
      fireEvent.click(fieldOptions[1]);

      expect(screen.getAllByText("My Counterparty"));

      fireEvent.click(fieldsSelector!);

      fieldOptions = screen.getAllByRole("option");
      fireEvent.click(fieldOptions[2]);

      expect(screen.getAllByText("My Date"));
    });

    it("Test Change Operator", () => {
      let sut = initializeComponent(
        "id",
        getOperatorsByType(DataTypes.string)[0],
        "initialValue"
      );

      const defaultOperator: any = getOperatorsByType(DataTypes.string)[0];
      const secondOperator: any = getOperatorsByType(DataTypes.string)[1];

      const view = render(sut);
      // uncomment to see the html code
      // screen.debug();

      const operatorSelector = view.container.querySelector(
        ".operators"
      ) as HTMLElement;

      expect(operatorSelector).not.toBeNull();
      expect(screen.getByText(defaultOperator.message));

      fireEvent.click(operatorSelector!);

      const operatorOptions = screen.getAllByRole("option");
      fireEvent.click(operatorOptions[1]);

      expect(screen.getAllByText(secondOperator.message));
    });

    it("Test Change Value", () => {
      let sut = initializeComponent(
        "id",
        getOperatorsByType(DataTypes.string)[0],
        "initialValue"
      );

      const view = render(sut);

      const valueInput = view.container.querySelector(".value");

      expect(valueInput).not.toBeNull();

      fireEvent.change(valueInput!, { target: { value: "testValue" } });

      expect(screen.getByDisplayValue("testValue"));
    });

    it("Test Change Value Date", () => {
      let sut = initializeComponent(
        "date",
        getOperatorsByType(DataTypes.enum)[0],
        "2023-04-01"
      );

      const view = render(sut);

      const dateInput = view.container
        .querySelector(".k-dateinput")
        ?.querySelector(".k-input-inner");

      expect(dateInput).not.toBeNull();

      fireEvent.doubleClick(dateInput!);

      // Change month
      fireEvent.input(dateInput!, { target: { value: "5" } });

      expect(screen.getByDisplayValue("5/1/2023"));
    });
  });
});
