import { Operators, FilterOperator } from "@progress/kendo-react-data-tools";
import { GridFilterOperators } from "@progress/kendo-react-grid";
import { DataTypes, isDataTypeNumber } from "../../Data";

const filterMessages = {
  eq: "Is equal to",
  notEq: "Is not equal to",
  isNull: "Is null",
  isNotNull: "Is not null",
  isEmpty: "Is empty",
  isNotEmpty: "Is not empty",
  startsWith: "Starts with",
  contains: "Contains",
  notContains: "Does not contain",
  gte: "Is greater than or equal to",
  gt: "Is greater than",
  lte: "Is less than or equal to",
  lt: "Is less than",
  afterOrEqual: "Is after or equal to",
  after: "Is after",
  beforeOrEqual: "Is before or equal to",
  before: "Is before",
};

const TEXT_OPERATORS = [
  {
    text: "filter.containsOperator",
    operator: "contains",
    message: filterMessages.contains,
  },
  { text: "filter.eqOperator", operator: "eq", message: filterMessages.eq },
  {
    text: "filter.notEqOperator",
    operator: "neq",
    message: filterMessages.notEq,
  },
  {
    text: "filter.startsWithOperator",
    operator: "startswith",
    message: filterMessages.startsWith,
  },

  {
    text: "filter.notContainsOperator",
    operator: "doesnotcontain",
    message: filterMessages.notContains,
  },
  {
    text: "filter.isEmptyOperator",
    operator: "isnull",
    message: filterMessages.isEmpty,
  },
  {
    text: "filter.isNotEmptyOperator",
    operator: "isnotnull",
    message: filterMessages.isNotEmpty,
  },
];

const NUMERIC_OPERATORS = [
  { text: "filter.eqOperator", operator: "eq", message: filterMessages.eq },
  {
    text: "filter.notEqOperator",
    operator: "neq",
    message: filterMessages.notEq,
  },
  { text: "filter.gteOperator", operator: "gte", message: filterMessages.gte },
  { text: "filter.gtOperator", operator: "gt", message: filterMessages.gt },
  { text: "filter.lteOperator", operator: "lte", message: filterMessages.lte },
  { text: "filter.ltOperator", operator: "lt", message: filterMessages.lt },
  {
    text: "filter.isNullOperator",
    operator: "isnull",
    message: filterMessages.isNull,
  },
  {
    text: "filter.isNotNullOperator",
    operator: "isnotnull",
    message: filterMessages.isNotNull,
  },
];

const DATE_OPERATORS = [
  { text: "filter.eqOperator", operator: "eq", message: filterMessages.eq },
  {
    text: "filter.notEqOperator",
    operator: "neq",
    message: filterMessages.notEq,
  },
  {
    text: "filter.afterOrEqualOperator",
    operator: "gte",
    message: filterMessages.afterOrEqual,
  },
  {
    text: "filter.afterOperator",
    operator: "gt",
    message: filterMessages.after,
  },
  {
    text: "filter.beforeOperator",
    operator: "lt",
    message: filterMessages.before,
  },
  {
    text: "filter.beforeOrEqualOperator",
    operator: "lte",
    message: filterMessages.beforeOrEqual,
  },
  {
    text: "filter.isNullOperator",
    operator: "isnull",
    message: filterMessages.isNull,
  },
  {
    text: "filter.isNotNullOperator",
    operator: "isnotnull",
    message: filterMessages.isNotNull,
  },
];

const BOOLEAN_OPERATORS = [{ text: "filter.eqOperator", operator: "eq", message: filterMessages.eq }];

const LIST_OPERATORS = [{ text: "filter.eqOperator", operator: "eq", message: filterMessages.eq }];

export const FILTER_OPERATORS: Operators = {
  text: TEXT_OPERATORS,
  numeric: NUMERIC_OPERATORS,
  date: DATE_OPERATORS,
  boolean: BOOLEAN_OPERATORS,
  list: LIST_OPERATORS,
};

const GRID_TEXT_OPERATORS = [
  { text: "grid.filterContainsOperator", operator: "contains" },
  { text: "grid.filterEqOperator", operator: "eq" },
  { text: "grid.filterNotEqOperator", operator: "neq" },
  { text: "grid.filterStartsWithOperator", operator: "startswith" },
  { text: "grid.filterNotContainsOperator", operator: "doesnotcontain" },
  { text: "grid.filterIsEmptyOperator", operator: "isnull" },
  { text: "grid.filterIsNotEmptyOperator", operator: "isnotnull" },
];

const GRID_NUMERIC_OPERATORS = [
  { text: "grid.filterEqOperator", operator: "eq" },
  { text: "grid.filterNotEqOperator", operator: "neq" },
  { text: "grid.filterGteOperator", operator: "gte" },
  { text: "grid.filterGtOperator", operator: "gt" },
  { text: "grid.filterLteOperator", operator: "lte" },
  { text: "grid.filterLtOperator", operator: "lt" },
  { text: "grid.filterIsNullOperator", operator: "isnull" },
  { text: "grid.filterIsNotNullOperator", operator: "isnotnull" },
];

