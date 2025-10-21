// reflect-metadata is required for IOC
import "reflect-metadata";
import { IViewResolver } from "@kinetix/core";
import { ViewMapProvider } from "./ViewMapProvider";
import { ConfigurationEditorViewModel, BlotterToolbarViewModel, BlotterCellFormattingViewModel, BlotterColumnConfigViewModel, BlotterCustomFilterViewModel, BlotterViewModel, BlotterCellFormatOptionsPopupViewModel } from "./Blotter";

import { TradingCoreTypes } from "./TradingCoreTypes";
import { WidgetContainerViewModel, PieWidgetViewModel, TopNWidgetViewModel, BarWidgetViewModel, LiveInquiryWidgetViewModel } from "./Widgets";
import { HeaderViewModel, MainToolbarViewModel } from ".";
import { createMockViewResolver } from "../../../testing/core";

// Base Package
describe("Kinetix Monza Core", () => {
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
    // TEST:  Kinetix Monza Core > ViewMapProvider > should map ConfigurationEditorViewModel
    it("should map ConfigurationEditorViewModel", () => {
      sut.provideMap(mockResolver);

      expect(mockResolver.register).toBeCalledWith(expect.anything(), HeaderViewModel);
      expect(mockResolver.register).toBeCalledWith(expect.anything(), ConfigurationEditorViewModel);
    });

    // TEST:  Kinetix Monza Core > ViewMapProvider > should map BlotterToolbarViewModel
    it("should map BlotterToolbarViewModel", () => {
      sut.provideMap(mockResolver);
      expect(mockResolver.register).toBeCalledWith(expect.anything(), BlotterToolbarViewModel);
    });

    // TEST:  Kinetix Monza Core > ViewMapProvider > should map WidgetContainerViewModel
    it("should map WidgetContainerViewModel", () => {
      sut.provideMap(mockResolver);
      expect(mockResolver.register).toBeCalledWith(expect.anything(), WidgetContainerViewModel);
    });

    // TEST:  Kinetix Monza Core > ViewMapProvider > should map PieWidgetViewModel
    it("should map PieWidgetViewModel", () => {
      sut.provideMap(mockResolver);
      expect(mockResolver.register).toBeCalledWith(expect.anything(), PieWidgetViewModel);
    });

    // TEST:  Kinetix Monza Core > ViewMapProvider > should map TopNWidgetViewModel
    it("should map TopNWidgetViewModel", () => {
      sut.provideMap(mockResolver);
      expect(mockResolver.register).toBeCalledWith(expect.anything(), TopNWidgetViewModel);
    });

    // TEST:  Kinetix Monza Core > ViewMapProvider > should map BarWidgetViewModel
    it("should map BarWidgetViewModel", () => {
      sut.provideMap(mockResolver);
      expect(mockResolver.register).toBeCalledWith(expect.anything(), BarWidgetViewModel);
    });

    // TEST:  Kinetix Monza Core > ViewMapProvider > should map LiveInquiryWidgetViewModel
    it("should map LiveInquiryWidgetViewModel", () => {
      sut.provideMap(mockResolver);
      expect(mockResolver.register).toBeCalledWith(expect.anything(), LiveInquiryWidgetViewModel);
    });

    // TEST:  Kinetix Monza Core > ViewMapProvider > should map BlotterViewModel
    it("should map BlotterViewModel", () => {
      sut.provideMap(mockResolver);
      expect(mockResolver.register).toBeCalledWith(expect.anything(), BlotterViewModel, TradingCoreTypes.Blotter);
    });

    // TEST:  Kinetix Monza Core > ViewMapProvider > should map BlotterCustomFilterViewModel
    it("should map BlotterCustomFilterViewModel", () => {
      sut.provideMap(mockResolver);
      expect(mockResolver.register).toBeCalledWith(expect.anything(), BlotterCustomFilterViewModel);
    });

    // TEST:  Kinetix Monza Core > ViewMapProvider > should map BlotterColumnConfigViewModel
    it("should map BlotterColumnConfigViewModel", () => {
      sut.provideMap(mockResolver);
      expect(mockResolver.register).toBeCalledWith(expect.anything(), BlotterColumnConfigViewModel);
    });

    // TEST:  Kinetix Monza Core > ViewMapProvider > should map BlotterCellFormattingViewModel
    it("should map BlotterCellFormattingViewModel", () => {
      sut.provideMap(mockResolver);
      expect(mockResolver.register).toBeCalledWith(expect.anything(), BlotterCellFormattingViewModel);
    });

    // TEST:  Kinetix Monza Core > ViewMapProvider > should map BlotterCellFormatOptionsPopupViewModel
    it("should map BlotterCellFormatOptionsPopupViewModel", () => {
      sut.provideMap(mockResolver);
      expect(mockResolver.register).toBeCalledWith(expect.anything(), BlotterCellFormatOptionsPopupViewModel);
    });

    // TEST:  Kinetix Monza Core > ViewMapProvider > should map MainToolbarViewModel
    it("should map MainToolbarViewModel", () => {
      sut.provideMap(mockResolver);
      expect(mockResolver.register).toBeCalledWith(expect.anything(), MainToolbarViewModel);
    });
  });
});
