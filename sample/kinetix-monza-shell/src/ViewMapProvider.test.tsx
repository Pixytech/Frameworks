// reflect-metadata is required for IOC
import "reflect-metadata";
import { IViewResolver } from "@kinetix/core";
import { ViewMapProvider } from "./ViewMapProvider";
import { WorkspaceViewModel } from "./Components/Workspace/WorkspaceViewModel";
import { HeaderViewModel } from "./Components/WorkspaceHeader/HeaderViewModel";
import { AppsViewModel } from "./Components/WorkspaceItems/Apps/AppsViewModel";
import { createMockViewResolver } from "../../../testing/core";
import { ExternalAppLauncher } from "./Components/WorkspaceItems/Apps/ExternalAppLauncher";

// Base Package
describe("Kinetix Monza Shell", () => {
  // Scoped module
  let sut: ViewMapProvider;
  let mockResolver: IViewResolver;

  // Execute once before each tests
  // To create single module for each tests
  beforeEach(() => {
    sut = new ViewMapProvider();
    mockResolver = createMockViewResolver();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // Testing Component
  describe("ViewMapProvider", () => {
    // TEST:  Kinetix Monza Shell > ViewMapProvider > should map HeaderViewModel
    it("should map HeaderViewModel", () => {
      sut.provideMap(mockResolver);
      expect(mockResolver.register).toBeCalledWith(expect.anything(), HeaderViewModel);
    });

    // TEST:  Kinetix Monza Shell > ViewMapProvider > should map WorkspaceViewModel
    it("should map WorkspaceViewModel", () => {
      sut.provideMap(mockResolver);
      expect(mockResolver.register).toBeCalledWith(expect.anything(), WorkspaceViewModel);
    });

    it("should map ExternalAppLauncher", () => {
      sut.provideMap(mockResolver);
      expect(mockResolver.register).toBeCalledWith(expect.anything(), ExternalAppLauncher);
    });

    // TEST:  Kinetix Monza Shell > ViewMapProvider > should map AppsViewModel
    it("should map AppsViewModel", () => {
      sut.provideMap(mockResolver);
      expect(mockResolver.register).toBeCalledWith(expect.anything(), AppsViewModel);
    });
  });
});
