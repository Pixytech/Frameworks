import { IocInjectable } from "@kinetix/core";
import { AggregationType, analyticsDataService } from "../../Utils/analyticsService";
import { IDateHistogramWidget, WidgetTypes } from "../models";
import { IBarWidget, IBarWidgetCategoryDefinition, IBarWidgetDefinition } from "./IBarWidget";
import { BarWidgetModel, IBarWidgetSeries } from "./BarWidgetModel";
import { WidgetViewModelBase } from "../WidgetViewModelBase";
import { dataService } from "../../Utils/blotterApi";
import { IDatasetDefinition } from "../../Blotter/IBlotter";
import { WidgetDrillDownEvent, WidgetDrillDownEventPayload } from "../../Events";
import { CompositeDataFilter, DataTypes } from "../../Data";

@IocInjectable()
export class BarWidgetViewModel extends WidgetViewModelBase<BarWidgetModel> implements IDateHistogramWidget, IBarWidget {
  id: string;
  datasetId: string;

  xAxisField: string;
  yAxisField: string;
  intervalExpression: string;
  aggregationType: AggregationType;
  stack: boolean;
  categoryField: string;
  categoryColorPalette: string[];
  categoryDefinitions?: IBarWidgetCategoryDefinition[];

  protected createModel(): BarWidgetModel {
    return new BarWidgetModel();
  }

  configure(widgetDefinition: IBarWidgetDefinition, filters: CompositeDataFilter): void {
    this.datasetId = widgetDefinition.datasetId;
    this.datasetView = widgetDefinition.datasetId;
    this.drilldownDatasetId = widgetDefinition.drilldownDatasetId ?? this.datasetView;

    this.updateModel((model) => {
      model.filters = filters;
    });
    this.xAxisField = widgetDefinition.histogramConfig.xAxisField;
    this.yAxisField = widgetDefinition.histogramConfig.yAxisField;
    this.intervalExpression = widgetDefinition.histogramConfig.intervalExpression;
    this.aggregationType = widgetDefinition.histogramConfig.aggregationType;
    this.stack = widgetDefinition.stack;
    this.categoryField = widgetDefinition.categoryField;
    this.categoryColorPalette = widgetDefinition.categoryColorPalette;
    this.categoryDefinitions = widgetDefinition.categoryDefinitions;
    this.updateModel((model) => {
      model.xAxisField = widgetDefinition.histogramConfig.xAxisField;
      model.yAxisField = widgetDefinition.histogramConfig.yAxisField;
    });
  }

  loadData = async (showLoading: boolean = true): Promise<void> => {
    try {
      this.setLoading(showLoading);
      let items: IBarWidgetSeries[] = [];
      const intervals = this.getXAxisIntervals();
      const filterExp = this.model.filters;
      let categoryType = "enum";

      this.updateModel((model) => {
        model.totalCount = 0;
        model.categories = [];
        model.items = [];
      });

      //step 1. Get possible values for the category field
      let categories: { value: string; displayName: string }[] = [];
      if (this.categoryDefinitions && this.categoryDefinitions.length > 0) {
        categories = [
          ...this.categoryDefinitions.map((x) => {
            return { displayName: x.name, value: x.name };
          }),
        ];
        categoryType = "column";
      } else {
        const datasetDefinition: IDatasetDefinition = await dataService.getDatasetDefinition(this.datasetId);
        if (datasetDefinition && datasetDefinition.columns) {
          let categoryColDef = Object.entries(datasetDefinition.columns)
            .map((x) => x[1])
            .find((col) => col.name === this.categoryField);

          if (categoryColDef && categoryColDef.possibleValues) {
            categories = [...categoryColDef.possibleValues];
          } else {
            const data = await dataService.getDatasetDataByRequest(this.datasetId, 0, 100, [], datasetDefinition, "", {});

            if (data && data.items) {
              data.items.map((x: any) => {
                if (categories.filter((c) => c.value == x[this.categoryField]).length == 0)
                  categories.push({
                    value: x[this.categoryField],
                    displayName: x[this.categoryField],
                  });
              });
              
              if(categoryColDef){
               categoryType = categoryColDef?.type;
              }
            }
          }
        }
      }

      // this.updateModel(model => {
      //   model.categories = categories.map(c => c.displayName);
      // })

      //STEP 2. get the date histogram for eac category
      for (let cat of categories) {
        let finalFilterExp: CompositeDataFilter =
          filterExp?.filters.length > 0
            ? {
                logic: "and",
                filters: [
                  ...filterExp.filters,
                  {
                    field: this.categoryField,
                    value: cat.value,
                    type: DataTypes.string,
                    operator: "eq",
                  },
                ],
              }
            : {
                logic: "and",
                filters: [
                  {
                    field: this.categoryField,
                    value: cat.value,
                    type: DataTypes.string,
                    operator: "eq",
                  },
                ],
              };
        let response = await analyticsDataService.getDateHistogramAggregation(this.datasetId, finalFilterExp, this.model.xAxisField, this.model.yAxisField, this.getIntervalExpresion(), this.aggregationType);

        //Create Bar chart series
        if (response && response.items) {
          let seriesData: { value: number; category: string }[] = [];
          let i = 0;
          response.items.map((x: any) => seriesData.push({ value: x.value, category: "" }));

          items.push({
            name: cat.displayName,
            color: this.categoryColorPalette && this.categoryColorPalette.length > 0 ? this.categoryColorPalette[i++] : "",
            data: seriesData,
          });
        }
      }

      this.updateModel((model) => {
        model.categories = categories.map((c) => c.displayName);
        model.items = items;
      });
    } catch (error) {
      console.error("Error loading bar widget data", error);
    } finally {
      this.setLoading(false);
      this.updateModel((model) => (model.isFirstRender = false));
    }
  };

