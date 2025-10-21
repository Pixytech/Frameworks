// reflect-metadata is required for IOC
import "reflect-metadata";
import React, { useEffect, useRef } from "react";
import { createMock } from "ts-auto-mock";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FormPdfViewerField, FormPdfViewerModel } from "./FormPdfViewerField";
import { arrange, arrangeViewModel, clearStubs, hostComponent, stubComponent } from "../../../../../../testing";
import { FormPdfViewer } from "./FormPdfViewer";
import { TicketLayout } from "../../TicketLayout";
import { FormViewModel } from "../../FormViewModel";
import { FormModel } from "../../FormModel";
import { PdfStandardTools, PdfViewerToolbar } from "./PdfViewerToolbar";
import { LoadEvent, PDFViewer, PDFViewerProps } from "@progress/kendo-react-pdf-viewer";
import { Button, ToolbarProps, ToolbarSpacer } from "@progress/kendo-react-buttons";
import { PagerProps } from "@progress/kendo-react-data-tools";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { EventAggregator } from "@kinetix/core";

const DummyPdfViewer = (props: PDFViewerProps) => {
  const rootRef = useRef(null);
  useEffect(() => {
    if (props.onLoad) {
      props.onLoad(
        createMock<LoadEvent>({
          target: {
            element: rootRef.current,
          },
        })
      );
    }
    if (props.onRenderToolbar) {
      //const outOfBoxTools: PDFViewerTool[] = ["pager", "spacer", "zoomInOut", "zoom", "selection", "search", "open", "download", "print"];
      const defRendering = createMock<React.ReactElement<ToolbarProps>>({
        props: {
          children: [
            <div {...createMock<PagerProps>()}></div>,
            <ToolbarSpacer />,
            <>
              <Button />
              <Button />
            </>,
            <DropDownList />,
            <>
              <Button />
              <Button />
            </>,
            <Button>search</Button>,
            <>
              <Button>open</Button>
              <div></div>
            </>,
            <Button>download</Button>,
            <Button>print</Button>,
          ],
        },
      });

      props.onRenderToolbar(defRendering);
    }
  }, []);
  return <div ref={rootRef}>{props.data}</div>;
};

// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped module

  let mockViewModel: FormPdfViewerField;
  let mockFormViewModel: MockFormViewModel;

  class MockFormViewModel extends FormViewModel<FormModel> {
    protected async onFormInitialize(): Promise<void> {}

    protected createModel(): FormModel {
      return new (class extends FormModel {})();
    }

    field: FormPdfViewerField;
  }

  beforeEach(() => {
    // pdf viewer will not work in tests as it need worker process
    stubComponent<typeof PDFViewer>("PDFViewer", "@progress/kendo-react-pdf-viewer", (props: PDFViewerProps) => <DummyPdfViewer {...props} />);

    mockFormViewModel = createMock<MockFormViewModel>({ model: new (class extends FormModel {})() });

    mockViewModel = createMock<FormPdfViewerField>({ model: new FormPdfViewerModel(), events: new EventAggregator(), toolbar: new PdfViewerToolbar() });

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
          <FormPdfViewer selectionMode="text" dataContext={mockFormViewModel.field} activeTools={[PdfStandardTools.spacer, PdfStandardTools.download, PdfStandardTools.open, PdfStandardTools.pager, PdfStandardTools.print, PdfStandardTools.search, PdfStandardTools.selectionPan, PdfStandardTools.selectionText, PdfStandardTools.zoom, PdfStandardTools.zoomIn, PdfStandardTools.zoomOut, "some", "some2"]} additionalTools={{ some: <div>Tool1</div>, some2: <div>Tool2</div> }} />
        </TicketLayout>
      );
      render(sut);
      await waitFor(() => {
        expect(screen.getByText("Loading document")).toBeInTheDocument();
        expect(screen.getByText("Tool1")).toBeInTheDocument();
      });
    });

    it("Should render PDF", async () => {
      arrangeViewModel(mockViewModel).acceptModelChanges().acceptViewChanges();
      //https://jsfiddle.net/pdfjs/cq0asLqz/
      // Hello,World! pdf
      mockViewModel.model.isLoaded = true;
      mockViewModel.model.pdfContent = "Hello,World! pdf";
      // Change the viewport to 500px.

      let sut = hostComponent(
        <TicketLayout viewModel={mockFormViewModel}>
          <FormPdfViewer selectionMode="pan" dataContext={mockFormViewModel.field} leftPanel={<>LEFT-PANEL</>} rightPanel={<>RIGHT-PANEL</>} activeTools={[PdfStandardTools.spacer, PdfStandardTools.download, PdfStandardTools.open, PdfStandardTools.pager, PdfStandardTools.print, PdfStandardTools.search, PdfStandardTools.selectionPan, PdfStandardTools.selectionText, PdfStandardTools.zoom, PdfStandardTools.zoomIn, PdfStandardTools.zoomOut, "some", "some2"]} additionalTools={{ some: <div>Tool1</div>, some2: <div>Tool2</div> }} />
        </TicketLayout>
      );

      window.innerWidth = 500;

      render(sut);

      /* act(() => {
        // Trigger the window resize event.
        window.innerWidth = 600;
        window.dispatchEvent(new Event("resize"));
      }); */

      //wont work becuase pdf.js need worker thread setup
      await waitFor(() => {
        expect(screen.getByText("Hello,World! pdf")).toBeInTheDocument();
        expect(screen.getByText("LEFT-PANEL")).toBeInTheDocument();
        expect(screen.getByText("Tool1")).toBeInTheDocument();
        expect(screen.getByText("Tool2")).toBeInTheDocument();
      });
      fireEvent.contextMenu(screen.getByText("Hello,World! pdf"));
      fireEvent.mouseUp(screen.getByText("Hello,World! pdf"));

      await waitFor(() => {
        expect(mockFormViewModel.field.model.selection.text).toBe("some-selection");
      });
    });
  });
});
