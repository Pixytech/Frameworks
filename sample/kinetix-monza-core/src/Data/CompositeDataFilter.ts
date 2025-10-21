import { CompositeFilterDescriptor, FilterDescriptor, isCompositeFilterDescriptor } from "@progress/kendo-data-query";
import { get, isDate, set } from "lodash";
import { Helpers } from "../Utils/Helpers";
import { DataFilter } from "./DataFilter";
import { DataTypes } from "./DataTypes";

/**
 * A complex filter expression.
 */
export interface CompositeDataFilter {
  /**
   * The logical operation to use when the `filter.filters` option is set.
   *
   * The supported values are:
   * * `"and"`
   * * `"or"`
   */
  logic: "or" | "and";
  /**
   * The nested filter expressions;either FilterDescriptor, or CompositeFilterDescriptor. Supports the same options as `filter`. You can nest filters indefinitely.
   */
  filters: Array<DataFilter | CompositeDataFilter>;
}

export function CombineCompositeFilters(a?: CompositeDataFilter, b?: CompositeDataFilter, logic: "or" | "and" = "and"): CompositeDataFilter {
  const firstFilter = a && a.filters? a.filters : [];
  const secondFilter = b && b.filters? b.filters : [];
  return {
    logic: logic,
    filters: [...firstFilter, ...secondFilter],
  };
}

export function isCompositeDataFilter(source: DataFilter | CompositeDataFilter): boolean {
  return get(source, "logic", undefined) !== undefined;
}

export function toCompositeFilterDescriptor(source: CompositeDataFilter): CompositeFilterDescriptor {
  //https://stackoverflow.com/questions/70990546/how-apply-initial-value-of-gridcolumn-gridcolumnmenufilter-kendo-react
  const result:CompositeFilterDescriptor =  {
    logic: source.logic,
    filters: (source?.filters?source.filters:[]).map((x) => {
      if (isCompositeDataFilter(x)) {
        return toCompositeFilterDescriptor(x as CompositeDataFilter);
      } else {
        return {
          logic: "and",
          filters: [toFilterDescriptor(x as DataFilter)]
        };
      }
    }),
  };
  console.debug("CompositeFilterDescriptor",result);
  return result;
}

export function toCompositeDataFilter(source: CompositeFilterDescriptor, fieldTypeProvider: (field: string, value?: any) => DataTypes): CompositeDataFilter {
  return {
    logic: source.logic,
    filters: (source?.filters?source.filters:[]).map((x) => {
      if (isCompositeFilterDescriptor(x)) {
        return toCompositeDataFilter(x, fieldTypeProvider);
      } else {
        let sourceDataType: DataTypes | undefined = get(x, "type", undefined);
        let dataType: DataTypes = DataTypes.string;
        if (sourceDataType) {
          dataType = sourceDataType;
        } else {
          if (x.field) {
            if (typeof x.field !== "string") {
              const fieldName: string = x.field();
              if (fieldName) {
                dataType = fieldTypeProvider(fieldName, x.value);
              }
            } else {
              const fieldName: string = x.field;
              if (fieldName) {
                dataType = fieldTypeProvider(fieldName, x.value);
              }
            }
          }
        }
        return toDataFilter(x, dataType);
      }
    }),
  };
}
export function getAllFilterDescriptor(source: CompositeFilterDescriptor): FilterDescriptor[] 
  {
    const result: FilterDescriptor[] = [];
    source.filters?.forEach((filter) => {
      if (isCompositeFilterDescriptor(filter)) {
        result.push(...getAllFilterDescriptor(filter));
      } else {
        result.push(filter as FilterDescriptor);
      }
    });
    return result
  }

export const isValidFilter = (filter: CompositeDataFilter): boolean => {
  if (filter?.filters) {
    return filter.filters
      .map((filter) => {
        if (isCompositeDataFilter(filter)) {
          return isValidFilter(filter as CompositeDataFilter);
        } else {
          const dataFilter = filter as DataFilter;
          return dataFilter.value;
        }
      })
      .every((valid) => valid);
  }
  return true;
};

export function toFilterDescriptor(source: DataFilter): FilterDescriptor {
  const result =  {
    field: source.field,
    operator: source.operator,
    value: getFilterDescriptorValue(source.type, source.value),
  };
  if(source.ignoreCase != undefined){
    return set(result,"ignoreCase", source.ignoreCase);
  }else{
    return result;
  }
}

function getFilterDescriptorValue(type: DataTypes, sourceValue: any): any {
  switch (type) {
    case DataTypes.date:
      return sourceValue ? isDate(sourceValue)?sourceValue: Helpers.parseDate(sourceValue) : null;
    case DataTypes.dateTime:
      return sourceValue ?isDate(sourceValue)?sourceValue: Helpers.parseDateTime(sourceValue) : null;
    default:
      return sourceValue;
  }
}
export function toDataFilter(source: FilterDescriptor, fieldType: DataTypes): DataFilter {
  return {
    field: source.field,
    type: fieldType,
    operator: source.operator,
    ignoreCase: source.ignoreCase,
    value: getDataFilterValue(fieldType, source.value),
  };

  function getDataFilterValue(type: DataTypes, sourceValue: any): any {
    switch (type) {
      case DataTypes.date:
        if (isDate(sourceValue)) {
          return Helpers.formatDate(sourceValue);
        }
        return sourceValue;
      case DataTypes.dateTime:
        if (isDate(sourceValue)) {
          return Helpers.formatDateTime(sourceValue);
        }
        return sourceValue;
      default:
        return sourceValue;
    }
  }
}
