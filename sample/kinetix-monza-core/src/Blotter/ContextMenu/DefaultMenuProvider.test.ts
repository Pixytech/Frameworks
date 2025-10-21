// reflect-metadata is required for IOC
import "reflect-metadata";
import { DefaultMenuProvider } from "./DefaultMenuProvider";
import { createMock } from "ts-auto-mock";
import { INavigationAware } from "@kinetix/core";
import { Helpers } from "../../Utils/Helpers";

// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped module
  let sut: DefaultMenuProvider;

  // Execute once before all tests
  // To create single module for all tests
  beforeEach(() => {
    sut = new DefaultMenuProvider();
    Object.assign(window.navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      },
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // Testing Component
  describe("DefaultMenuProvider", () => {
    // TEST:  Kinetix Monza Core > DefaultMenuProvider > should return default menu list for single context
    it("should return default menu list for single context", async () => {
      let context = { rows: [{}], cells: [["test"]] };
      let menu = await sut.getContextMenus("23", context);
      const mockParent = createMock<INavigationAware>();
      menu[0].onSelect(context, mockParent);

      let expectedResult = Helpers.jsonToFlatternText([["test"]]);
      expect(menu[0].id).toBe("copy");
      expect(menu[0].icon).toBe("copy");
      expect(menu[0].displayName).toBe("Copy");
      expect(menu[0].disabled).toBe(false);
      expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith(expectedResult);

      expect(menu.length).toBe(2);
      expect(menu[1].id).toBe("copyRow");
      expect(menu[1].icon).toBe("copy");
      expect(menu[1].displayName).toBe("Copy Row");
      expect(menu[1].disabled).toBe(false);
    });

    it("should return flatterned json object", async () => {
      let context = { rows: [{ data: "test0" }, { data: "test1" }] };
      let menu = await sut.getContextMenus("23", context);

      const mockParent = createMock<INavigationAware>();

      menu[1].onSelect(context, mockParent);

      let expectedResult = Helpers.jsonToFlatternText(context.rows);

      expect(menu[0].id).toBe("copy");
      expect(menu[0].icon).toBe("copy");
      expect(menu[0].displayName).toBe("Copy");
      expect(menu[0].disabled).toBe(false);

      expect(menu.length).toBe(2);
      expect(menu[1].id).toBe("copyRow");
      expect(menu[1].icon).toBe("copy");
      expect(menu[1].displayName).toBe("Copy Row");
      expect(menu[1].disabled).toBe(false);

      expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith(expectedResult);
    });

    it("onDoubleClick execute with valid operation", async () => {
      let selectedItem = [{ data: "test0" }, { data: "test1" }];
      const mockParent = createMock<INavigationAware>();
      await sut.onDoubleClick("23", { rows: [selectedItem] }, mockParent);
      //ToDo : add expection after impl
    });
  });
});
