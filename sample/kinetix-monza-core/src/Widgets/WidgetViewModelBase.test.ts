import "reflect-metadata";
import { IEventAggregator } from "@kinetix/core";
import { createMock } from "ts-auto-mock";
import { GlobalSettingSource, IGlobalFilters, IWidgetTab, WidgetModel } from ".";
import { arrange } from "../../../../testing";
import { WidgetViewModelBase } from "./WidgetViewModelBase";

class TestWidgetModel extends WidgetModel {}

class TestWidgetViewModel extends WidgetViewModelBase<TestWidgetModel> {
  dataLoaded: boolean = false;
  async loadData(showLoading?: boolean | undefined): Promise<void> {
    this.dataLoaded = true;
    return Promise.resolve();
  }
  protected createModel(): TestWidgetModel {
    return new TestWidgetModel();
  }
}

// Base Package
describe("Kinetix Monza Core", () => {
  let sut: TestWidgetViewModel;
  let mockGlobalFilter: IGlobalFilters;
  beforeEach(() => {
    let mockEvents = createMock<IEventAggregator>();
    mockGlobalFilter = createMock<IGlobalFilters>();
    sut = new TestWidgetViewModel(mockGlobalFilter, mockEvents);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  // Testing Component
  describe("WidgetViewModelBase", () => {
    it("getTabOptions should return empty list", async () => {
      let mockWidget = createMock<IWidgetTab>();

      arrange(mockGlobalFilter.onSettingChanged).stubMethod("subscribe", (callback) => {
        if (callback) {
          callback(GlobalSettingSource.Filter);
          callback(GlobalSettingSource.Preference);
        }
      });
      await sut.initialize();
      let res = await sut.getTabOptions(mockWidget);

      expect(res).not.toBeNull();
      expect(res.length).toBe(0);
    });

    it("setLoading should set model IsLoading value to true", async () => {
      sut.setLoading(true);
      expect(sut.model.isLoading).toBeTruthy();
    });

    it("setLoading should set model IsLoading value to false", async () => {
      sut.setLoading(false);
      expect(sut.model.isLoading).toBeFalsy();
    });
  });
});
