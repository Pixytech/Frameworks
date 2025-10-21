// reflect-metadata is required for IOC
import "reflect-metadata";
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { createMock } from "ts-auto-mock";
import { hostComponent } from "../../../../../../../testing";
import { IFormAutoCompleteChildProps } from "../FormAutoComplete";
import { MultiSelectTemplate } from "./MultiSelectTemplate";

// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped module
  let props: IFormAutoCompleteChildProps;

  beforeEach(() => {
    props = createMock<IFormAutoCompleteChildProps>();
    props.field.placeholder = "test";
    props.field.model.value = [{ title: "Test Title", value: "tst" }];
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
  describe("MultiSelectTemplate", () => {
    it("should render MultiSelectTemplate", async () => {
      let sut = hostComponent(<MultiSelectTemplate {...props} />);
      const view = render(sut);

      // uncomment to see the html code
      // screen.debug();

      const field = view.getByRole("combobox");

      fireEvent.focus(field);
      fireEvent.blur(field);

      await waitFor(() => {
        expect(view).not.toBeNull();
      });
    });
  });
});
