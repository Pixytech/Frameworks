import { FilterOperator as Operator } from "@progress/kendo-react-data-tools";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import {
  ComboBox,
  DropDownList,
  DropDownListChangeEvent,
} from "@progress/kendo-react-dropdowns";
import { Input, NumericTextBox } from "@progress/kendo-react-inputs";
import { useState } from "react";
import { isDate } from "lodash";
import { BlotterColumnDefinition } from "../../..";
import { DataTypes, isDataTypeNumber } from "../../../../Data";

import CloseIcon from "../../../../resources/images/Close.svg";
import { getOperatorsByType } from "../../../Utils/Operators";
import { Helpers } from "../../../../Utils/Helpers";
import dayjs from "dayjs";

export interface IBlotterFilterRowProps {
  columns: BlotterColumnDefinition[];
  field: string;
  operator: Operator;
  value: any;
  onChange(
    field: string,
    fieldType: DataTypes,
    operator: Operator,
    value: any,
    oldField?: string
  ): void;
  onDelete(field: string): void;
}

export const BlotterFilterRow = (props: IBlotterFilterRowProps) => {
  const [column, setSelectedColumn] = useState<BlotterColumnDefinition>(
    props.columns.find((col) => col.name === props.field)!
  );
  const [operator, setOperator] = useState<Operator>(props.operator);
  const [value, setValue] = useState<any>(props.value);

  // useEffect(() => {
  //   const firstOperator = getFilterOperators(column.type)[0]
  //   setOperator(firstOperator!);
  // }, [column])

  const handleFieldChange = (e: DropDownListChangeEvent) => {
    const oldField = { ...column };
    setSelectedColumn(e.value);

    const newOperators = getOperatorsByType(e.value.type);
    const keepOperator = newOperators.some(
      (x) => x.operator === operator.operator
    );
    const keepValue = oldField.type === e.value.type;

    console.debug("Calling onChange for Field");
    props.onChange(
      e.value.name,
      e.value.type,
      keepOperator ? operator : newOperators[0],
      keepValue ? value : null,
      oldField.name
    );

    if (!keepValue) {
      setValue(null);
    }

    if (!keepOperator) {
      setOperator(newOperators[0]);
    }
  };

  const handleOperatorChange = (e: DropDownListChangeEvent) => {
    setOperator(e.value);
    console.debug("Calling onChange for Operator");
    props.onChange(column.name, column.type, e.value, value);
  };

  const handleValueChange = (value: any) => {
    if (
      column.type === DataTypes.enum &&
      value &&
      value.displayName &&
      value.value === undefined
    ) {
      value = { ...value, value: value.displayName };
    }

    setValue(value);

    if (isDate(value)) {
      value = dayjs(value).format("YYYY-MM-DD");
    }

    console.debug("Calling onChange for Value");
    props.onChange(column.name, column.type, operator, value);
  };

  const handleDeleteFilter = (column: BlotterColumnDefinition) => {
    props.onDelete(column.name);
  };

  const getValueComponent = (column: BlotterColumnDefinition) => {
    if (column.type === DataTypes.enum) {
      return (
        <ComboBox
          className="value"
          allowCustom={true}
          data={column.possibleValues}
          dataItemKey="value"
          textField="displayName"
          value={value}
          onChange={(e) => handleValueChange(e.value)}
        />
      );
    }

    if (column.type === DataTypes.date) {
      return (
        <DatePicker
          className="value"
          value={typeof value === "string" ? value? Helpers.parseDate(value):null : value}
          onChange={(e) => handleValueChange(e.value)}
        />
      );
    }

    if (isDataTypeNumber(column.type)) {
      return (
        <NumericTextBox
          className="value"
          value={value}
          onChange={(e) => handleValueChange(e.value)}
        />
      );
    }
    return (
      <Input
        className="value"
        value={value}
        onChange={(e) => handleValueChange(e.value)}
      />
    );
  };

  return (
    <div className="filter-row">
      <DropDownList
        className="fields"
        data={props.columns}
        dataItemKey="name"
        textField="displayName"
        value={column}
        onChange={handleFieldChange}
      />

      {column && (
        <DropDownList
          className="operators"
          data={getOperatorsByType(column.type)}
          textField="message"
          value={operator}
          onChange={handleOperatorChange}
        />
      )}
      {column && getValueComponent(column)}
      <img
        className="delete"
        src={CloseIcon}
        height="0.75rem"
        onClick={() => handleDeleteFilter(column)}
        title="Delete filter"
      />
    </div>
  );
};
