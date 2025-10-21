import { CompositeDataFilter } from "../Data";
import { FxRateDateType } from "../FxRateDateType";
import { api } from "./api";
import { getRxFilters } from "./serverFilters";

export interface IAggregationResponse {
  totalCount: number;
  items: { key: string; value: number }[];
}

export enum AggregationType {
  Count = "VALUE_COUNT",
  Sum = "SUM",
  Average = "AVG",
  Minimum = "MIN",
  Maximum = "MAX",
}

export const analyticsDataService = {
  getTermAggregation: async (datasetId: string, filterParams: CompositeDataFilter, groupByField: string, aggregateByField: string, aggregationType: AggregationType, limit: number, reportingCCY?: string, fxRateDateType?: FxRateDateType): Promise<IAggregationResponse> => {
    const filter = {
      datasetId: datasetId,
      parameters: [...getRxFilters(filterParams)],
    };
    let url = `/analytics/term?filter=${encodeURIComponent(JSON.stringify(filter))}&limit=${limit}&group_by_field=${groupByField}&aggregate_by_field=${aggregateByField}&aggregation_type=${aggregationType}`;

    if (reportingCCY) {
      url += `&reporting_currency=${reportingCCY}`;
    }

    if (fxRateDateType) {
      url += `&fx_rate_date_type=${fxRateDateType}`;
    }

    return await api(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  },

  getSingleValueAggregation: async (datasetId: string, filterParams: CompositeDataFilter, groupByField: string, aggregationType: AggregationType): Promise<IAggregationResponse> => {
    const filters = getRxFilters(filterParams);
    return await api(`/analytics/single_value?filter=${encodeURIComponent(`{"datasetId":"${datasetId}","parameters":${JSON.stringify(filters)}}`)}&group_by_field=${groupByField}&aggregation_type=${aggregationType}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  },

  getDateHistogramAggregation: async (datasetId: string, filterParams: CompositeDataFilter, xAxisField: string, yAxisField: string, intervalExpression: string, aggregationType: AggregationType) => {
    const filters = getRxFilters(filterParams);
    return await api(`/analytics/date_histogram?filter=${encodeURIComponent(`{"datasetId":"${datasetId}","parameters":${JSON.stringify(filters)}}`)}&x_axis_field=${xAxisField}&interval_expression=${intervalExpression}&y_axis_field=${yAxisField}&aggregation_type=${aggregationType}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  },
};
