import "reflect-metadata";
import { WidgetContainerViewModel } from "./WidgetContainerViewModel";
import { IContainer } from "@kinetix/core";
import { createMock } from "ts-auto-mock";
import { IGlobalFilters } from "../IGlobalFilters";
import { IUserPreferenceContext, IWidgetContainerTabDefinition, WidgetTypes } from "../models";
import { CompositeDataFilter } from "../../Data";
import { arrange, arrangeViewModel } from "../../../../../testing";
import { analyticsDataService } from "../../Utils/analyticsService";
import { ITabOptions, ITabOptionsType, IWidgetTab, TabOptionsViewModel } from ".";
import { GlobalFilters } from "../GlobalFilters";
import { BlotterModel, IBlotter } from "../../Blotter";
import { waitFor } from "@testing-library/react";
import { BarWidgetModel, BarWidgetViewModel, IBarWidget, ILiveInquiryWidget, IPieWidget, ITopNWidget, LiveInquiryWidgetModel, LiveInquiryWidgetViewModel, PieWidgetModel, PieWidgetViewModel, TopNWidgetModel, TopNWidgetViewModel } from "..";
import { TradingCoreTypes } from "../../TradingCoreTypes";
import { dataService } from "../../Utils/blotterApi";

// Base Package
describe("Kinetix Monza Core", () => {
  let sut: WidgetContainerViewModel;
  // this is real analyticsDataService mocking
  let mockanalyticsDataService: typeof analyticsDataService = analyticsDataService;
  let mockdataService: typeof dataService = dataService;
  beforeEach(() => {
    let mockContainer = createMock<IContainer>();
    let mockGlobalFilter = new GlobalFilters();
    arrange(mockContainer).stubMethod("build", () => new TabOptionsViewModel(), [ITabOptionsType]);
    arrange(mockContainer).stubMethod("build", () => createMock<IPieWidget>({ model: new PieWidgetModel() }), [PieWidgetViewModel]);
    arrange(mockContainer).stubMethod("build", () => createMock<ITopNWidget>({ model: new TopNWidgetModel() }), [TopNWidgetViewModel]);
    arrange(mockContainer).stubMethod("build", () => createMock<IBarWidget>({ model: new BarWidgetModel() }), [BarWidgetViewModel]);
    arrange(mockContainer).stubMethod("build", () => createMock<ILiveInquiryWidget>({ model: new LiveInquiryWidgetModel() }), [LiveInquiryWidgetViewModel]);
    arrange(mockContainer).stubMethod("build", () => createMock<IBlotter>({ model: new BlotterModel() }), [TradingCoreTypes.Blotter]);
    arrange(mockdataService).stubMethod("getDatasetViews", () =>
      Promise.resolve([
        {
          id: "CONTENT_AUTOMATION_DOCUMENTS",
        },
      ])
    );
    sut = new WidgetContainerViewModel(mockContainer, mockGlobalFilter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  // Testing Component
  describe("WidgetContainerViewModel", () => {
    it("should initialize and raise filter work.", async () => {
      const mockBlotter = createMock<IBlotter>({ loadData: jest.fn(() => Promise.resolve()) });
      arrangeViewModel(mockBlotter).acceptModelChanges().acceptViewChanges();
      sut.model.tabs = [
        createMock<IWidgetTab>({
          widgetType: WidgetTypes.Blotter,
          widget: mockBlotter,
        }),
      ];

      arrange(mockanalyticsDataService).stubMethod("getTermAggregation", () => Promise.resolve({ totalCount: 0, items: [] }));
      await sut.initialize();

      let filter: CompositeDataFilter = { logic: "or", filters: [] };
      sut.globalFilters.changeFilters(filter);
      let item = sut.globalFilters.filters;
      expect(item).toStrictEqual(filter);
      await waitFor(() => {
        expect(mockBlotter.loadData).toBeCalled();
      });
    });

    it("should handleTabChange", async () => {
      sut.model.tabs = [
        createMock<IWidgetTab>({
          widgetType: WidgetTypes.Blotter,
          widget: createMock<IBlotter>({ loadData: jest.fn(() => Promise.resolve()) }),
        }),
        createMock<IWidgetTab>({
          widgetType: WidgetTypes.Blotter,
          widget: createMock<IBlotter>({ loadData: jest.fn(() => Promise.resolve()) }),
        }),
        createMock<IWidgetTab>({
          widgetType: WidgetTypes.Blotter,
          widget: createMock<IBlotter>({ loadData: jest.fn(() => Promise.resolve()) }),
        }),
      ];

      sut.model.IsTabFocusClick = true;
      sut.handleTabChange(1);
      await waitFor(() => expect(sut.model.IsTabFocusClick).toBe(false));

      sut.handleTabChange(2);

      await waitFor(() => {
        expect(sut.model.selectedTab).toBe(2);
      });
    });

    it("should add tabs ", async () => {
      await sut.addTab(createMock<IWidgetContainerTabDefinition>({ widgetType: WidgetTypes.Pie, key: "key1" }));
      expect(sut.model.tabs.length).toBe(1);

      sut.model.tabs[0].optionVM.OnTabFocus(true);
      expect(sut.model.IsTabFocusClick).toBe(true);

      await sut.addTab(createMock<IWidgetContainerTabDefinition>({ widgetType: WidgetTypes.Bar, key: "key2" }));
      expect(sut.model.tabs.length).toBe(2);

      await sut.addTab(createMock<IWidgetContainerTabDefinition>({ widgetType: WidgetTypes.Donut, key: "key3" }));
      expect(sut.model.tabs.length).toBe(3);

      await sut.addTab(createMock<IWidgetContainerTabDefinition>({ widgetType: WidgetTypes.LiveInquiry, key: "key4" }));
      expect(sut.model.tabs.length).toBe(4);

      await sut.addTab(createMock<IWidgetContainerTabDefinition>({ widgetType: WidgetTypes.TopN, key: "key5" }));
      expect(sut.model.tabs.length).toBe(5);

      await sut.addTab(createMock<IWidgetContainerTabDefinition>({ widgetType: WidgetTypes.Blotter, key: "key6" }));
      expect(sut.model.tabs.length).toBe(6);

      await sut.removeTab(sut.model.tabs[0]);
      expect(sut.model.tabs.length).toBe(5);

      sut.setDimensions("a", 1, 2, 3, 4, 5, 6);

      expect(sut.model.key).toBe("a");
      expect(sut.model.row).toBe(1);
      expect(sut.model.column).toBe(2);
      expect(sut.model.width).toBe(3);
      expect(sut.model.height).toBe(4);
      expect(sut.model.minWidth).toBe(5);
      expect(sut.model.minHeight).toBe(6);
    });
  });
});
