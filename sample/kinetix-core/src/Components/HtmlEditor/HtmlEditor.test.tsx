import "reflect-metadata";
import { createMock } from "ts-auto-mock";
import { HtmlEditorModel, HtmlEditorViewModel, IEditorMenuItem, ISelection } from "./HtmlEditorViewModel";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { arrange, clearStubs, hostComponent, MockClipboardEvent } from "../../../../../testing";
import React from "react";
import { IContainer } from "../../IoC";
import { HtmlEditor, HtmlSnippet } from "./HtmlEditor";
import { EditorDispatchEvent, EditorMenuSelectEvent, EditorSelectionEvent, EditorSelectionPayload } from "./Events";
import { TextSelection } from "prosemirror-state";
import { Transaction } from "@progress/kendo-editor-common";
import { Editor } from "@progress/kendo-react-editor";
import { ReadOnlyPlugin } from "./Plugins";
// Base Package
describe("Kinetix Core", () => {
  class TestViewer extends HtmlEditorViewModel<HtmlEditorModel> {}

 

  // this is real data service mocking
  let dataContext: TestViewer;
  let mockContainer: IContainer;
  // Execute once before all tests
  // To create single module for all tests

  beforeEach(() => {
    dataContext = new TestViewer();
    mockContainer = createMock<IContainer>();
    dataContext.model.contextMenus = [
      { id: "Copy-text", displayName: "Copy text", subItems: [{ id: "Copy-text-submenu", displayName: "Copy text subMenu" }] },
      { id: "sep", isSeparator: true },
      { id: "Copy-text2", displayName: "Copy text2" },
    ];
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
    clearStubs();
  });

  // Testing Component
  describe("HtmlEditor", () => {
    // TEST:  Kinetix App > Registry > instance should be created
    it("should render html", async () => {
      dataContext.model.content = "<p>Somedata</p>";
      dataContext.model.contentCss = "p{ color:red}";
      expect(dataContext.nodeDOM(0)).toBe(null);
      expect(dataContext.onPreprocessHtml("test")).toBe("test");
      let sut = hostComponent(<HtmlEditor dataContext={dataContext} />, mockContainer);
      const view = render(sut);

      const reference = dataContext.getEditorReference();
      expect(reference.state).toBeDefined();

      expect(dataContext.getHtml()).toBeDefined();
    });

    it("should render html", async () => {
      let sut = hostComponent(<HtmlSnippet contentHtml="<p>Somedata</p>" style={{color:'red'}} />, mockContainer);
      const view = render(sut);

      const fragment = view.getByText("Somedata");
      expect(fragment).toBeDefined();
      
    });

    it("should render html after mount", async () => {
      dataContext.onSetStyle("p{ color:red}");

      let sut = hostComponent(<HtmlEditor dataContext={dataContext} />, mockContainer);
      const view = render(sut);

      dataContext.updateModel((m) => (m.content = "<p>Somedata</p>"));
      await waitFor(() => {
        expect(dataContext.getHtml()).toBeDefined();
      });
    });

    it("should render html evenwhen state is not defined", async () => {
      dataContext.model.content = "<p>Somedata</p>";
      dataContext.model.contentCss = "p{ color:red}";

      dataContext.onMount = (s) => {};
      let sut = hostComponent(<HtmlEditor dataContext={dataContext} />, mockContainer);
      const view = render(sut);

      await waitFor(() => {
        expect(dataContext.model.editorState).toBeDefined();
        const fragment = view.getByText("Somedata");

        expect(fragment).toBeDefined();
      });
    });

    it.skip("should dispatch event1", async () => {

      // mock this function that editor to determine text selection
      const createRange = () => {
        const range = new Range();

        range.getBoundingClientRect = jest.fn();
        const list :DOMRect[]=[createMock<DOMRect>({width:20,height:10,top:10,left:10})]
        range.getClientRects = () => {
          return {
            item: (i) => {
              return list[i]
            },
            length: list.length,
            
            [Symbol.iterator]: jest.fn(),
          };
        };

        return range;
      };

      //arrange(document).stubMethod("createRange",createRange)

      dataContext.model.content = "";
      dataContext.model.contentCss = "p{ color:red}";
      
      dataContext.onMount = (s) => {};
      let sut = hostComponent(<HtmlEditor dataContext={dataContext} />, mockContainer);
      const view = render(sut);

      const clipboardData = createMock<DataTransfer>();

      arrange(clipboardData).stubMethod("getData",()=>"SOMENEWHTML");

      dataContext.events.getEvent<EditorDispatchEvent>(EditorDispatchEvent,EditorDispatchEvent.Type).publish({
        event : new MockClipboardEvent("paste",{clipboardData})
      })
      // nothing to asset
    });

    it("should create schemes and plugins", async () => {
      dataContext.model.content = "<p>Somedata</p>";
      dataContext.model.contentCss = "p{ color:red}";

      dataContext["onCreatePlugins"] = jest.fn((currentPluginList) => {
        const plugins = [...currentPluginList, ReadOnlyPlugin];
        return plugins;
      });

      dataContext["onCreateSchema"] = jest.fn((x) => {
        return x;
      });
      dataContext["onPreprocessHtml"] = jest.fn((x) => {
        return x;
      });
      dataContext["onCreateNodeViews"] = jest.fn(() => {
        return undefined;
      });
      const onFocusProps = jest.fn();
      const onBlurProps = jest.fn();

      let sut = hostComponent(<HtmlEditor dataContext={dataContext} onFocus={onFocusProps} onBlur={onBlurProps} />, mockContainer);
      const view = render(sut);

      const field = view.getByRole("presentation");

      fireEvent.focus(field);
      fireEvent.blur(field);

      expect(dataContext.getHtml()).toBeDefined();
      expect(dataContext["onCreatePlugins"]).toBeCalled();
      expect(dataContext["onCreateSchema"]).toBeCalled();
      expect(dataContext["onPreprocessHtml"]).toBeCalled();
      expect(dataContext["onCreateNodeViews"]).toBeCalled();
      expect(onFocusProps).toBeCalled();
      expect(onBlurProps).toBeCalled();
    });

    it("selection of text with Context menu", async () => {
      dataContext.model.content = "<p>Somedata</p>";
      dataContext.model.contentCss = " p{ color:red}";

      let counter = 0;

      let sut = hostComponent(<HtmlEditor dataContext={dataContext} />, mockContainer);
      const view = render(sut);

      const field = view.getByRole("presentation");
      let editorSelectionPayload: EditorSelectionPayload | undefined;
      let menuSelect: IEditorMenuItem | undefined;
      dataContext.events.getEvent<EditorSelectionEvent>(EditorSelectionEvent, EditorSelectionEvent.Type).subscribe((x) => {
        editorSelectionPayload = x;
        dataContext.updateModel((x) => (x.showContextMenu = true));
      });

      dataContext.events.getEvent<EditorMenuSelectEvent>(EditorMenuSelectEvent, EditorMenuSelectEvent.Type).subscribe((x) => {
        menuSelect = x;
        dataContext.updateModel((x) => (x.showContextMenu = false));
      });

      fireEvent.focus(field);

      const fragment = view.getByText("Somedata");

      act(() => {
        if (fragment) {
          // mock this function that editor to determine text selection
          const createRange = () => {
            const range = new Range();

            range.getBoundingClientRect = jest.fn();

            range.getClientRects = () => {
              return {
                item: () => null,
                length: 0,
                [Symbol.iterator]: jest.fn(),
              };
            };

            return range;
          };

          // mock this function that editor to determine focused column

          const elementFromPoint = jest.fn((x, y) => {
            const el = fragment;

            return el;
          });

          arrange(document).stubMethod("createRange",createRange).stubMethod("elementFromPoint",elementFromPoint);
          
         

          fireEvent.focus(fragment);
          fireEvent.contextMenu(fragment);
          fireEvent.mouseDown(fragment);

          const mouse = [
            { clientX: 0, clientY: 0 },
            { clientX: 10, clientY: 10 },
          ];
          fireEvent.mouseDown(fragment, mouse[0]);
          fireEvent.mouseMove(fragment, mouse[1]);

          const state = dataContext.model.editorState;
          const docNode = state.doc.cut(0, 10);

          const editorSelection: ISelection = {
            from: 0,
            to: 10,
            text: docNode.textContent,
          };
          dataContext.updateModel((x) => (x.selection = editorSelection));
          fireEvent.mouseUp(fragment, mouse[1]);
        }
      });
      await waitFor(() => {
        expect(editorSelectionPayload).toBeDefined();
        expect(editorSelectionPayload?.selection).toBeDefined();
        expect(editorSelectionPayload?.selection.text).toBe("Somedata");
      });

      await waitFor(() => {
        expect(view.getByText("Copy text")).toBeDefined();
      });
      const copyTextMenu = view.getByText("Copy text");
      fireEvent.click(copyTextMenu);

      await waitFor(() => {
        expect(menuSelect).toBeDefined();
        expect(menuSelect?.id).toBe("Copy-text");
      });
    });

    it("should apply Transaction", async () => {
      dataContext.model.content = "<p>Somedata</p>";
      dataContext.model.contentCss = "p{ color:red}";

      expect(() => dataContext.applyTransaction(createMock<Transaction>())).toThrow("View is not ready to apply transactions");

      let sut = hostComponent(<HtmlEditor dataContext={dataContext} />, mockContainer);
      const view = render(sut);

      const field = view.getByRole("presentation");

      await waitFor(() => {
        expect(dataContext.applyTransaction).toBeDefined();
        const transaction = dataContext.model.editorState.tr;
        transaction.setSelection(TextSelection.create(dataContext.model.editorState.doc, 0, 10));
        dataContext.applyTransaction(transaction);
        expect(dataContext.model.selection).toBeDefined();
        expect(dataContext.model.selection.text).toBe("Somedata");
        expect(dataContext.model.selection.to).toBe(10);
        expect(dataContext.model.selection.from).toBe(0);
      });
    });

    it("should bound parent events with editor", async () => {
      dataContext.model.content = "<p>Somedata</p>";
      dataContext.model.contentCss = "p{ color:red}";

      expect(() => dataContext.applyTransaction(createMock<Transaction>())).toThrow("View is not ready to apply transactions");
      const ref = React.createRef<Editor>();
      let focused: any = undefined;
      let blured: any = undefined;

      let sut = hostComponent(
        <>
          <div>DUMMY</div>
          <HtmlEditor
            onFocus={(e) => {
              focused = e;
            }}
            onBlur={(e) => {
              blured = e;
            }}
            ref={ref}
            dataContext={dataContext}
          />
        </>,
        mockContainer
      );
      const view = render(sut);

      const field = view.getByRole("presentation");

      await waitFor(() => {
        expect(ref.current).toBeDefined();
      });

      fireEvent.focus(field);

      await waitFor(() => {
        expect(focused).toBeDefined();
      });

      fireEvent.blur(field);

      await waitFor(() => {
        expect(blured).toBeDefined();
      });
    });
  });
});
