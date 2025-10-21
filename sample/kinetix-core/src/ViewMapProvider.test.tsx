// reflect-metadata is required for IOC
import "reflect-metadata";

import { ViewMapProvider } from "./ViewMapProvider";
import { createMockViewResolver } from "../../../testing/core";
import { MessageBoxViewModel, TooltipViewModel } from "./Components";
import { NotificationsPanel } from "./Components/Notifications/Views/NotificationsPanel";
import { IViewResolver } from "./Mvvm";

// Base Package
describe("Kinetix Core", () => {
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
    // TEST:  Kinetix Core > ViewMapProvider > should map MessageBoxViewModel
    it("should map MessageBoxViewModel", () => {
      sut.provideMap(mockResolver);
      expect(mockResolver.register).toBeCalledWith(expect.anything(), MessageBoxViewModel);
    });

    it("should map NotificationsPanel", () => {
      sut.provideMap(mockResolver);
      expect(mockResolver.register).toBeCalledWith(expect.anything(), NotificationsPanel);
    });
  });
});
