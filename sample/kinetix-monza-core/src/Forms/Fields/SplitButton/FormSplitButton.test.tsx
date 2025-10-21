// reflect-metadata is required for IOC
import "reflect-metadata";
import React from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { createMock } from "ts-auto-mock";
import { arrangeViewModel, hostComponent } from "../../../../../../testing";
import { FormSplitButton, IFormSplitButtonProps,  } from "./FormSplitButton";
import { FormSplitButtonField } from "./FormSplitButtonField";
import { DelegateCommand, ICommand, IContainer } from "@kinetix/core";
import { TicketLayout } from "../../TicketLayout";
import { FormViewModel } from "../../FormViewModel";
import { FormModel } from "../../FormModel";
import { saveIcon } from "@progress/kendo-svg-icons";

// Base Package
describe("IDP", () => {
  // Scoped module
  let props: IFormSplitButtonProps;
  let mockCommand: ICommand;
  let mockContainer: IContainer;
  let mockFormViewModel: MockFormViewModel;
  class MockFormViewModel extends FormViewModel<FormModel> {
    protected async onFormInitialize(): Promise<void> {}

    protected createModel(): FormModel {
      return new (class extends FormModel {})();
    }

    button: FormSplitButtonField;
  }

  beforeEach(() => {
    mockCommand = createMock<ICommand>();
    props = createMock<IFormSplitButtonProps>();
    props.dataContext = new FormSplitButtonField(
      new DelegateCommand(
        () => {},
        () => true
      )
    );
    props.dataContext.model.buttons=[{text:'TEST-BUTTON',svgIcon:saveIcon},{text:'TEST-BUTTON-2',svgIcon:saveIcon}];
    props.dataContext.model.selectedButton = props.dataContext.model.buttons[0]
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
  describe("FormSplitButton", () => {
    it("should render form component", async () => {
      let sut = hostComponent(
        <TicketLayout viewModel={mockFormViewModel}>
          <FormSplitButton {...props}/>
        </TicketLayout>,
        mockContainer
      );
      const view = render(sut);

      // uncomment to see the html code
      // screen.debug();

      expect(view).not.toBeNull();
      expect(screen.getByText("TEST-BUTTON")).toBeInTheDocument();
      expect(view).not.toBeNull();
      const element = screen.getAllByRole("button")[0];

      act(() => {
        mockFormViewModel.button.focus();
        mockFormViewModel.button.raiseCanExecuteChanged();
        fireEvent.change(element);
        fireEvent.focus(element);
        fireEvent.blur(element);
        fireEvent.click(element);
      });
    });

    it("should show tooltip when button is disabled and tooltip is set", async () => {
      props.dataContext.model.tooltip = "This button is disabled due to exceptions";
      props.dataContext.model.disabled = true;
      
      let sut = hostComponent(
        <TicketLayout viewModel={mockFormViewModel}>
          <FormSplitButton {...props}/>
        </TicketLayout>,
        mockContainer
      );
      const view = render(sut);

      const buttonWrapper = screen.getByText("TEST-BUTTON").closest('div');
      
      // Simulate hover
      fireEvent.mouseEnter(buttonWrapper!);
      
      await waitFor(() => {
        expect(screen.getByText("This button is disabled due to exceptions")).toBeInTheDocument();
      });
    });

    it("should not render form component", async () => {
      mockFormViewModel.button.model.hidden = true;
      let sut = hostComponent(
        <TicketLayout viewModel={mockFormViewModel}>
          <FormSplitButton {...props}/>
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
