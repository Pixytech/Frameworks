// reflect-metadata is required for IOC
import "reflect-metadata";
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { createMock } from "ts-auto-mock";
import { arrange, hostComponent } from "../../../../../../../testing";
import { IFormAutoCompleteChildProps } from "../FormAutoComplete";
import { DropDownTreeTemplate } from "./DropDownTreeTemplate";
import { AutoCompleteModel, FormAutoCompleteField } from "../FormAutoCompleteField";

// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped module
  let props: IFormAutoCompleteChildProps;

  beforeEach(() => {
    props = createMock<IFormAutoCompleteChildProps>({ field: new FormAutoCompleteField() });
    props.field.placeholder = "select-option";
    props.field.displayName = "test";
    props.field.model.data = props.field.model.options = [
      {
        text: "Furniture",
        id: 1,
        items: [
          { text: "Tables & Chairs", id: 2 },
          { text: "Sofas", id: 3 },
          { text: "Occasional Furniture", id: 4 },
        ],
      },
      {
        text: "Decor",
        id: 5,
        items: [
          { text: "Bed Linen", id: 6 },
          { text: "Curtains & Blinds", id: 7 },
          { text: "Carpets", id: 8 },
        ],
      },
    ];

    props.field.model.expandState = [];
    props.field.displayName = "title";
  });

  afterEach(() => {
    cleanup();
    jest.resetAllMocks();
  });

  // Note: running cleanup afterEach is done automatically for you in @testing-library/react@9.0.0 or higher
  // unmount and cleanup DOM after the test is finished.
  afterEach(cleanup);

  // Testing Component
  describe("DropDownTreeTemplate", () => {
    it("should render DropDownTreeTemplate", async () => {
      let sut = hostComponent(<DropDownTreeTemplate {...props} />);
      const view = render(sut);

      // uncomment to see the html code
      // screen.debug();

      const field = view.getByRole("combobox");

      fireEvent.focus(field);
      fireEvent.blur(field);

      expect(screen.getByText("select-option")).toBeInTheDocument();
      fireEvent.click(screen.getByText("select-option"));
    });
  });
});
