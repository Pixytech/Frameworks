import { IocInjectable } from "@kinetix/core";
import { CompositeDataFilter, DataTypes } from "../../Data";
import { WidgetDrillDownEvent, WidgetDrillDownEventPayload } from "../../Events";
import { AggregationType, analyticsDataService, IAggregationResponse } from "../../Utils/analyticsService";
import { ITermWidget, IUserPreferenceContext, WidgetTypes } from "../models";
import { WidgetViewModelBase } from "../WidgetViewModelBase";
import { IPieWidget, IPieWidgetDefinition, IPieWidgetItemDefinition } from "./IPieWidget";
import { IPieWidgetItem, PieWidgetModel } from "./PieWidgetModel";
import { SizeInfo } from "rc-resize-observer";

@IocInjectable()
export class PieWidgetViewModel extends WidgetViewModelBase<PieWidgetModel> implements ITermWidget, IPieWidget {
  id: string;
  datasetId: string;
  groupByField: string;
  aggregateByField: string;
  aggregationType: AggregationType;
  limit: number;
  itemDefinitions: IPieWidgetItemDefinition[];
  isDonut: boolean = true;
  customHoleSize?: number;

  get isMultiCategory(): boolean {
    return this.itemDefinitions && this.itemDefinitions.length > 2;
  }

  protected createModel(): PieWidgetModel {
    return new PieWidgetModel();
  }

  configure(widgetDefinition: IPieWidgetDefinition, filters: CompositeDataFilter, preference: IUserPreferenceContext): void {
    // console.table(widgetDefinition)
    this.datasetId = widgetDefinition.datasetId;
    this.datasetView = widgetDefinition.datasetId;
    this.drilldownDatasetId = widgetDefinition.drilldownDatasetId ?? this.datasetId;

    this.updateModel((model) => {
      model.filters = filters;
    });
    this.itemDefinitions = widgetDefinition.itemDefinitions;
    this.groupByField = widgetDefinition.termConfig.groupByField;
    this.aggregateByField = widgetDefinition.termConfig.aggregateByField;
    this.aggregationType = widgetDefinition.termConfig.aggregationType;
    this.limit = widgetDefinition.termConfig.limit;
    this.model.preference = preference;
    this.customHoleSize = widgetDefinition.customHoleSize;
  }

  loadData = async (isLoading: boolean = true): Promise<void> => {
    try {
      this.setLoading(isLoading);

      let termData = await analyticsDataService.getTermAggregation(this.datasetId, this.model.filters, this.groupByField, this.aggregateByField, this.aggregationType, this.limit, this.model.preference?.currencySettings.reportingCCY, this.model.preference?.currencySettings.fxRateDateType);
      if (termData?.items?.length > 0) {
        // if(termData.totalCount < 2029) termData.items.pop();
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

  handleWidgetResize = (size: SizeInfo) => {
    this.updateModel((m) => (m.showFullView = size.width > 280));
  };

  showDetails = (item?: { dataItem: IPieWidgetItem }) => {
    this.events.getEvent<WidgetDrillDownEvent>(WidgetDrillDownEvent, WidgetDrillDownEvent.Type).publish(new WidgetDrillDownEventPayload(item ? item.dataItem.displayName : "Details", WidgetTypes.Pie, this.drilldownDatasetId, this.getDetailsFilter(item?.dataItem)));
  };

  private formatTermData = (termData: IAggregationResponse) => {
    if (this.itemDefinitions && this.itemDefinitions.length > 0) {
      // Calculate total count from all matching items
      let totalCount = 0;
      const itemValues: Map<string, number> = new Map();
      
      // First pass: collect values for defined items
      this.itemDefinitions.forEach((def) => {
        // Find all items that match this definition (case-insensitive)
        const matchingItems = termData.items.filter((t) => 
          t.key.toLocaleLowerCase() === def.key.toLocaleLowerCase()
        );
        
        // Sum up values from all matching items
        const itemValue = matchingItems.reduce((sum, item) => sum + item.value, 0);
        itemValues.set(def.key, itemValue);
        totalCount += itemValue;
      });

      this.updateModel((model) => {
        model.totalCount = totalCount;
        model.items = [];

        this.itemDefinitions.forEach((def) => {
          const itemValue = itemValues.get(def.key) || 0;
          // Add all defined items, even with 0 values
          model.items.push({
            key: def.key,
            displayName: def.displayName,
            color: def.color,
            value: totalCount > 0 ? itemValue / totalCount : 0,
          });
        });
      });
    }
  };

  private getDetailsFilter = (item?: IPieWidgetItem): CompositeDataFilter => {
    if (item) {
      return {
        logic: "and",
        filters: [
          {
            field: this.groupByField,
            type: DataTypes.string,
            value: item.key.toUpperCase(),
            operator: "eq",
          },
          ...this.model.filters.filters,
        ],
      };
    } else {
      // Show all items when no specific item is selected
      const itemFilters = this.model.items.map((item) => ({
        field: this.groupByField,
        type: DataTypes.string,
        value: item.key.toUpperCase(),
        operator: "eq" as const,
      }));

      return {
        logic: "or" as const,
        filters: [
          {
            logic: "or" as const,
            filters: itemFilters,
          },
          ...this.model.filters.filters,
        ],
      };
    }
  };
}
