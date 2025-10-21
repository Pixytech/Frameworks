// reflect-metadata is required for IOC
import "reflect-metadata";
import React from "react";
import { cleanup, screen, render, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { createMock } from "ts-auto-mock";

import { CoreTypes, IContainer, IViewResolver } from "@kinetix/core";
import { arrange, arrangeViewModel, hostComponent, MockTicketHost } from "../../../../../../testing";

import { FormDataGrid } from "./FormDataGrid";
import { TicketLayout } from "../../TicketLayout";
import { FormModel } from "../../FormModel";
import { FormViewModel } from "../../FormViewModel";
import { DataGridModel } from "./DataGridModel";
import { FormDataGridField } from "./FormDataGridField";
import { FormTreeView } from "./FormTreeView";

// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped module

  let mockFormViewModel: MockFormViewModel;
  let mockFormDataGridField: FormDataGridField;
  let mockViewResolver: IViewResolver;
  let mockContainer: IContainer;

  class MockFormViewModel extends FormViewModel<FormModel> {
    protected async onFormInitialize(): Promise<void> {}

    protected createModel(): FormModel {
      return new (class extends FormModel {})();
    }

    dataGridField: FormDataGridField;
  }

  beforeEach(() => {
    mockContainer = createMock<IContainer>();

    mockFormViewModel = createMock<MockFormViewModel>({ model: new (class x extends FormModel {})() });

    mockFormDataGridField = createMock<FormDataGridField>({
      model: new DataGridModel(),
    });

    
    arrangeViewModel(mockFormViewModel)
      .acceptModelChanges()
      .acceptViewChanges()
      .stubProperty("dataGridField", () => mockFormDataGridField);

    mockViewResolver = createMock<IViewResolver>();

    arrange(mockContainer).stubMethod("build", () => mockViewResolver, [CoreTypes.IViewResolver]);

    mockFormDataGridField.model.value = [
      { assetClass: "assetClassValue1", id: "1", name: "name1" ,
        items:[{ assetClass: "assetClassValue1-1", id: "1_1", name: "name1-1" }]
      },
      { assetClass: "assetClassValue2", id: "2", name: "name2" ,
        items:[{ assetClass: "assetClassValue2-1", id: "2_1", name: "name2-1" }]
      },
    ];
  });

  // Note: running cleanup afterEach is done automatically for you in @testing-library/react@9.0.0 or higher
  // unmount and cleanup DOM after the test is finished.
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  // Testing Component
  describe("Form TreeView", () => {
    it("Render TreeView", async () => {
      let sut = hostComponent(
        <MockTicketHost dataContext={mockFormViewModel}>
          <TicketLayout viewModel={mockFormViewModel}>
            <FormTreeView
              dataContext={mockFormDataGridField}
              showTreeLines={true}
              childrenField="items"
              textField="assetClass"
              expandIcons={true}
            />
          </TicketLayout>
        </MockTicketHost>,
        mockContainer
      );

      const view = render(sut);
     
      expect(screen.getByText("assetClassValue1"));
      fireEvent.click(screen.getByText("assetClassValue1"));
      fireEvent.keyPress(screen.getByText("assetClassValue1"),{ key: 'ArrowLeft', code: 'ArrowLeft' });
      fireEvent.keyPress(screen.getByText("assetClassValue1"),{ key: 'ArrowRight', code: 'ArrowRight' });
      
      fireEvent.click(screen.getByText("assetClassValue2"));
      const root = view.container.getElementsByClassName("formDataTreeField")[0];
      fireEvent.focus(root);
      expect(mockFormDataGridField.onFocus).toBeCalled();
      fireEvent.blur(root);
      expect(mockFormDataGridField.onLostFocus).toBeCalled();
    });

    it("Render TreeView with drag and drop props", async () => {
      const mockDragStart = jest.fn();
      const mockDragEnd = jest.fn();
      const mockDragOver = jest.fn();

      let sut = hostComponent(
        <MockTicketHost dataContext={mockFormViewModel}>
          <TicketLayout viewModel={mockFormViewModel}>
            <FormTreeView
              dataContext={mockFormDataGridField}
              showTreeLines={true}
              childrenField="items"
              textField="assetClass"
              expandIcons={true}
              draggable={true}
              onItemDragStart={mockDragStart}
              onItemDragEnd={mockDragEnd}
              onItemDragOver={mockDragOver}
            />
          </TicketLayout>
        </MockTicketHost>,
        mockContainer
      );

      const view = render(sut);
      
      // Verify the TreeView renders with drag props
      expect(screen.getByText("assetClassValue1")).toBeInTheDocument();
      
      // Note: Actual drag events would be tested at the Kendo TreeView level
      // Here we just verify the component accepts the drag props without errors
    });

    it("should not render grid", async () => {
      mockFormDataGridField.model.hidden = true;
      let sut = hostComponent(
        <MockTicketHost dataContext={mockFormViewModel}>
          <TicketLayout viewModel={mockFormViewModel}>
          <FormTreeView
              dataContext={mockFormDataGridField}
              showTreeLines={false}
              childrenField="items"
              expandIcons={true}
              textField="assetClass"
            />
          </TicketLayout>
        </MockTicketHost>,
        mockContainer
      );

      const view = render(sut);
      //screen.debug();
    });

    
  });

  it("props from view takes precedence", async () => {
    let sut = hostComponent(
      <FormDataGrid
        dataContext={mockFormDataGridField}
        primaryKeys={["id"]}
      />
    );

    render(sut);

    
    expect(mockFormDataGridField.model.primaryKeys).not.toBeNull();
  });
});
