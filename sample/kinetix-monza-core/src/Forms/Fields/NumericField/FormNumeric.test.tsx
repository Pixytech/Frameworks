// reflect-metadata is required for IOC
import "reflect-metadata";
import React from "react";
import { cleanup, render, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { createMock } from "ts-auto-mock";

import { CoreTypes, IContainer, IViewResolver } from "@kinetix/core";
import { arrange, arrangeViewModel, hostComponent } from "../../../../../../testing";
import { TicketLayout } from "../../TicketLayout";
import { FormModel } from "../../FormModel";
import { FormViewModel } from "../../FormViewModel";

import { FieldModel } from "../FieldModel";
import { FormNumeric } from "./FormNumeric";
import { FormNumericField } from "./FormNumericField";

// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped module

  let mockFormModel: FormModel;
  let mockFormViewModel: MockFormViewModel;

  let mockFormField: FormNumericField;
  let mockViewResolver: IViewResolver;
  let mockContainer: IContainer;

  class MockFormViewModel extends FormViewModel<FormModel> {
    protected async onFormInitialize(): Promise<void> {}

    protected createModel(): FormModel {
      return new (class extends FormModel {})();
    }

    field: FormNumericField;
  }

  beforeEach(() => {
    mockContainer = createMock<IContainer>();

    mockFormModel = createMock<FormModel>();
    mockFormViewModel = createMock<MockFormViewModel>({ model: mockFormModel });

    mockFormField = createMock<FormNumericField>({
      model: new FieldModel<number | null>(null),
    });

    arrangeViewModel(mockFormViewModel)
      .acceptModelChanges()
      .acceptViewChanges()
      .stubProperty("field", () => mockFormField);

    mockViewResolver = createMock<IViewResolver>();

    arrange(mockContainer).stubMethod("build", () => mockViewResolver, [CoreTypes.IViewResolver]);
  });

  // Note: running cleanup afterEach is done automatically for you in @testing-library/react@9.0.0 or higher
  // unmount and cleanup DOM after the test is finished.
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  // Testing Component
  describe("FormNumericField", () => {
    it("Close popup", async () => {
      let sut = hostComponent(
        <TicketLayout viewModel={mockFormViewModel}>
          <FormNumeric label="Test" EnableAcelerator={true} dataContext={mockFormField} />
        </TicketLayout>,
        mockContainer
      );

      const view = render(sut);
      const field = view.getByText("Test");
      fireEvent.focus(field);
      fireEvent.blur(field);

      act(() => {
        mockFormField.show = true;
      });

      await waitFor(() => {
        const templatesLabel = view.getByText("In millions:");
        const popup = templatesLabel.parentElement || templatesLabel;
        fireEvent.blur(popup);
        expect(mockFormField.handleAcceleratorPopup).toBeCalledTimes(1);
      });
    });

    it("render hidden field", async () => {
      let sut = hostComponent(
        <TicketLayout viewModel={mockFormViewModel}>
          <FormNumeric label="Test" EnableAcelerator={true} dataContext={mockFormField} />
        </TicketLayout>,
        mockContainer
      );

      mockFormField.model.hidden = true;
      const view = render(sut);
    });

    it("Change input", async () => {
      let sut = hostComponent(
        <TicketLayout viewModel={mockFormViewModel}>
          <FormNumeric label="Test" EnableAcelerator={true} dataContext={mockFormField} />
        </TicketLayout>,
        mockContainer
      );

      mockFormField.show = false;

      const view = render(sut);

      const inputTextBox = view.getAllByRole("spinbutton");
      fireEvent.focus(inputTextBox[0]);
      fireEvent.change(inputTextBox[0], { target: { value: "20" } });

      await waitFor(() => {
        expect(mockFormField.setValue).toBeCalled();
      });
      fireEvent.blur(inputTextBox[0]);
    });

    it("Open popup", async () => {
      let sut = hostComponent(
        <TicketLayout viewModel={mockFormViewModel}>
          <FormNumeric label="Test" EnableAcelerator={true} dataContext={mockFormField} />
        </TicketLayout>,
        mockContainer
      );

      mockFormField.show = false;

      const view = render(sut);

      const button = view.getByRole("button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockFormField.handleAcceleratorPopup).toBeCalled();
      });
    });
  });
});
