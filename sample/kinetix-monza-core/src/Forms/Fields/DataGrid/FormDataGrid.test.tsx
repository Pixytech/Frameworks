// reflect-metadata is required for IOC
import "reflect-metadata";
import { cleanup, screen, render, fireEvent } from "@testing-library/react";
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
      { assetClass: "assetClassValue1", id: "1", name: "name1" },
      { assetClass: "assetClassValue2", id: "2", name: "name2" },
    ];
  });

  // Note: running cleanup afterEach is done automatically for you in @testing-library/react@9.0.0 or higher
  // unmount and cleanup DOM after the test is finished.
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  // Testing Component
  describe("Form Data Grid", () => {
    it("Render grid", async () => {
      let sut = hostComponent(
        <MockTicketHost dataContext={mockFormViewModel}>
          <TicketLayout viewModel={mockFormViewModel}>
            <FormDataGrid
              dataContext={mockFormDataGridField}
              columns={[
                {
                  title: "Asset Class",
                  field: "assetClass",
                },
                {
                  title: "ID",
                  field: "id",
                },
                {
                  title: "Name",
                  field: "name",
                },
                {
                  title: "Blank Field",
                },
              ]}
            />
          </TicketLayout>
        </MockTicketHost>,
        mockContainer
      );

      const view = render(sut);
      //screen.debug();
      const rows = screen.getAllByRole("row");
      
      expect(view).not.toBeNull();
      expect(rows.length).toBe(3); // header + 2 rows
      expect(screen.getByText("assetClassValue1"));

      const root = view.container.getElementsByClassName("formDataGridField")[0];
      fireEvent.focus(root);
      expect(mockFormDataGridField.onFocus).toBeCalled();
      fireEvent.blur(root);
      expect(mockFormDataGridField.onLostFocus).toBeCalled();
    });

    it("should not render grid", async () => {
      mockFormDataGridField.model.hidden = true;
      let sut = hostComponent(
        <MockTicketHost dataContext={mockFormViewModel}>
          <TicketLayout viewModel={mockFormViewModel}>
            <FormDataGrid
              dataContext={mockFormDataGridField}
              columns={[
                {
                  title: "Asset Class",
                  field: "assetClass",
                },
                {
                  title: "ID",
                  field: "id",
                },
                {
                  title: "Name",
                  field: "name",
                },
                {
                  title: "Blank Field",
                },
              ]}
            />
          </TicketLayout>
        </MockTicketHost>,
        mockContainer
      );

      const view = render(sut);
      //screen.debug();
    });

    it("Render editable grid", async () => {
      let sut = hostComponent(
        <MockTicketHost dataContext={mockFormViewModel}>
          <TicketLayout viewModel={mockFormViewModel}>
            <FormDataGrid
              dataContext={mockFormDataGridField}
              editable={true}
              columns={[
                {
                  title: "Asset Class",
                  field: "assetClass",
                },
              ]}
            />
          </TicketLayout>
        </MockTicketHost>,
        mockContainer
      );

      const view = render(sut);
      const rows = screen.getAllByRole("row");
      //screen.debug();
      expect(view).not.toBeNull();
      expect(rows.length).toBe(3); // header + 2 rows
      expect(screen.getByText("assetClassValue1"));
    });

    it("Render editable grid with header selection", async () => {

      mockFormDataGridField.headerSelectionChange = jest.fn();

      let sut = hostComponent(
        <MockTicketHost dataContext={mockFormViewModel}>
          <TicketLayout viewModel={mockFormViewModel}>
            <FormDataGrid
              dataContext={mockFormDataGridField}
              selectionSettings={{ enabled: true, headerSelection: true }}
              editable={true}
              columns={[
                {
                  title: "Asset Class",
                  field: "assetClass",
                },
              ]}
            />
          </TicketLayout>
        </MockTicketHost>,
        mockContainer
      );

      const view = render(sut);
      const rows = screen.getAllByRole("row");
      expect(view).not.toBeNull();
      expect(rows.length).toBe(3); // header + 2 rows
      expect(screen.getByText("assetClassValue1"));
      fireEvent.click(screen.getByText("assetClassValue1"));
      const checkbox = screen.getAllByRole("checkbox")
      fireEvent.click(checkbox[0]);
      expect(mockFormDataGridField.headerSelectionChange).toBeCalled();
    });
  });

  it("props from view takes precedence", async () => {
    let sut = hostComponent(
      <FormDataGrid
        dataContext={mockFormDataGridField}
        primaryKeys={["id"]}
        selectionSettings={{ enabled: true }}
        columns={[
          {
            title: "Asset Class",
            field: "assetClass",
          },
          {
            title: "ID",
            field: "id",
          },
          {
            title: "Name",
            field: "name",
          },
          {
            title: "Blank Field",
          },
        ]}
      />
    );

    render(sut);

    expect(mockFormDataGridField.columns.length).not.toBe(0);
    expect(mockFormDataGridField.model.primaryKeys).not.toBeNull();
    expect(mockFormDataGridField.selectionSettings.enabled).toBe(true);
  });
});
