// reflect-metadata is required for IOC
import "reflect-metadata";
import { IViewResolver, IContainer, CoreTypes } from "@kinetix/core";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import React from "react";
import { createMock } from "ts-auto-mock";
import { arrangeViewModel, arrange, hostComponent } from "../../../../../../testing";
import { FormModel } from "../../FormModel";
import { FormViewModel } from "../../FormViewModel";
import { TicketLayout } from "../../TicketLayout";
import { FieldModel } from "../FieldModel";
import { FormDateTime } from "./FormDateTime";
import { FormDateTimeField } from "./FormDateTimeField";

// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped module

  let mockFormModel: FormModel;
  let mockFormViewModel: MockFormViewModel;

  let mockFormField: FormDateTimeField;
  let mockViewResolver: IViewResolver;
  let mockContainer: IContainer;

  class MockFormViewModel extends FormViewModel<FormModel> {
    protected async onFormInitialize(): Promise<void> {}

    protected createModel(): FormModel {
      return new (class extends FormModel {})();
    }

    field: FormDateTimeField;
  }

  beforeEach(() => {
    mockContainer = createMock<IContainer>();

    mockFormModel = createMock<FormModel>();
    mockFormViewModel = createMock<MockFormViewModel>({ model: mockFormModel });

    mockFormField = createMock<FormDateTimeField>({
      model: new FieldModel<Date | undefined>(undefined),
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
  describe("FormDateTime", () => {
    it("Date picker render", async () => {
      mockFormField.allowTime = false;

      let sut = hostComponent(
        <TicketLayout viewModel={mockFormViewModel}>
          <FormDateTime label="Test" dataContext={mockFormField} />
        </TicketLayout>,
        mockContainer
      );

      const view = render(sut);

      const element = view.getByRole("combobox");

      act(() => {
        mockFormField.focus();

        fireEvent.change(element);
        fireEvent.focus(element);
        fireEvent.blur(element);
        fireEvent.click(element);
      });
      mockFormField.model.hidden;
      sut = hostComponent(
        <TicketLayout viewModel={mockFormViewModel}>
          <FormDateTime label="Test" dataContext={mockFormField} />
        </TicketLayout>,
        mockContainer
      );

      render(sut);
    });

    it("Date time picker render", async () => {
      mockFormField.allowTime = true;

      let sut = hostComponent(
        <TicketLayout viewModel={mockFormViewModel}>
          <FormDateTime label="Test" dataContext={mockFormField} />
        </TicketLayout>,
        mockContainer
      );

      const view = render(sut);

      const element = view.getByRole("combobox");

      act(() => {
        mockFormField.focus();

        fireEvent.change(element);
        fireEvent.focus(element);
        fireEvent.blur(element);
        fireEvent.click(element);
      });
    });
  });
});
