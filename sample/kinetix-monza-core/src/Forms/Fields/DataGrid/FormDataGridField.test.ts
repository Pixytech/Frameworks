// reflect-metadata is required for IOC
import "reflect-metadata";

import { createMock } from "ts-auto-mock";
import { FormDataGridField } from "./FormDataGridField";
import { IFormViewModel } from "../../IFormViewModel";
import { FormModel } from "../../FormModel";
import { GridExpandChangeEvent, GridHeaderSelectionChangeEvent, GridSelectionChangeEvent, getSelectedState } from "@progress/kendo-react-grid";
import { arrange, stubComponent } from "../../../../../../testing";
import { DATA_ITEM_KEY, EDIT_FIELD } from "../../../Blotter/Utils/constants";
import { TestScheduler } from "rxjs/testing";
import { lastValueFrom } from "rxjs";

// Base Package
describe("Kinetix Monza core", () => {
  // Scoped module
  let sut: FormDataGridField;
  let mockOwner: IFormViewModel<FormModel>;
  // Execute once before all tests
  // To create single module for all tests
  beforeEach(() => {
    mockOwner = createMock<IFormViewModel<FormModel>>({ model: new (class e extends FormModel {})() });
    sut = new FormDataGridField(mockOwner);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("FormDataGridField", () => {
    it("should have model", async () => {
      await sut.initialize();
      expect(sut.model).not.toBeNull();
    });

    const testScheduler = new TestScheduler((actual, expected) => {
      // asserting the two objects are equal - required
      // for TestScheduler assertions to work via your test framework
      // e.g. using chai.
      expect(actual).toEqual(expected);
    });

    it("should update selection", async () => {
      const mockEvent = createMock<GridSelectionChangeEvent>();
      stubComponent<typeof getSelectedState>("getSelectedState", "@progress/kendo-react-grid", () => {
        return { "0": true };
      });
      mockEvent.dataItem = { [DATA_ITEM_KEY]: "0" };
      sut.model.items = [mockEvent.dataItem];
      sut.selectionChange(mockEvent);
      expect(sut.model.getSelectedItems().length).toBe(1);
    });

    it("should update state on detailed row expansion", async () => {
      const mockEvent = createMock<GridExpandChangeEvent>();
      mockEvent.value = true;
      mockEvent.dataItem = {};
      sut.expandChange(mockEvent);
      expect(sut.model.detailedRowExpandState.length).toBe(1);
    });

    it("should update state on detailed row collapse", async () => {
      const mockEvent = createMock<GridExpandChangeEvent>();
      mockEvent.value = false;
      mockEvent.dataItem = { [DATA_ITEM_KEY]: "1" };
      sut.model.detailedRowExpandState = ["1"];
      sut.expandChange(mockEvent);
      expect(sut.model.detailedRowExpandState.length).toBe(0);
    });

    it("should update state on group expansion", async () => {
      const mockEvent = createMock<GridExpandChangeEvent>();
      mockEvent.value = false;
      mockEvent.dataItem = { groupId: "some" };
      sut.expandChange(mockEvent);
      expect(sut.model.collapsedState.length).toBe(1);
    });

    it("should update state on group collapse", async () => {
      const mockEvent = createMock<GridExpandChangeEvent>();
      mockEvent.value = true;
      mockEvent.dataItem = { groupId: "some" };
      sut.model.collapsedState = ["some"];
      sut.expandChange(mockEvent);
      expect(sut.model.detailedRowExpandState.length).toBe(0);
    });

    it("should update selection", async () => {
      const mockEvent = createMock<GridHeaderSelectionChangeEvent>();

      arrange(mockEvent).stubProperty("syntheticEvent", () => {
        return {
          target: {
            checked: true,
          },
        } as any;
      });

      sut.model.items = [{ [DATA_ITEM_KEY]: "0" }];
      sut.headerSelectionChange(mockEvent);
      expect(sut.model.getSelectedItems().length).toBe(1);
    });

    it("should update item", async () => {
      sut.model.items = [{ [DATA_ITEM_KEY]: "0", test: "old" }];
      sut.itemChange("test", sut.model.items[0], "new");
      expect(sut.model.items[0].test).toBe("new");
    });

    it("should enter edit mode", async () => {
      sut.model.items = [{ [DATA_ITEM_KEY]: "0" }];
      sut.columns = [{ field: "fieldName", editable: true }];
      sut.enterEdit(sut.model.items[0], "fieldName");
      expect(sut.model.items[0][EDIT_FIELD]).toBe("fieldName");
    });

    it("should update on exit edit mode", async () => {
      sut.model.items = [{ [DATA_ITEM_KEY]: "0", [EDIT_FIELD]: "fieldName" }];
      sut.columns = [{ field: "fieldName", editable: true }];
      sut.exitEdit();
      expect(sut.model.items[0][EDIT_FIELD]).toBe(undefined);
    });

    it("raise event on row click", async () => {
      testScheduler.run(async (helpers) => {
        sut.model.items = [{ [DATA_ITEM_KEY]: "0" }];
        sut.rowClicked(sut.model.items[0]);

        await expect(lastValueFrom(sut.onRowClicked)).resolves.toEqual(sut.model.items[0]);
      });
    });
  });
});
