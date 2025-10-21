// reflect-metadata is required for IOC
import "reflect-metadata";
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { createMock } from "ts-auto-mock";
import { IFormAutoCompleteChildProps } from "../FormAutoComplete";
import { ChipListTemplate } from "./ChipListTemplate";
import { hostComponent } from "../../../../../../../testing";

// Base Package
describe("IDP", () => {
  // Scoped module
  let props: IFormAutoCompleteChildProps;

  beforeEach(() => {
    props = createMock<IFormAutoCompleteChildProps>();
    props.field.placeholder = "test";
    props.field.model.value = { title: "Test Title", value: "tst" };
    props.field.model.data = [
      { title: "Test Title", value: "tst" },
      { title: "Test Title1", value: "tst1" },
      { title: "Test Title2", value: "tst2" },
    ];
    props.field.displayName = "title";
    props.field.getOptions = () => props.field.model.data;
    props.context.others = { selection: "Multiple" };
  });

  afterEach(() => {
    cleanup();
    jest.resetAllMocks();
  });

  // Note: running cleanup afterEach is done automatically for you in @testing-library/react@9.0.0 or higher
  // unmount and cleanup DOM after the test is finished.
  afterEach(cleanup);

  // Testing Component
  describe("ChipListTemplate", () => {
    it("should render ChipListTemplate", async () => {
      let sut = hostComponent(<ChipListTemplate {...props} />);
      const view = render(sut);
      expect(screen.getByText("Test Title2")).toBeInTheDocument();

      const field = view.getByText("Test Title2");
      fireEvent.focus(field);
      fireEvent.click(field);
      fireEvent.blur(field);
    });
  });
});
