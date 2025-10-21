// reflect-metadata is required for IOC
import "reflect-metadata";
import { CoreTypes, IContainer, IThemeService } from "@kinetix/core";
import { Module } from "./Module";
import { createMock } from "ts-auto-mock";
import { Registry } from "./Registry";
import { arrange } from "../../../testing";
import { TicketHook } from "./TicketHooks";
import { IUserSettings, UserSettings } from "./UserSettings";

// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped module
  let sut: Module;
  let mockContainer: IContainer;

  // Execute once before all tests
  // To create single module for all tests
  beforeEach(() => {
    sut = new Module();
    mockContainer = createMock<IContainer>();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // Testing Component
  describe("Module", () => {
    it("should include registry", () => {
      sut.onInitialized(mockContainer);
      expect(mockContainer.includeRegistry).toBeCalledWith(Registry);
    });

    it("TicketHook onload method should get called", () => {
      let mockTicketHook = createMock<TicketHook>();
      let mockThemeService = createMock<IThemeService>();
      let mockUserSetting = createMock<IUserSettings>();

      arrange(mockContainer).stubMethod(
        "build",
        () => {
          return mockThemeService;
        },
        [CoreTypes.IThemeService]
      );

      arrange(mockContainer).stubMethod(
        "build",
        () => {
          return mockUserSetting;
        },
        [UserSettings]
      );

      arrange(TicketHook).stubProperty("Instance", () => mockTicketHook);

      sut.onLoad(mockContainer);
    });
  });
});
