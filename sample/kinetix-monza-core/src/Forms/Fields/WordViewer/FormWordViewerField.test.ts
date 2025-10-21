// reflect-metadata is required for IOC
import "reflect-metadata";
import { FormWordViewerField } from "./FormWordViewerField";
import { createMock } from "ts-auto-mock";
import { MenuItemModel, MenuSelectEvent } from "@progress/kendo-react-layout";
import { clearStubs } from "../../../../../../testing";
import { ContextMenuOpenEvent, ContextMenuOpenPayload, EditorMenuSelectEvent, IEditorMenuItem } from "@kinetix/core";
import { cleanup } from "@testing-library/react";
import React from "react";
// Base Package
describe("Kinetix Monza Core", () => {
  // Testing Component
  describe("FormDataTimeField", () => {
    let field: FormWordViewerField;

    beforeEach(() => {
      field = new FormWordViewerField();
    });

    afterEach(() => {
    cleanup();
    jest.resetAllMocks();
    clearStubs();
  });

    it("should initialize view model", async () => {
      await field.initialize();

      expect(field.model).toBeDefined();

      expect(field.model.isLoaded).toBe(false);

      field.onContextMenu(createMock<React.MouseEvent<HTMLDivElement, MouseEvent>>());
      field.onMenuSelect(createMock<MenuSelectEvent>({ item: createMock<MenuItemModel>(), itemId: "some" }));
    });

    it("should return undefined on range error", async () => {
      let range = field.tryGetSelectionRange(null);
      expect(range).toBeUndefined();

      const selection = createMock<Selection>();
      range = field.tryGetSelectionRange(selection);
      expect(range).toBeUndefined();
    });

    it("should return range", async () => {
      const selection = createMock<Selection>({
        getRangeAt: (index) => {
          const range = createMock<Range>({ startOffset: 20, endOffset: 30 });
          return range;
        },
      });

      const range = field.tryGetSelectionRange(selection);
      expect(range).toBeDefined();
    });

    it("should raise notification on menuselect", async () => {
      field.model.contextMenus = [{ id: "some" }];

      let menuItem: IEditorMenuItem | undefined = undefined;
      field.events.getEvent<EditorMenuSelectEvent>(EditorMenuSelectEvent, EditorMenuSelectEvent.Type).subscribe((x) => {
        menuItem = x;
      });

      field.onMenuSelect(createMock<MenuSelectEvent>({ itemId: "some", item: { data: { id: "some" } } }));
      expect(menuItem).toBeDefined();
    });

    it("should raise context menu", async () => {
      field.model.contextMenus = [{ id: "some" }];

      let menuItem: ContextMenuOpenPayload | undefined = undefined;
      field.events.getEvent<ContextMenuOpenEvent>(ContextMenuOpenEvent, ContextMenuOpenEvent.Type).subscribe((x) => {
        menuItem = x;
      });

      field.onContextMenu(createMock<React.MouseEvent<HTMLDivElement, MouseEvent>>({ pageX: 10, pageY: 20 }));
      expect(menuItem).toBeDefined();
    });
  });
});
