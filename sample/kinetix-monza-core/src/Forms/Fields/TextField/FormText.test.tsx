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
import { FormText, IFormTextProps } from "./FormText";
import { FormTextField } from "./FormTextField";
import { LabelPosition } from "../IFormField";
import { ValidationHelper } from "../ValidationHelper";
import { ValidationType } from "../ValidationType";
import { UpdateSourceTrigger } from "../UpdateSourceTrigger";

// Base Package
describe("IDP", () => {
  // Scoped module
  let props: IFormTextProps;

  let mockContainer: IContainer;
  let mockFormViewModel: MockFormViewModel;
  class MockFormViewModel extends FormViewModel<FormModel> {
    protected async onFormInitialize(): Promise<void> {}

    protected createModel(): FormModel {
      return new (class extends FormModel {})();
    }

    field: FormTextField;
  }

  beforeEach(() => {
    props = createMock<IFormTextProps>();
    props.dataContext = new FormTextField();
    props.dataContext.model.hidden = false;
    props.dataContext.model.value = "fieldText";
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
  describe("FormText", () => {
    it("should render FormText component", async () => {
      let sut = hostComponent(
        <TicketLayout viewModel={mockFormViewModel}>
          <FormText {...props} label={"Field"}></FormText>
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
          <FormText {...props} label={"Field"}></FormText>
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

    it("should render FormText validation with top label", async () => {
      props.dataContext = new FormTextField();
      props.dataContext.model.hidden = false;
      props.dataContext.model.value = "fieldText";
      props.dataContext.model.required = true;

      let sut = hostComponent(
        <TicketLayout viewModel={mockFormViewModel}>
          <FormText {...props} label={"Field"} labelPosition={LabelPosition.Top}></FormText>
        </TicketLayout>,
        mockContainer
      );
      const view = render(sut);

      // uncomment to see the html code

      expect(view).not.toBeNull();
      expect(screen.getByText("Field")).toBeInTheDocument();
      expect(view).not.toBeNull();
      const element = screen.getByTestId("Field");

      const requiredIndicator = screen.getByTestId("required-indicator");
      expect(requiredIndicator).toBeInTheDocument();

      act(() => {
        props.dataContext.focus();
        fireEvent.change(element);
        fireEvent.focus(element);
        fireEvent.blur(element);

        fireEvent.change(screen.getByDisplayValue("fieldText"), {
          target: {
            value: "fieldText-CHANGED",
          },
        });

        props.dataContext.updateModel((x) => {
          x.valid = false;
          x.customValidation = ValidationHelper.setValidation("TEST VALiDATION", ValidationType.Error);
        });

        fireEvent.focus(screen.getByDisplayValue("fieldText-CHANGED"));
        //fireEvent.mouseOver(screen.getByTestId("validation-overlay"));
      });

      await waitFor(() => {
        expect(screen.getByTestId("validation-messages")).toBeInTheDocument();
      });

      act(() => {
        fireEvent.blur(screen.getByDisplayValue("fieldText-CHANGED"));
        fireEvent.keyDown(screen.getByDisplayValue("fieldText-CHANGED"), {
          key: "Tab",
          code: "tab",
          keyCode: 9,
        });

        props.dataContext.updateModel((x) => {
          x.valid = false;
          x.validationMessage = ValidationHelper.setValidation("TEST VALiDATION", ValidationType.Error);
        });
        fireEvent.mouseOver(screen.getByTestId("validation-overlay"));
      });

      await waitFor(() => {
        expect(screen.getByTestId("validation-messages")).toBeInTheDocument();
        fireEvent.mouseOut(screen.getByTestId("validation-overlay"));
      });
    });

    it("should update value using debounce", async () => {
      props.dataContext = new FormTextField();
      props.dataContext.model.hidden = false;
      props.dataContext.model.value = "fieldText";
      props.dataContext.model.required = true;

      props.dataContext.updateSourceTrigger = UpdateSourceTrigger.PropertyChanged;
      const onChangedCaller = jest.fn();
      props.dataContext.onModelChanged.subscribe((x) => onChangedCaller(x));

      let sut = hostComponent(
        <TicketLayout viewModel={mockFormViewModel}>
          <FormText {...props} label={"Field"} labelPosition={LabelPosition.Top}></FormText>
        </TicketLayout>,
        mockContainer
      );
      const view = render(sut);

      // uncomment to see the html code

      act(() => {
        props.dataContext.focus();
        props.dataContext.hasfocus = true;
        const field = screen.getByDisplayValue("fieldText");
        fireEvent.change(field, {
          target: {
            value: "fieldText-CHANGED",
          },
        });

        fireEvent.change(field, {
          target: {
            value: "fieldText-CHANGED2",
          },
        });

        fireEvent.change(field, {
          target: {
            value: "fieldText-CHANGED3",
          },
        });
      });

      await waitFor(() => {
        expect(onChangedCaller).toBeCalledTimes(1);
      });
    });
  });
});
