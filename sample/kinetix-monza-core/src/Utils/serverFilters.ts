import { FilterOperator } from "@progress/kendo-data-query";
import { get, isDate, isNumber } from "lodash";
import { CompositeDataFilter, DataFilter, DataTypes, RxDataFilter, isCompositeDataFilter } from "../Data";
import { Helpers } from "./Helpers";

export function convertOperators(x: FilterOperator | string | Function): string {
  if (typeof x === "function") {
    return x.name;
  }

  switch (x) {
    case "gt":
      return "greaterThan";
    case "lt":
      return "lessThan";
    case "gte":
      return "greaterOrEqualThan";
    case "lte":
      return "lessOrEqualThan";
    case "eq":
      return "equals";
    case "neq":
      return "notEquals";
    case "startswith":
      return "startsWith";
    case "contains":
      return "contains";
    case "doesnotcontain":
      return "notContains";
    case "isnull":
      return "isNull";
    case "isnotnull":
      return "notNull";
  }

  return x;
}

export function getType(field: string, data: any): DataTypes {
  if (isDate(data)) {
    return DataTypes.date;
  } else if (isNumber(data)) {
    return DataTypes.numeric;
  }
  return DataTypes.string;
}

export function getRxFilterValue(filter:DataFilter):any{
  if(filter.type == DataTypes.date){
    return Helpers.formatDate(filter.value);
  }else  if(filter.type == DataTypes.dateTime){
    return Helpers.formatDateTime(filter.value);
  }else{
    return filter.value;
  }
}

export function getRxFilters(filters: CompositeDataFilter | undefined): RxDataFilter[] {
  console.debug("Convert Filters ", filters);
  if (!filters) {
    return [];
  }
  const rxFilter: {
    name: string;
    value: any;
    type: DataTypes;
    operation: string;
  }[] = [];
  for (const filter of filters.filters) {
    if (isCompositeDataFilter(filter)) {
      rxFilter.push(...getRxFilters(filter as CompositeDataFilter));
    } else {
      const dataFilter = filter as DataFilter;
      const rxDataFilter: RxDataFilter = {
        name: `${dataFilter.field}`,
        type: dataFilter.type && dataFilter.type != DataTypes.list ? dataFilter.type : getType(`${dataFilter.field}`, dataFilter.value),
        value: get(dataFilter.value, "displayName", undefined) !== undefined ? dataFilter.value.displayName : getRxFilterValue(dataFilter),
        operation: convertOperators(dataFilter.operator),
      };
      rxFilter.push(rxDataFilter);
    }
  }
  console.debug("Converted Filters ", rxFilter);
  return rxFilter;
}
