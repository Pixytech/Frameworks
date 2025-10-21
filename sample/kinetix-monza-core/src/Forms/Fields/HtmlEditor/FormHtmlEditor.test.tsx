// reflect-metadata is required for IOC
import "reflect-metadata";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import React from "react";
import { createMock } from "ts-auto-mock";
import { arrangeViewModel, arrange, hostComponent } from "../../../../../../testing";
import { FormModel } from "../../FormModel";
import { FormViewModel } from "../../FormViewModel";
import { TicketLayout } from "../../TicketLayout";
import { FieldModel } from "../FieldModel";
import { FormHtmlEditor } from "./FormHtmlEditor";
import { FormHtmlEditorField, FormHtmlEditorModel } from "./FormHtmlEditorField";
import { IViewResolver, IContainer, CoreTypes } from "@kinetix/core";

// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped module

  let mockFormModel: FormModel;
  let mockFormViewModel: MockFormViewModel;

  let mockFormField: FormHtmlEditorField;
  let mockViewResolver: IViewResolver;
  let mockContainer: IContainer;

  class MockFormViewModel extends FormViewModel<FormModel> {
    protected async onFormInitialize(): Promise<void> {}

    protected createModel(): FormModel {
      return new (class extends FormModel {})();
    }

    field: FormHtmlEditorField;
  }

  beforeEach(() => {
    mockContainer = createMock<IContainer>();

    mockFormModel = new (class extends FormModel {})();
    mockFormViewModel = createMock<MockFormViewModel>({ model: mockFormModel });

    mockFormField = new FormHtmlEditorField();

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
  describe("FormHtmlEditor", () => {
    it("FormHtmlEditor render html", async () => {
      mockFormField.model.value = "<div>SOMETEST</div>";

      let sut = hostComponent(
        <TicketLayout viewModel={mockFormViewModel}>
          <FormHtmlEditor label="Test" dataContext={mockFormField} />
        </TicketLayout>,
        mockContainer
      );

      const view = render(sut);
      const element = view.getByRole("presentation");

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
          <FormHtmlEditor label="Test" dataContext={mockFormField} />
        </TicketLayout>,
        mockContainer
      );

      render(sut);
    });
  });
});
