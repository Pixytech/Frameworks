// reflect-metadata is required for IOC
import "reflect-metadata";
import React from "react";
import { cleanup, render, fireEvent, act, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { createMock } from "ts-auto-mock";

import { CoreTypes, IContainer, IViewResolver } from "@kinetix/core";
import { arrange, arrangeViewModel, clearStubs, hostComponent, MockTicketHost } from "../../../../../../testing";
import { TicketLayout } from "../../TicketLayout";
import { FormModel } from "../../FormModel";
import { FormViewModel } from "../../FormViewModel";
import { AutoCompleteModel, FormAutoCompleteField } from "./FormAutoCompleteField";
import { FormAutoComplete } from "./FormAutoComplete";
import { FormField } from "../FormField";
import { FieldModel } from "../FieldModel";

// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped module

  let mockFormModel: FormModel;
  let mockFormViewModel: MockFormViewModel;
  let mockFormField: FormAutoCompleteField;
  let mockViewResolver: IViewResolver;
  let mockContainer: IContainer;

  class MockFormViewModel extends FormViewModel<FormModel> {
    protected async onFormInitialize(): Promise<void> {}

    protected createModel(): FormModel {
      return new (class extends FormModel {})();
    }

    field: FormAutoCompleteField;
  }

  beforeEach(() => {
    mockContainer = createMock<IContainer>();

    mockFormModel = createMock<FormModel>();
    mockFormViewModel = createMock<MockFormViewModel>({ model: mockFormModel });

    mockFormField = createMock<FormAutoCompleteField>({
      model: new FieldModel<AutoCompleteModel>(createMock<AutoCompleteModel>()),
    });

    arrangeViewModel(mockFormViewModel)
      .acceptModelChanges()
      .acceptViewChanges()
      .stubProperty("field", () => mockFormField);

    mockViewResolver = createMock<IViewResolver>();

    arrange(mockContainer).stubMethod("build", () => mockViewResolver, [CoreTypes.IViewResolver]);

    mockFormField.model.data = [
      { assetClass: "assetClassValue1", name: "name1" },
      { assetClass: "assetClassValue2", name: "name2" },
    ];
  });

  // Note: running cleanup afterEach is done automatically for you in @testing-library/react@9.0.0 or higher
  // unmount and cleanup DOM after the test is finished.
  afterEach(() => {
    cleanup();
    jest.resetAllMocks();
    clearStubs();
  });

  // Testing Component
  describe("Form Auto Complete", () => {
    it("Close popup", async () => {
      let sut = hostComponent(
        <TicketLayout viewModel={mockFormViewModel}>
          <FormAutoComplete
            label="Test"
            EnableAcelerator={true}
            dataContext={mockFormField}
            dropDown="MultiColumnComboBox"
            columns={[
              {
                header: "Asset Class",
                field: "assetClass",
              },
              {
                header: "Name",
                field: "name",
              },
            ]}
          />
        </TicketLayout>,
        mockContainer
      );

      const view = render(sut);
      const field = view.getByText("Test");
      fireEvent.focus(field);
      fireEvent.blur(field);

      act(() => {
        mockFormField.model.show = true;
      });

      await waitFor(() => {
        const templatesLabel = view.getByText("Templates:");
        const popup = templatesLabel.parentElement || templatesLabel;
        fireEvent.blur(popup);
        expect(mockFormField.handleAcceleratorPopup).toBeCalledTimes(1);
      });
    });

    it("should load the initial data", async () => {
      mockFormField.dataset = "SOME-DATASET";

      let sut = hostComponent(
        <TicketLayout viewModel={mockFormViewModel}>
          <FormAutoComplete
            label="Test"
            dataContext={mockFormField}
            dropDown="MultiColumnComboBox"
            columns={[
              {
                header: "Asset Class",
                field: "assetClass",
              },
              {
                header: "Name",
                field: "name",
              },
            ]}
          />
        </TicketLayout>,
        mockContainer
      );

      const view = render(sut);

      await waitFor(() => {
        expect(mockFormField.fetachData).toBeCalledWith(undefined);
        expect(mockFormField.fetachData).toBeCalledTimes(1);
      });
    });
  });
});