const GRID_DATE_OPERATORS = [
  { text: "grid.filterEqOperator", operator: "eq" },
  { text: "grid.filterNotEqOperator", operator: "neq" },
  { text: "grid.filterAfterOrEqualOperator", operator: "gte" },
  { text: "grid.filterAfterOperator", operator: "gt" },
  { text: "grid.filterBeforeOperator", operator: "lt" },
  { text: "grid.filterBeforeOrEqualOperator", operator: "lte" },
  { text: "grid.filterIsNullOperator", operator: "isnull" },
  { text: "grid.filterIsNotNullOperator", operator: "isnotnull" },
];

const GRID_BOOLEAN_OPERATORS = [{ text: "grid.filterEqOperator", operator: "eq" }];

const GRID_LIST_OPERATORS = [{ text: "grid.filterEqOperator", operator: "eq" }];

export const GRID_FILTER_OPERATORS: GridFilterOperators = {
  text: GRID_TEXT_OPERATORS,
  numeric: GRID_NUMERIC_OPERATORS,
  date: GRID_DATE_OPERATORS,
  boolean: GRID_BOOLEAN_OPERATORS,
  list: GRID_LIST_OPERATORS,
};

export const getAllowedOperators = (): Operators => {
  return FILTER_OPERATORS;
};

export const getAllowedGridFilterOperators = (): GridFilterOperators => {
  return GRID_FILTER_OPERATORS;
};

export const getFilterName = (type: DataTypes) => {
  if (isDataTypeNumber(type)) {
    return "numeric";
  }
  if (type === DataTypes.boolean) {
    return "boolean";
  }
  if (type === DataTypes.date || type === DataTypes.dateTime) {
    return "date";
  }
  if (type === DataTypes.string) {
    return "text";
  }
  return undefined;
};

export const getOperatorsByType = (type: DataTypes, gridFilters: boolean = false): FilterOperator[] => {
  let operators: any = gridFilters ? GRID_FILTER_OPERATORS : FILTER_OPERATORS;

  if (isDataTypeNumber(type)) {
    return operators.numeric;
  }
  if (type === DataTypes.boolean) {
    return operators.boolean;
  }
  if (type === DataTypes.enum || type === DataTypes.list) {
    return operators.list;
  }
  if (type === DataTypes.date) {
    return operators.date;
  }

  return operators.text;
};

const convertValuesForExecution = (value: any, valueToCompare: any, valueType: DataTypes, caseSensitiveComparison: boolean): [any, any] => {
  if (!caseSensitiveComparison && (valueType === DataTypes.string || valueType === DataTypes.enum || valueType === DataTypes.boolean)) {
    value = value?.toString()?.toLowerCase();
    valueToCompare = valueToCompare?.toString()?.toLowerCase();
  } else if (valueType === DataTypes.date || valueType === DataTypes.dateTime) {
    value = value && new Date(value).getTime();
    valueToCompare = valueToCompare && new Date(valueToCompare).getTime();
  }

  return [value, valueToCompare];
};

export const executeOperator = (operator: any, value: any, valueToCompare: any, valueType: DataTypes, caseSensitiveComparison: boolean = false): boolean => {
  let conditionMatch = false;

  [value, valueToCompare] = convertValuesForExecution(value, valueToCompare, valueType, caseSensitiveComparison);

  try {
    switch (operator.operator) {
      case "eq":
        conditionMatch = value && value === valueToCompare;
        break;
      case "neq":
        conditionMatch = value && value !== valueToCompare;
        break;
      case "contains":
        conditionMatch = value && value.includes(valueToCompare);
        break;
      case "doesnotcontain":
        conditionMatch = !value?.includes(valueToCompare);
        break;
      case "startswith":
        conditionMatch = value?.startsWith(valueToCompare);
        break;
      case "endswith":
        conditionMatch = value?.endsWith(valueToCompare);
        break;
      case "isempty":
      case "isnull":
        conditionMatch = !value;
        break;
      case "isnotempty":
      case "isnotnull":
        conditionMatch = value?.length > 0;
        break;
      case "gte":
        conditionMatch = value && value >= valueToCompare;
        break;
      case "gt":
        conditionMatch = value && value > valueToCompare;
        break;
      case "lte":
        conditionMatch = value && value <= valueToCompare;
        break;
      case "lt":
        conditionMatch = value && value < valueToCompare;
        break;
      default:
        break;
    }
  } catch (error) {
    console.error("Error occured while matching operator condition", error, value, valueToCompare, operator.operator);
  }

  return conditionMatch;
};
