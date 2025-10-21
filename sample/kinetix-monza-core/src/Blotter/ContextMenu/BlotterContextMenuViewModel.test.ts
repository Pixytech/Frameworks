// reflect-metadata is required for IOC
import "reflect-metadata";
import { arrange } from "../../../../../testing";
import { createMock } from "ts-auto-mock";
import { ComponentType, IContextMenuService, IMenuProvider, IMenuProviderType, MenuItem } from "..";
import { BlotterContextMenuViewModel } from "./BlotterContextMenuViewModel";
import { IContainer, INavigationAware } from "@kinetix/core";
import { Subject } from "rxjs";

// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped module
  let sut: BlotterContextMenuViewModel;
  let mockContainer: IContainer;
  let mockContextMenuService: IContextMenuService;
  let apiSubjectDelete = new Subject<any>();
  let mockIMenuProvider1: IMenuProvider;
  let mockIMenuProvider2: IMenuProvider;
  // Execute once before all tests
  // To create single module for all tests
  beforeEach(() => {
    mockContainer = createMock<IContainer>();

    mockIMenuProvider1 = createMock<IMenuProvider>();
    mockIMenuProvider2 = createMock<IMenuProvider>();
    mockContextMenuService = createMock<IContextMenuService>();
    sut = new BlotterContextMenuViewModel(mockContainer, mockContextMenuService);
    arrange(mockContainer).stubMethod(
      "buildAll",
      () => {
        return [mockIMenuProvider1, mockIMenuProvider2];
      },
      [IMenuProviderType]
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Testing Component
  describe("BlotterContextMenuViewModel", () => {
    it("should get all blotter adapters on init", async () => {
      arrange(mockIMenuProvider1)
        .stubProperty("ComponentId", () => ["MenuForBlotter1"])
        .stubProperty("ComponentType", () => ComponentType.Blotter);
      arrange(mockIMenuProvider2)
        .stubProperty("ComponentId", () => ["MenuForWidget1"])
        .stubProperty("ComponentType", () => ComponentType.Widget);

      await sut.initialize();

      expect(sut.menuProviders.length).toBe(1);
    });

    it("should get all blotter adapters including any on init", async () => {
      arrange(mockIMenuProvider1)
        .stubProperty("ComponentId", () => ["MenuForBlotter1"])
        .stubProperty("ComponentType", () => ComponentType.Blotter);

      arrange(mockIMenuProvider2)
        .stubProperty("ComponentId", () => [])
        .stubProperty("ComponentType", () => ComponentType.Any);

      await sut.initialize();

      expect(sut.menuProviders.length).toBe(2);
    });

    it("should call provider on onDoubleClick", async () => {
      arrange(mockIMenuProvider1)
        .stubProperty("ComponentId", () => ["MenuForBlotter1"])
        .stubProperty("ComponentType", () => ComponentType.Blotter);

      arrange(mockIMenuProvider2)
        .stubProperty("ComponentId", () => [])
        .stubProperty("ComponentType", () => ComponentType.Any);

      await sut.initialize();

      await sut.onDoubleClick("MenuForBlotter1", "TestDataset", { rows: ["data"] });

      expect(mockIMenuProvider1.onDoubleClick).toBeCalledWith("TestDataset", { rows: ["data"] }, expect.anything());
    });

    it("should do nothing onDoubleClick if no provider", async () => {
      arrange(mockIMenuProvider1)
        .stubProperty("ComponentId", () => ["MenuForBlotter1"])
        .stubProperty("ComponentType", () => ComponentType.Blotter);

      arrange(mockIMenuProvider2)
        .stubProperty("ComponentId", () => ["MenuForBlotter2"])
        .stubProperty("ComponentType", () => ComponentType.Widget);

      await sut.initialize();

      await sut.onDoubleClick("MenuForBlotterXXXX", "TestDataset", { rows: ["data"] });

      expect(mockIMenuProvider1.onDoubleClick).not.toBeCalled();
      expect(mockIMenuProvider2.onDoubleClick).not.toBeCalled();
    });

    it("should not provide menu or seperator when no items", async () => {
      arrange(mockIMenuProvider1)
        .stubProperty("ComponentId", () => ["MenuForBlotter1"])
        .stubProperty("ComponentType", () => ComponentType.Blotter);

      arrange(mockIMenuProvider2)
        .stubProperty("ComponentId", () => [])
        .stubProperty("ComponentType", () => ComponentType.Any);

      await sut.initialize();

      await sut.onContextMenu({ top: 10, left: 20 }, "MenuForBlotter1", "TestDataset", { rows: ["data"] });

      expect(mockIMenuProvider1.getContextMenus).toBeCalledTimes(1);
      expect(mockIMenuProvider2.getContextMenus).toBeCalledTimes(1);
      expect(sut.Menus.length).toBe(0);
      expect(sut.model.show).toBe(false);
    });

    it("should provide menu with seperator", async () => {
      arrange(mockIMenuProvider1)
        .stubProperty("ComponentId", () => ["MenuForBlotter1"])
        .stubProperty("ComponentType", () => ComponentType.Blotter)
        .stubMethod("getContextMenus", () => {
          return [
            {
              id: "Menu1",
              onSelect: jest.fn(),
            },
            {
              id: "Menu2",
              onSelect: jest.fn(),
            },
          ] as MenuItem[];
        });

      arrange(mockIMenuProvider2)
        .stubProperty("ComponentId", () => [])
        .stubProperty("ComponentType", () => ComponentType.Any)
        .stubMethod("getContextMenus", () => {
          return [
            {
              id: "Menu3",
              onSelect: jest.fn(),
            },
            {
              id: "Menu4",
              onSelect: jest.fn(),
            },
          ] as MenuItem[];
        });

      await sut.initialize();

      await sut.onContextMenu({ top: 10, left: 20 }, "MenuForBlotter1", "TestDataset", { rows: ["data"] });

      expect(mockIMenuProvider1.getContextMenus).toBeCalledTimes(1);
      expect(mockIMenuProvider2.getContextMenus).toBeCalledTimes(1);
      // 2 menu 1 seperator 2 menu
      expect(sut.Menus.length).toBe(5);
      expect(sut.Menus[2].isSeparator).toBe(true);
      expect(sut.model.show).toBe(true);
    });

    it("should provide menu with no seperator in the end", async () => {
      arrange(mockIMenuProvider1)
        .stubProperty("ComponentId", () => ["MenuForBlotter1"])
        .stubProperty("ComponentType", () => ComponentType.Blotter)
        .stubMethod("getContextMenus", () => {
          return [
            {
              id: "Menu1",
              onSelect: jest.fn(),
            },
            {
              id: "Menu2",
              onSelect: jest.fn(),
            },
          ] as MenuItem[];
        });

      arrange(mockIMenuProvider2)
        .stubProperty("ComponentId", () => ["WIDGET"])
        .stubProperty("ComponentType", () => ComponentType.Widget)
        .stubMethod("getContextMenus", () => {
          return [
            {
              id: "Menu3",
              onSelect: jest.fn(),
            },
            {
              id: "Menu4",
              onSelect: jest.fn(),
            },
          ] as MenuItem[];
        });

      await sut.initialize();

      await sut.onContextMenu({ top: 10, left: 20 }, "MenuForBlotter1", "TestDataset", { rows: ["data"] });

      expect(mockIMenuProvider1.getContextMenus).toBeCalledTimes(1);
      expect(mockIMenuProvider2.getContextMenus).toBeCalledTimes(0);
      // 2 menu , no seperator
      expect(sut.Menus.length).toBe(2);
      expect(sut.model.show).toBe(true);
    });
  });

  it("should trigger action on select", async () => {
    arrange(mockIMenuProvider1)
      .stubProperty("ComponentId", () => ["MenuForBlotter1"])
      .stubProperty("ComponentType", () => ComponentType.Blotter)

      .stubMethod("getContextMenus", () => {
        return [
          {
            id: "Menu1",
            onSelect: jest.fn(),
          },
          {
            id: "Menu2",
            onSelect: jest.fn(),
          },
        ] as MenuItem[];
      });

    arrange(mockIMenuProvider2)
      .stubProperty("ComponentId", () => [])
      .stubProperty("ComponentType", () => ComponentType.Any)
      .stubMethod("getContextMenus", () => {
        return [
          {
            id: "Menu3",
            onSelect: jest.fn(),
          },
          {
            id: "Menu4",
            onSelect: jest.fn(),
          },
        ] as MenuItem[];
      });

    await sut.initialize();

    await sut.onContextMenu({ top: 10, left: 20 }, "MenuForBlotter1", "TestDataset", { rows: ["data"] });

    const mockParent = createMock<INavigationAware>();

    // Act

    await sut.onSelect("Menu1");
    await sut.onSelect("seperator1"); // just for code coverage

    //click on item
    await sut.Menus[0].onSelect({ rows: [] }, mockParent);
    //click on seperator
    await sut.Menus[2].onSelect({ rows: [] }, mockParent);

    expect(sut.Menus[0].onSelect).toBeCalled();
    expect(sut.Menus[2].isSeparator).toBe(true);
  });
});
