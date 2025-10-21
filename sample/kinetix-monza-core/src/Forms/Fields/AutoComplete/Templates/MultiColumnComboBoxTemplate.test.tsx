// reflect-metadata is required for IOC
import "reflect-metadata";
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { createMock } from "ts-auto-mock";
import { arrange, delay, hostComponent } from "../../../../../../../testing";
import { IFormAutoCompleteChildProps } from "../FormAutoComplete";
import { MultiColumnComboBoxTemplate } from "./MultiColumnComboBoxTemplate";
import { FormAutoCompleteField } from "../FormAutoCompleteField";
import { FormModel } from "../../../FormModel";
import { FormViewModel } from "../../../FormViewModel";

class MockFormViewModel extends FormViewModel<FormModel> {
  protected async onFormInitialize(): Promise<void> {}

  protected createModel(): FormModel {
    return new (class extends FormModel {})();
  }

  field: FormAutoCompleteField;
}

// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped module
  let props: IFormAutoCompleteChildProps;

  beforeEach(() => {
    const mockFormViewModel = createMock<MockFormViewModel>({ model: new (class x extends FormModel {})() });
    props = createMock<IFormAutoCompleteChildProps>({ field: new FormAutoCompleteField(mockFormViewModel) });
    props.field.placeholder = "test";
    props.field.model.value = { title: "Test Title", value: "tst" };
    props.field.model.data = props.field.model.options = [{ title: "Test Title", value: "tst" }];
    props.field.displayName = "title";
    props.field.filterable = true;
    props.field.EnableAcelerator = true;
    props.field.columns=[{
      field :'title',
      header:'Title',
      width:"200px",
      uniqueKey:'title'
    },
    {
      field :'value',
      header:'value',
      width:"200px",
      uniqueKey:'value'
    }
  ]
    arrange(mockFormViewModel).stubProperty("field", () => props.field);

    
  });

  

  afterEach(() => {
    cleanup();
    jest.resetAllMocks();
  });

  // Note: running cleanup afterEach is done automatically for you in @testing-library/react@9.0.0 or higher
  // unmount and cleanup DOM after the test is finished.
  afterEach(cleanup);

  // Testing Component
  describe("MultiColumnComboBoxTemplate", () => {
    it("should render MultiColumnComboBoxTemplate", async () => {
      let sut = hostComponent(<MultiColumnComboBoxTemplate {...props}  />);
      const view = render(sut);
     
      const field = view.getByRole("combobox");

      fireEvent.focus(field);
      fireEvent.blur(field);

      expect(screen.getByDisplayValue("Test Title")).toBeInTheDocument();
      fireEvent.change(screen.getByDisplayValue("Test Title"), { target: { value: "Good Day" } });
    });

    it("Close popup", async () => {
      props.field.model.show = true;
      let sut = hostComponent(<MultiColumnComboBoxTemplate {...props} />);
      const view = render(sut);

      // uncomment to see the html code
      //screen.debug();

      const field = view.getByRole("combobox");

      fireEvent.focus(field);
      fireEvent.blur(field);

      expect(screen.getByDisplayValue("Test Title")).toBeInTheDocument();
      fireEvent.change(screen.getByDisplayValue("Test Title"), { target: { value: "Good Day" } });

      let iconButton = view.container.getElementsByClassName("icon-class-multi")[0];
      fireEvent.focus(iconButton);
      fireEvent.click(iconButton);
      
      await waitFor(async () => {
        expect(props.field.model.show).toBe(true);
        await delay(300);
        // screen.debug();
        const templatesLabel = view.getByText("Templates:");
        const popup = templatesLabel.parentElement || templatesLabel;
        fireEvent.blur(popup);
      });
      fireEvent.blur(field);
    });
  });
});
