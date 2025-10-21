// reflect-metadata is required for IOC
import "reflect-metadata";
import React from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { createMock } from "ts-auto-mock";
import { arrangeViewModel, hostComponent } from "../../../../../../testing";
import { FormButton, IFormButtonProps } from "./FormButton";
import { FormButtonField } from "./FormButtonField";
import { DelegateCommand, ICommand, IContainer } from "@kinetix/core";
import { TicketLayout } from "../../TicketLayout";
import { FormViewModel } from "../../FormViewModel";
import { FormModel } from "../../FormModel";

// Base Package
describe("IDP", () => {
  // Scoped module
  let props: IFormButtonProps;
  let mockCommand: ICommand;
  let mockContainer: IContainer;
  let mockFormViewModel: MockFormViewModel;
  class MockFormViewModel extends FormViewModel<FormModel> {
    protected async onFormInitialize(): Promise<void> {}

    protected createModel(): FormModel {
      return new (class extends FormModel {})();
    }

    button: FormButtonField;
  }

  beforeEach(() => {
    mockCommand = createMock<ICommand>();
    props = createMock<IFormButtonProps>();
    props.dataContext = new FormButtonField(
      new DelegateCommand(
        () => {},
        () => true
      )
    );
    props.dataContext.model.hidden = false;

    mockContainer = createMock<IContainer>();

    mockFormViewModel = createMock<MockFormViewModel>({ model: new (class x extends FormModel {})() });
    arrangeViewModel(mockFormViewModel)
      .acceptModelChanges()
      .acceptViewChanges()
      .stubProperty("button", () => props.dataContext);
  });

  afterEach(() => {
    cleanup();
    jest.resetAllMocks();
  });

  // Note: running cleanup afterEach is done automatically for you in @testing-library/react@9.0.0 or higher
  // unmount and cleanup DOM after the test is finished.
  afterEach(cleanup);

  // Testing Component
  describe("FormButton", () => {
    it("should render form component", async () => {
      let sut = hostComponent(
        <TicketLayout viewModel={mockFormViewModel}>
          <FormButton {...props}>TEST-BUTTON</FormButton>
        </TicketLayout>,
        mockContainer
      );
      const view = render(sut);

      // uncomment to see the html code
      // screen.debug();

      expect(view).not.toBeNull();
      expect(screen.getByText("TEST-BUTTON")).toBeInTheDocument();
      expect(view).not.toBeNull();
      const element = screen.getByRole("button");

      act(() => {
        mockFormViewModel.button.focus();
        mockFormViewModel.button.raiseCanExecuteChanged();
        fireEvent.change(element);
        fireEvent.focus(element);
        fireEvent.blur(element);
        fireEvent.click(element);
      });
    });

    it("should not render form component", async () => {
      mockFormViewModel.button.model.hidden = true;
      let sut = hostComponent(
        <TicketLayout viewModel={mockFormViewModel}>
          <FormButton {...props}>TEST-BUTTON</FormButton>
        </TicketLayout>,
        mockContainer
      );
      const view = render(sut);

      // uncomment to see the html code
      // screen.debug();
      const element = screen.queryByText("TEST-BUTTON");
      expect(view).not.toBeNull();
      expect(element).not.toBeInTheDocument();
    });
  });
});
