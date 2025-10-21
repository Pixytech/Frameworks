// reflect-metadata is required for IOC
import "reflect-metadata";
import { FormHtmlEditorField } from "./FormHtmlEditorField";
import { createMock } from "ts-auto-mock";
import { EditorState, Plugin } from "prosemirror-state";
import React from "react";
import { TextSelection } from "prosemirror-state";
import { Transaction } from "@progress/kendo-editor-common";
import { MenuItemModel, MenuSelectEvent } from "@progress/kendo-react-layout";
// Base Package
describe("Kinetix Monza Core", () => {
  // Testing Component
  describe("FormDataTimeField", () => {
    let field: FormHtmlEditorField;

    beforeAll(() => {
      field = new FormHtmlEditorField();
    });

    it("applyTransaction should throw error without view", () => {
      expect(() => field.applyTransaction(createMock<Transaction>())).toThrow("View is not ready to apply transactions");

      const reference = field.getEditorReference();
      expect(reference.nodeDOM(0)).toBe(null);
      expect(field.onPreprocessHtml("test")).toBe("test");
    });

    it("Set HtmlEditor", () => {
      field.value = "<div>SOME</div>";
      expect(field.value).toBe("<div>SOME</div>");

      field.onContextMenu(createMock<React.MouseEvent<HTMLDivElement, MouseEvent>>());
      field.onMenuSelect(createMock<MenuSelectEvent>({ item: createMock<MenuItemModel>(), itemId: "some" }));
      field.onSetStyle(".myClass { width:100% } ");

      field.model.editorState = createMock<EditorState>();
      expect(field.getHtml()).toBeDefined();
      expect(field.model.contentCss).toContain("#editor");
      expect(field.model.originalCss).toEqual(".myClass { width:100% } ");
      
      field.onMount(createMock<EditorState>());
    });
  });
});
