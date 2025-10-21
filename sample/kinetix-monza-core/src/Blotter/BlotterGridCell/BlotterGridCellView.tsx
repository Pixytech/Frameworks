import { TABLE_COL_INDEX_ATTRIBUTE, useTableKeyboardNavigation } from "@progress/kendo-react-data-tools";
import { GridCustomCellProps } from "@progress/kendo-react-grid";
import { Checkbox } from "@progress/kendo-react-inputs";
import { ComponentType, useContext } from "react";
import { DataTypes, isDataTypeNumber } from "../../Data";
import { Helpers } from "../../Utils/Helpers";
import { IBlotterCellFormatCondition, IBlotterCellFormatOptions } from "../BlotterConfiguration";
import { BlotterContext } from "../BlotterContext";
import { executeOperator } from "../Utils/Operators";
import "./BlotterGridCellViewStyles.scss";
import { GridListCell } from "./GridListCell";
import { NULL_DATA } from "../Utils/constants";
export interface BlotterGridCustomCellProps extends GridCustomCellProps { }

export const BlotterGridCustomCellView = (props: BlotterGridCustomCellProps) => {
  const context = useContext(BlotterContext);
  const field = props.field || "";
  const value = props.dataItem[field];
  const navigationAttributes = useTableKeyboardNavigation(props.id);

  if (!context) {
    return null;
  }

  const column = context.datasetDefinition?.columns?.find((c) => c.name === props.field);
  const formats = column && context.model?.configuration.columnConfigs?.flatMap((x) => x.cellFormats!).filter((f) => f?.column.name === column.name);
  const fullRowFormats = context.model?.configuration.columnConfigs?.flatMap((x) => x.cellFormats!).filter((f) => f?.conditions?.some((c) => c.format?.applyToRow === true));

  const compareCondition = (condition: IBlotterCellFormatCondition, type: DataTypes | undefined, altValue: any = undefined): boolean => {
    const operator = condition.opretaor;

    let conditionValue;
    let altDisplayValue;
    if (condition.value?.value) {
      conditionValue = condition.value.value;
      altDisplayValue = condition.value.displayName;
    } else {
      conditionValue = condition.value;
      altDisplayValue = condition.value;
    }

    const itemValue = altValue ? altValue : value;
    let conditionMatch = false;

    if (type === DataTypes.enum) {
      if (operator.operator === "eq") {
        conditionMatch = executeOperator(operator, itemValue, conditionValue, type) || executeOperator(operator, itemValue, altDisplayValue, type);
      } else if (operator.operator === "neq") {
        conditionMatch = executeOperator(operator, itemValue, conditionValue, type) && executeOperator(operator, itemValue, altDisplayValue, type);
      } else {
        executeOperator(operator, itemValue, altDisplayValue, type);
      }
    } else {
      conditionMatch = executeOperator(operator, itemValue, conditionValue, type!);
    }

    return conditionMatch;
  };

  const prepareStyles = (format: IBlotterCellFormatOptions): any => {
    let styles = {};
    if (format?.textStyles?.bold) {
      styles = { ...styles, fontWeight: "bold" };
    }
    if (format?.textStyles?.italic) {
      styles = { ...styles, fontStyle: "italic" };
    }
    if (format?.textStyles?.underline) {
      styles = { ...styles, textDecoration: "underline" };
    }
    if (format?.textStyles?.strikethrough) {
      styles = { ...styles, textDecoration: "line-through" };
    }
    if (format?.textStyles?.textColor) {
      styles = { ...styles, color: format.textStyles.textColor };
    }
    if (format?.backgroundColor) {
      styles = { ...styles, backgroundColor: format.backgroundColor };
    }

    return styles;
  };

  const getStyles = (style?: React.CSSProperties): any => {
    let styles = style ?? {};
    if (fullRowFormats) {
      for (let rowFormat of fullRowFormats) {
        for (let condition of rowFormat.conditions) {
          let columnValue = props.dataItem[rowFormat.column.name + ""];
          let conditionMatch = compareCondition(condition, rowFormat.column.type, columnValue);

          if (conditionMatch) {
            let format = condition.format;

            if (format?.applyToRow) {
              styles = { ...styles, ...prepareStyles(format) };
            }
          }
        }
      }
    }

    if (formats) {
      for (let format of formats) {
        for (let cond of format.conditions) {
          let conditionMatch = compareCondition(cond, column?.type);
          if (conditionMatch) {
            let format = cond.format;
            if (format) {
              styles = { ...styles, ...prepareStyles(format) };
            }
          }
        }
      }
    }

    return styles;
  };

  const formatValue = (value: any, cellProps: BlotterGridCustomCellProps) => {
   
    if (column?.type === "date") {
      if (typeof value === "string" && value.includes("T")) {
        return Helpers.localeDateTime(value);
      }

      return value?Helpers.localeDate(value):value;
    } else if (column?.type && isDataTypeNumber(column?.type)) {
      return value?.toLocaleString({ maximumFractionDigits: 20 });
    } else {
      return value?.toLocaleString();
    }
  };

  if (props.rowType === "groupHeader") {
    return null;
  }

  const renderCellValue = (type: DataTypes | undefined, value: any, cellProps: BlotterGridCustomCellProps) => {
    switch (type) {
      case DataTypes.boolean:
        const colValue = value == true;
        return <Checkbox className="custom-column-checkbox" disabled={!value} checked={colValue} />;
      case DataTypes.list:
        if (Array.isArray(value)) {
          return <GridListCell {...props} />;
        } else {
          return formatValue(value, cellProps);
        }
      default:
        return formatValue(value, cellProps);
    }
  };

  if (value === undefined || value === NULL_DATA) {
    if (context.missingCellTemplate) {
      const Template = context.missingCellTemplate;
      return <Template {...props} />;
    }
    
  }

  return (
    context.model && (
      <td {...props.tdProps} style={getStyles(props.tdProps?.style)} colSpan={props.colSpan} role={"gridcell"} aria-colindex={props.ariaColumnIndex} aria-selected={props.isSelected} {...{ [TABLE_COL_INDEX_ATTRIBUTE]: props.columnIndex }} {...navigationAttributes}>
        {renderCellValue(column?.type, value, props)}
      </td>
    )
  );
};
