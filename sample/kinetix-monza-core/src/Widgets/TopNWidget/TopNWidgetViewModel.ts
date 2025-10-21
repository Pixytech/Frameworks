import { IocInjectable } from "@kinetix/core";
import { CompositeDataFilter, DataTypes } from "../../Data";
import { WidgetDrillDownEvent, WidgetDrillDownEventPayload } from "../../Events";
import { AggregationType, analyticsDataService, IAggregationResponse } from "../../Utils/analyticsService";

import { ITermWidget, IUserPreferenceContext, WidgetTypes } from "../models";
import { WidgetViewModelBase } from "../WidgetViewModelBase";
import { ITopNWidget, ITopNWidgetDefinition, ITopNWidgetItemDefinition } from "./ITopNWidget";
import { ITopNWidgetItem, TopNWidgetModel } from "./TopNWidgetModel";

@IocInjectable()
export class TopNWidgetViewModel extends WidgetViewModelBase<TopNWidgetModel> implements ITermWidget, ITopNWidget {
  datasetId: string;

  groupByField: string;
  aggregateByField: string;
  aggregationType: AggregationType;
  limit: number;
  itemDefinitions: ITopNWidgetItemDefinition[];
  itemColumnDisplayName: string = "Name";
  valueColumnDisplayName: string = "Value";

  protected createModel(): TopNWidgetModel {
    return new TopNWidgetModel();
  }

  configure(widgetDefinition: ITopNWidgetDefinition, filters: CompositeDataFilter, preference: IUserPreferenceContext): void {
    this.datasetId = widgetDefinition.datasetId;
    this.datasetView = widgetDefinition.datasetId;
    this.drilldownDatasetId = widgetDefinition.drilldownDatasetId ?? this.datasetView;

    this.updateModel((model) => {
      model.filters = filters;
    });
    this.itemDefinitions = widgetDefinition.itemDefinitions;
    this.groupByField = widgetDefinition.termConfig.groupByField;
    this.aggregateByField = widgetDefinition.termConfig.aggregateByField;
    this.aggregationType = widgetDefinition.termConfig.aggregationType;
    this.model.preference = preference;
    this.limit = widgetDefinition.termConfig.limit;

    console.log("Display Names", widgetDefinition.itemColumnDisplayName, widgetDefinition.valueColumnDisplayName);
    if (widgetDefinition.itemColumnDisplayName) {
      this.updateModel((model) => (this.itemColumnDisplayName = widgetDefinition.itemColumnDisplayName));
    }
    if (widgetDefinition.valueColumnDisplayName) {
      this.updateModel((model) => (this.valueColumnDisplayName = widgetDefinition.valueColumnDisplayName));
    }
  }

  loadData = async (loading: boolean = true): Promise<void> => {
    try {
      this.setLoading(loading);

      let termData = await analyticsDataService.getTermAggregation(this.datasetId, this.model.filters, this.groupByField, this.aggregateByField, this.aggregationType, this.limit, this.model.preference?.currencySettings.reportingCCY, this.model.preference?.currencySettings.fxRateDateType);
      if (termData?.items?.length > 0) {
        this.formatTermData(termData);
      } else {
        this.updateModel((model) => {
          model.totalCount = 0;
          model.items = [];
        });
      }
    } catch (error) {
      console.error("Error loading pie widget data", error);
    } finally {
      this.setLoading(false);
      this.updateModel((model) => (model.isFirstRender = false));
    }
  };

  showDetails = (item?: ITopNWidgetItem) => {
    this.events.getEvent<WidgetDrillDownEvent>(WidgetDrillDownEvent, WidgetDrillDownEvent.Type).publish(new WidgetDrillDownEventPayload(item ? item.displayName : "Details", WidgetTypes.TopN, this.drilldownDatasetId, this.getDetailsFilter(item)));
  };

  private formatTermData = (termData: IAggregationResponse) => {
    if (termData?.items && termData.totalCount > 0) {
      this.updateModel((model) => {
        model.totalCount = termData.totalCount;
        model.items = [];
        let position: number = 0;

        termData.items.sort((a, b) => (b.value > a.value ? 1 : -1));
        termData.items.forEach((item) => {
          model.items.push({
            position: ++position,
            key: item.key.toLocaleUpperCase(),
            displayName: item.key,
            value: item.value,
            color: "",
            data: { a: item.key, b: item.value },
          });
        });
      });
    }
  };

  private getDetailsFilter = (item?: ITopNWidgetItem): CompositeDataFilter => {
    if (item) {
      return {
        logic: "and",
        filters: [
          {
            field: this.groupByField,
            value: item.key.toUpperCase(),
            type: DataTypes.string,
            operator: "eq",
          },
          ...this.model.filters.filters,
        ],
      };
    } else {
      const filters: CompositeDataFilter = {
        logic: "and",
        filters: [
          ...this.model.items?.map((item) => {
            return {
              field: this.groupByField,
              type: DataTypes.string,
              value: item.key.toUpperCase(),
              operator: "eq",
            };
          }),
          ...this.model.filters.filters,
        ],
      };

      return filters;
    }
  };
}