  async handleIntervalTabChange(selecedIntervalTab: number): Promise<void> {
    this.updateModel((model) => (model.selectedIntervalTab = selecedIntervalTab));
    await this.loadData();
  }

  getIntervalExpresion(): string {
    switch (this.model.selectedIntervalTab) {
      case 0:
        return "1M";
      case 1:
        return "1q";
      case 2:
        return "1Y";
      default:
        return "1M";
    }
  }

  getXAxisIntervals(): string[] {
    const selecedInterval = this.getIntervalExpresion();

    switch (selecedInterval) {
      case "1M":
        return ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "AUG", "SEP", "OCT", "NOV", "DEC"];
      case "1q":
        return ["Q1", "Q2", "Q3", "Q4"];

      default:
        return ["2022"];
    }
  }

  showDetails = (item?: any) => {
    this.events.getEvent<WidgetDrillDownEvent>(WidgetDrillDownEvent, WidgetDrillDownEvent.Type).publish(new WidgetDrillDownEventPayload(item.series.name, WidgetTypes.Bar, this.drilldownDatasetId, this.getDetailsFilter(item)));
  };

  private getDetailsFilter = (item: any): CompositeDataFilter => {
    const dates = this.getIntervalDates(item.category!);
    return {
      logic: "and",
      filters: [
        {
          field: this.categoryField,
          type: DataTypes.string,
          value: item.series.name,
          operator: "eq",
        },
        {
          field: this.xAxisField,
          type: DataTypes.date,
          value: dates[0],
          operator: "gte",
        },
        {
          field: this.xAxisField,
          type: DataTypes.date,
          value: dates[1],
          operator: "lte",
        },
        ...this.model.filters.filters,
      ],
    };
  };

  private getIntervalDates = (intervalPeriod: string): Date[] => {
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    if (this.model.selectedIntervalTab === 0) {
      const month = months.indexOf(intervalPeriod);
      let startDate = new Date();
      startDate.setMonth(month);
      let endDate = new Date(startDate.getFullYear(), month + 1, 0);
      return [startDate, endDate];
    } else if (this.model.selectedIntervalTab === 1) {
      let startDate = new Date();
      if (intervalPeriod === "Q1") {
        startDate.setMonth(0);
      } else if (intervalPeriod === "Q2") {
        startDate.setMonth(3);
      } else if (intervalPeriod === "Q3") {
        startDate.setMonth(6);
      } else if (intervalPeriod === "Q4") {
        startDate.setMonth(9);
      }
      let endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 3, 0);
      return [startDate, endDate];
    } else {
      let startDate = new Date();
      startDate.setMonth(0);
      let endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 13, 0);
      return [startDate, endDate];
    }
  };
}
