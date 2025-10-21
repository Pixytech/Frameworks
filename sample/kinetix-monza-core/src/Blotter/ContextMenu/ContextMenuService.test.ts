// reflect-metadata is required for IOC
import "reflect-metadata";
import { arrange } from "../../../../../testing";
import { IContextMenuService, ContextMenuService } from "./ContextMenuService";
import { ComponentType } from "./ComponentType";
import { IRestClient } from "@kinetix/core";
import { createMock } from "ts-auto-mock";
import { Subject } from "rxjs";

// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped module
  let sut: IContextMenuService;
  let mockApiClient: IRestClient;

  // Execute once before all tests
  // To create single module for all tests
  beforeEach(() => {
    mockApiClient = createMock<IRestClient>();
    sut = new ContextMenuService(mockApiClient);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // Testing Component
  describe("ContextMenuService", () => {
    // TEST:  Kinetix Monza Core > ContextMenuService > should return default menu list for single context
    it("getContextMenus should get valid list of actions", async () => {
      let subject = new Subject<any>();

      arrange(mockApiClient).stubMethod("post", () => {
        setTimeout(() => {
          subject.next({ actions: ["New"] });
        }, 1);
        return subject;
      });

      let menus = await sut.getContextMenus("app", "23", ComponentType.Blotter, ["TestBlotter"]);

      expect(menus.length).toBe(1);
      expect(menus[0]).toBe("New");
    });
  });
});
