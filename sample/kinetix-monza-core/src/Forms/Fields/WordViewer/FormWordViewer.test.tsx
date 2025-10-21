// reflect-metadata is required for IOC
import "reflect-metadata";
import React, {  } from "react";
import { createMock } from "ts-auto-mock";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FormWordViewerField, FormWordViewerModel } from "./FormWordViewerField";
import { arrange, arrangeViewModel, clearStubs, hostComponent } from "../../../../../../testing";
import { FormWordViewer } from "./FormWordViewer";
import { TicketLayout } from "../../TicketLayout";
import { FormViewModel } from "../../FormViewModel";
import { FormModel } from "../../FormModel";
import { WordViewerToolbar } from "./WordViewerToolbar";
import { EventAggregator } from "@kinetix/core";


// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped module

  let mockViewModel: FormWordViewerField;
  let mockFormViewModel: MockFormViewModel;

  class MockFormViewModel extends FormViewModel<FormModel> {
    protected async onFormInitialize(): Promise<void> {}

    protected createModel(): FormModel {
      return new (class extends FormModel {})();
    }

    field: FormWordViewerField;
  }

  beforeEach(() => {

    mockFormViewModel = createMock<MockFormViewModel>({ model: new (class extends FormModel {})() });

    mockViewModel = createMock<FormWordViewerField>({ model: new FormWordViewerModel(), events: new EventAggregator(), toolbar: new WordViewerToolbar() });

    mockViewModel.model.contextMenus = [{ id: "Copy text", displayName: "Copy text" }];

    const range = createMock<Range>({
      cloneContents: () => createMock<DocumentFragment>({ textContent: "some-selection" }),
      startOffset: 10,
      endOffset: 20,
    });

    arrange(mockViewModel).stubMethod("tryGetSelectionRange", () => range);

    arrangeViewModel(mockFormViewModel)
      .acceptModelChanges()
      .acceptViewChanges()
      .stubProperty("field", () => mockViewModel);
  });

  // Note: running cleanup afterEach is done automatically for you in @testing-library/react@9.0.0 or higher
  // unmount and cleanup DOM after the test is finished.
  afterEach(() => {
    cleanup();
    jest.resetAllMocks();
    clearStubs();
  });

  // Testing Component
  describe("DocumentViewerView", () => {
    it("component should be created without style attribute", async () => {
      let sut = hostComponent(
        <TicketLayout viewModel={mockFormViewModel}>
          <FormWordViewer selectionMode="text" dataContext={mockFormViewModel.field} activeTools={["some", "some2"]} additionalTools={{ some: <div>Tool1</div>, some2: <div>Tool2</div> }} />
        </TicketLayout>
      );
      render(sut);
      await waitFor(() => {
        expect(screen.getByText("Loading document")).toBeInTheDocument();
        expect(screen.getByText("Tool1")).toBeInTheDocument();
      });
    });

    it("Should render Word", async () => {
      arrangeViewModel(mockViewModel).acceptModelChanges().acceptViewChanges();
      //https://jsfiddle.net/Wordjs/cq0asLqz/
      // Hello,World! Word
      mockViewModel.model.isLoaded = true;
      mockViewModel.model.documentUrl = window.origin;
      // Change the viewport to 500px.

      let sut = hostComponent(
        <TicketLayout viewModel={mockFormViewModel}>
          <FormWordViewer selectionMode="pan" dataContext={mockFormViewModel.field} leftPanel={<>LEFT-PANEL</>} rightPanel={<>RIGHT-PANEL</>} activeTools={[]} additionalTools={{ some: <div>Tool1</div>, some2: <div>Tool2</div> }} />
        </TicketLayout>
      );

      window.innerWidth = 500;

      render(sut);

      /* act(() => {
        // Trigger the window resize event.
        window.innerWidth = 600;
        window.dispatchEvent(new Event("resize"));
      }); */

      //wont work becuase Word.js need worker thread setup
      await waitFor(() => {
        expect(screen.getByText("Preparing documents")).toBeInTheDocument();
        expect(screen.getByText("LEFT-PANEL")).toBeInTheDocument();
        expect(screen.getByText("RIGHT-PANEL")).toBeInTheDocument();
      });
      fireEvent.contextMenu(screen.getByText("Preparing documents"));
      fireEvent.mouseUp(screen.getByText("Preparing documents"));

      await waitFor(() => {
        //expect(mockFormViewModel.field.model.selection.text).toBe("some-selection");
      });
    });
  });
});
