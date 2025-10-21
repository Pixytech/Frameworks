// reflect-metadata is required for IOC
import "reflect-metadata";
import React from "react";
import { cleanup, render, fireEvent, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { createMock } from "ts-auto-mock";

import { AutomationHelper, CoreTypes, IContainer, IViewResolver } from "@kinetix/core";

import { IFormViewModel } from "./IFormViewModel";
import { FormModel } from "./FormModel";
import { arrange, hostComponent } from "../../../../testing";
import { TicketSubmitButton } from "./TicketSubmitButton";
import { IFormField, ValidationHelper, ValidationType } from "./Fields";

// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped module

  let mockFormViewModel: IFormViewModel<FormModel>;
  let mockContainer: IContainer;

  beforeEach(() => {
    mockContainer = createMock<IContainer>();
    mockFormViewModel = createMock<IFormViewModel<FormModel>>({ model: new (class extends FormModel {})() });
    mockFormViewModel.showSubmit = true;
    mockFormViewModel.model.valid = false;
    mockFormViewModel.model.readonly = false;
    mockFormViewModel.model.disabled = false;
    mockFormViewModel.model.allowSubmit = true;
    mockFormViewModel.model.customValidation = ValidationHelper.setValidation("Some Error", ValidationType.Error);
    mockFormViewModel.model.errors = {
      field1: "error1",
      field2: "error2",
    };

    mockFormViewModel.getFieldByName = jest.fn((key: string) => {
      const mockResult = createMock<IFormField>();
      switch (key) {
        case "field1":
          mockResult.name = "Test-Field-1";
          break;
        case "field2":
          mockResult.name = "Test-Field-2";
          break;
      }
      return mockResult;
    });
  });

  // Note: running cleanup afterEach is done automatically for you in @testing-library/react@9.0.0 or higher
  // unmount and cleanup DOM after the test is finished.
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  // Testing Component
  describe("Form TicketSubmitButton", () => {
    it("Should render Ticket Submit Button", async () => {
      let sut = hostComponent(<TicketSubmitButton viewModel={mockFormViewModel}>SUBMIT-TEST</TicketSubmitButton>, mockContainer);

      const view = render(sut);
      const submitButton = screen.getByTestId(AutomationHelper.GetId("submitButton-wrapper"));
      expect(submitButton).toBeDefined();
      expect(screen.getByText("SUBMIT-TEST")).toBeInTheDocument();

      const submitButtonHost = screen.getByTestId(AutomationHelper.GetId("submitButton-host"));
      expect(submitButtonHost).toBeDefined();
      fireEvent.focus(submitButtonHost);
      fireEvent.mouseOver(submitButtonHost);

      await waitFor(() => {
        const submitPopup = screen.getByTestId(AutomationHelper.GetId("submit-popup"));
        expect(submitPopup).toBeDefined();
      });

      const fieldError = screen.getByText("error1");

      fireEvent.click(fieldError);

      fireEvent.blur(submitButtonHost);
      fireEvent.mouseOut(submitButtonHost);

      const submitButtonIcon = screen.getByTestId(AutomationHelper.GetId("submitButton-error-icon"));
      expect(submitButtonIcon).toBeDefined();
      fireEvent.click(submitButtonIcon);

      await waitFor(() => {
        const submitPopup = screen.getByTestId(AutomationHelper.GetId("submit-popup"));
        expect(submitPopup).toBeDefined();
      });
      fireEvent.mouseOut(screen.getByTestId(AutomationHelper.GetId("submit-popup")));
      fireEvent.mouseOut(submitButton);
      fireEvent.blur(submitButton);
      mockFormViewModel.model.valid = true;
      fireEvent.click(submitButton);
    });

    it("Should submit Ticket Submit Button", async () => {
      mockFormViewModel.model.valid = true;
      let sut = hostComponent(<TicketSubmitButton viewModel={mockFormViewModel}>SUBMIT-TEST</TicketSubmitButton>, mockContainer);

      const view = render(sut);
      const submitButton = screen.getByTestId(AutomationHelper.GetId("submitButton"));
      fireEvent.click(submitButton);
    });
  });
});
