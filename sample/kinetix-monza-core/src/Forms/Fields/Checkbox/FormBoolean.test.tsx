// reflect-metadata is required for IOC
import "reflect-metadata";
import React from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { createMock } from "ts-auto-mock";
import { arrangeViewModel, hostComponent } from "../../../../../../testing";

import { DelegateCommand, ICommand, IContainer } from "@kinetix/core";
import { TicketLayout } from "../../TicketLayout";
import { FormViewModel } from "../../FormViewModel";
import { FormModel } from "../../FormModel";
import { FormBooleanField } from "./FormBooleanField";
import { FormBoolean, FormBooleanVariation, IFormBooleanProps } from "./FormBoolean";

// Base Package
describe("IDP", () => {
  // Scoped module
  let props: IFormBooleanProps;

  let mockContainer: IContainer;
  let mockFormViewModel: MockFormViewModel;
  class MockFormViewModel extends FormViewModel<FormModel> {
    protected async onFormInitialize(): Promise<void> {}

    protected createModel(): FormModel {
      return new (class extends FormModel {})();
    }

    field: FormBooleanField;
  }

  beforeEach(() => {
    props = createMock<IFormBooleanProps>();
    props.dataContext = new FormBooleanField();
    props.dataContext.model.hidden = false;

    mockContainer = createMock<IContainer>();

    mockFormViewModel = createMock<MockFormViewModel>({ model: new (class x extends FormModel {})() });
    arrangeViewModel(mockFormViewModel)
      .acceptModelChanges()
      .acceptViewChanges()
      .stubProperty("field", () => props.dataContext);
  });

  afterEach(() => {
    cleanup();
    jest.resetAllMocks();
  });

  // Note: running cleanup afterEach is done automatically for you in @testing-library/react@9.0.0 or higher
  // unmount and cleanup DOM after the test is finished.
  afterEach(cleanup);

  // Testing Component
  describe("FormBoolean", () => {
    it("should render form component", async () => {
      let sut = hostComponent(
        <TicketLayout viewModel={mockFormViewModel}>
          <FormBoolean {...props} label={"Field"}></FormBoolean>
        </TicketLayout>,
        mockContainer
      );
      const view = render(sut);

      // uncomment to see the html code
      // screen.debug();

      expect(view).not.toBeNull();
      expect(screen.getByText("Field")).toBeInTheDocument();
      expect(view).not.toBeNull();
      const element = screen.getByRole("checkbox");

      act(() => {
        mockFormViewModel.field.focus();
        fireEvent.change(element);
        fireEvent.focus(element);
        fireEvent.blur(element);
      });
    });

    it("should not render form component", async () => {
      mockFormViewModel.field.model.hidden = true;
      let sut = hostComponent(
        <TicketLayout viewModel={mockFormViewModel}>
          <FormBoolean {...props} label={"Field"}></FormBoolean>
        </TicketLayout>,
        mockContainer
      );
      const view = render(sut);

      // uncomment to see the html code
      // screen.debug();
      const element = screen.queryByText("Field");
      expect(view).not.toBeNull();
      expect(element).not.toBeInTheDocument();
    });

    it("should render form component switch", async () => {
      mockFormViewModel.field.variation = FormBooleanVariation.switch;
      let sut = hostComponent(
        <TicketLayout viewModel={mockFormViewModel}>
          <FormBoolean {...props} label={"Field"} variation={FormBooleanVariation.switch}></FormBoolean>
        </TicketLayout>,
        mockContainer
      );
      const view = render(sut);

      // uncomment to see the html code
      // screen.debug();
      expect(screen.getByText("Field")).toBeInTheDocument();
      expect(view).not.toBeNull();
      const element = screen.getByRole("switch");

      act(() => {
        mockFormViewModel.field.focus();
        fireEvent.change(element);
        fireEvent.focus(element);
        fireEvent.blur(element);
      });
    });
  });
});
