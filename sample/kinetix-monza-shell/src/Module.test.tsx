// reflect-metadata is required for IOC
import "reflect-metadata";
import { CoreTypes, IContainer, IThemeService } from "@kinetix/core";
import { Module } from "./Module";
import { createMock } from "ts-auto-mock";
import { Registry } from "./Registry";
import { arrange } from "../../../testing";

// Base Package
describe("Kinetix Monza Shell", () => {
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
    it("should include registry and load icos to theme service", () => {
      let mockThemeService = createMock<IThemeService>();
      arrange(mockContainer).stubMethod(
        "build",
        () => {
          return mockThemeService;
        },
        [CoreTypes.IThemeService]
      );

      sut.onInitialized(mockContainer);
      if (sut.onLoad) sut.onLoad(mockContainer);

      expect(mockContainer.includeRegistry).toBeCalledWith(Registry);
      expect(mockContainer.build).toBeCalledWith(CoreTypes.IThemeService);
      expect(mockThemeService.AddIcons).toBeCalled();
    });
  });
});
