// reflect-metadata is required for IOC
import "reflect-metadata";
import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { createMock } from "ts-auto-mock";
import { arrange, hostComponent } from "../../../../../../../testing";
import { IFormAutoCompleteChildProps } from "../FormAutoComplete";
import { ComboBoxTemplate } from "./ComboBoxTemplate";
import { FormAutoCompleteField } from "../FormAutoCompleteField";

// Base Package
describe("IDP", () => {
  // Scoped module
  let props: IFormAutoCompleteChildProps;

  beforeEach(() => {
    props = createMock<IFormAutoCompleteChildProps>();
    props.field = new FormAutoCompleteField();
    props.field.placeholder = "test";

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
  describe("ComboBoxTemplate", () => {
    it("should render tooltip ComboBoxTemplate", async () => {
      props.field.setValue({ title: "Test Title", value: "tst" });
      let sut = hostComponent(<ComboBoxTemplate {...props} />);
      const view = render(sut);

      // uncomment to see the html code
      //screen.debug();

      await waitFor(() => {
        expect(view.container.querySelector(`span[title="Test Title"]` + "")).toBeInTheDocument();
        expect(view).not.toBeNull();
      });
    });

    it("should render tooltip ComboBoxTemplate multiple value", async () => {
      props.field.selection = "Multiple";
      props.field.setValue([
        { title: "Test Title", value: "tst" },
        { title: "Test Title2", value: "tst" },
      ]);
      let sut = hostComponent(<ComboBoxTemplate {...props} />);
      const view = render(sut);

      // uncomment to see the html code
      //screen.debug();

      await waitFor(() => {
        expect(view.container.querySelector(`span[title="Test Title,Test Title2"]` + "")).toBeInTheDocument();
        expect(view).not.toBeNull();
      });
    });

    it("should render tooltip ComboBoxTemplate default", async () => {
      let sut = hostComponent(<ComboBoxTemplate {...props} />);
      const view = render(sut);

      await waitFor(() => {
        expect(view.container.querySelector(`span[title="Choose an option"]` + "")).toBeInTheDocument();
        expect(view).not.toBeNull();
      });
    });

    it("should render tooltip ComboBoxTemplate empty list", async () => {
      props.field.setValue([]);
      let sut = hostComponent(<ComboBoxTemplate {...props} />);
      const view = render(sut);

      // uncomment to see the html code
      //screen.debug();

      await waitFor(() => {
        expect(view.container.querySelector(`span[title="Choose an option"]` + "")).toBeInTheDocument();
        expect(view).not.toBeNull();
      });
    });
  });
});
