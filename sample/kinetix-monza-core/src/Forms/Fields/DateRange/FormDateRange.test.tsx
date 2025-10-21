// reflect-metadata is required for IOC
import "reflect-metadata";
import React from "react";
import { cleanup, render, fireEvent, waitFor, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { createMock } from "ts-auto-mock";

import { CoreTypes, IContainer, IViewResolver, delay } from "@kinetix/core";
import { arrange, arrangeViewModel, hostComponent, MockTicketHost } from "../../../../../../testing";
import { TicketLayout } from "../../TicketLayout";
import { FormModel } from "../../FormModel";
import { FormViewModel } from "../../FormViewModel";

import { FormDateRange } from "./FormDateRange";
import { FormDateRangeField } from "./FormDateRangeField";
import { FieldModel } from "../FieldModel";
import { SelectionRange } from "@progress/kendo-react-dateinputs";

// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped module

  let mockFormModel: FormModel;
  let mockFormViewModel: MockFormViewModel;

  let mockFormField: FormDateRangeField;
  let mockViewResolver: IViewResolver;
  let mockContainer: IContainer;

  class MockFormViewModel extends FormViewModel<FormModel> {
    protected async onFormInitialize(): Promise<void> {}

    protected createModel(): FormModel {
      return new (class extends FormModel {})();
    }

    field: FormDateRangeField;
  }

  beforeEach(() => {
    mockContainer = createMock<IContainer>();

    mockFormModel = createMock<FormModel>();
    mockFormViewModel = createMock<MockFormViewModel>({ model: mockFormModel });

    mockFormField = new FormDateRangeField(mockFormViewModel);

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
  describe("FormDateRange", () => {
    it("Close popup", async () => {
      let sut = hostComponent(
        <TicketLayout viewModel={mockFormViewModel}>
          <FormDateRange label="Test" EnableAcelerator={true} dataContext={mockFormField} />
        </TicketLayout>,
        mockContainer
      );

      const view = render(sut);
      const field = view.getByText("Test");
      fireEvent.focus(field);

      let iconButton = view.container.getElementsByClassName("icon-class-date")[0];
      act(() => {
        fireEvent.focus(iconButton);
        fireEvent.click(iconButton);
      });

      await waitFor(async () => {
        expect(mockFormField.model.show).toBe(true);
        await delay(300);
        const templatesLabel = view.getByText("Start From:");
        const popup = templatesLabel.parentElement || templatesLabel;
        fireEvent.blur(popup);
      });
      fireEvent.blur(field);
    });

    it("should render form component", async () => {
      let sut = hostComponent(
        <TicketLayout viewModel={mockFormViewModel}>
          <FormDateRange label={"Field"} dataContext={mockFormField}></FormDateRange>
        </TicketLayout>,
        mockContainer
      );
      const view = render(sut);

      // uncomment to see the html code
      // screen.debug();

      expect(view).not.toBeNull();
      expect(screen.getByText("Field")).toBeInTheDocument();
      expect(view).not.toBeNull();
      const element = screen.getByTestId("Field");

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
          <FormDateRange label={"Field"} dataContext={mockFormField}></FormDateRange>
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
  });
});
